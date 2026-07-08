#!/usr/bin/env node
/**
 * HTML 슬라이드 덱 -> 편집 가능한 PPTX 변환 (하이브리드 방식)
 * 사용법: node export-pptx.js <input.html> <output.pptx>
 *
 * RESEARCH.md의 "Export 변환 파이프라인" 결론에 따른 하이브리드 전략:
 *  - 텍스트(h1-h6, p, ul/ol)는 pptxgenjs addText로 네이티브 텍스트박스 생성 -> PPT에서 편집/선택 가능
 *  - 단색 배경 도형(div)은 addShape(rect/ellipse)로 네이티브 도형 생성
 *  - svg/table/img, 그라디언트·그림자가 있는 div는 스크린샷 크롭 -> addImage로 이미지 삽입
 *
 * 한계: 휴리스틱 기반 분류이므로 복잡하게 중첩된 커스텀 레이아웃은
 * 의도와 다르게 분류될 수 있다. 변환 후 실제 PowerPoint에서 육안 확인을 권장한다.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const PX_PER_IN = 96;
const px2in = (px) => px / PX_PER_IN;
const px2pt = (px) => Math.round(px * 0.75 * 10) / 10;

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function extractSlideModel(page) {
  return page.evaluate(() => {
    function rgbToHex(rgb) {
      const m = rgb && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (alpha === 0) return null; // 완전 투명은 배경 없음으로 취급
      return [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    const slide = document.querySelector('.slide.active');
    const slideRect = slide.getBoundingClientRect();
    const bgColor = rgbToHex(getComputedStyle(slide).backgroundColor);

    const claimed = [];
    const isClaimed = (el) => claimed.some((c) => c !== el && c.contains(el));
    const items = [];
    const all = slide.querySelectorAll('*');

    all.forEach((el) => {
      if (isClaimed(el)) return;
      const tag = el.tagName;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;

      const rel = {
        x: rect.left - slideRect.left,
        y: rect.top - slideRect.top,
        w: rect.width,
        h: rect.height,
      };
      if (rel.x < -2 || rel.y < -2 || rel.x > slideRect.width || rel.y > slideRect.height) return;

      // 1) 이미지로 캡처해야 하는 요소: svg/table/img, 또는 그라디언트/그림자가 있는 div
      const isMediaTag = tag === 'svg' || tag === 'TABLE' || tag === 'IMG';
      const hasComplexBg = tag === 'DIV' && (cs.backgroundImage !== 'none' || cs.boxShadow !== 'none');
      const hasMediaDescendant = tag === 'DIV' && el.querySelector('svg, table, img');
      if (isMediaTag || hasComplexBg || (hasMediaDescendant && !el.closest('.__claimed_skip'))) {
        items.push({ role: 'image', ...rel, selector: null, el });
        claimed.push(el);
        return;
      }

      // 2) 텍스트 블록: 리스트는 통째로, 헤딩/문단은 개별로
      if (tag === 'UL' || tag === 'OL') {
        const liTexts = Array.from(el.children).map((li) => li.textContent.trim()).filter(Boolean);
        if (liTexts.length) {
          items.push({
            role: 'list', ...rel, items: liTexts,
            color: rgbToHex(cs.color) || '000000',
            fontSize: parseFloat(cs.fontSize),
            align: cs.textAlign,
          });
          claimed.push(el);
        }
        return;
      }
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'].includes(tag)) {
        const text = el.textContent.trim();
        if (!text) return;
        // 자기 자신 바로 위 부모가 이미 같은 텍스트만 갖고 있다면 중복이므로 스킵하지 않고 그대로 사용(단순화)
        items.push({
          role: 'text', ...rel, text,
          color: rgbToHex(cs.color) || '000000',
          fontSize: parseFloat(cs.fontSize),
          bold: parseInt(cs.fontWeight, 10) >= 600,
          align: cs.textAlign,
        });
        claimed.push(el);
        return;
      }

      // 3) 단색 배경 도형 (텍스트/미디어 자식이 없는 순수 장식용 div)
      if (tag === 'DIV') {
        const bg = rgbToHex(cs.backgroundColor);
        const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
        if (bg && !hasDirectText && !el.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,svg,table,img')) {
          const br = parseFloat(cs.borderTopLeftRadius) || 0;
          const isEllipse = br >= Math.min(rel.w, rel.h) / 2 - 1;
          items.push({ role: 'shape', ...rel, fill: bg, shape: isEllipse ? 'ellipse' : 'roundRect' });
          claimed.push(el);
        }
      }
    });

    return {
      width: slideRect.width,
      height: slideRect.height,
      bgColor,
      items: items.map(({ el, ...rest }) => rest), // DOM 참조는 evaluate 밖으로 못 나가므로 제거
    };
  });
}

async function main() {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg || !outputArg) {
    console.error('사용법: node export-pptx.js <input.html> <output.pptx>');
    process.exit(1);
  }

  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg);
  const fileUrl = 'file:///' + inputPath.replace(/\\/g, '/');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ppt-maker-'));

  const browser = await chromium.launch();
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'DECK', width: 13.333, height: 7.5 });
  pptx.layout = 'DECK';

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);

    // 프리뷰 스케일/센터링 제거 -> 1280x720 좌표계를 화면 좌표와 1:1로 정렬
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--preview-scale', '1');
      document.body.style.display = 'block';
      document.body.style.margin = '0';
      const vp = document.querySelector('.viewport');
      if (vp) { vp.style.transform = 'none'; vp.style.position = 'absolute'; vp.style.left = '0'; vp.style.top = '0'; }
    });

    const slideEls = await page.$$('.slide');
    const total = slideEls.length;
    console.log(`총 ${total}개 슬라이드 변환 시작`);

    for (let i = 0; i < total; i++) {
      await page.evaluate((idx) => {
        document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx));
      }, i);

      const model = await extractSlideModel(page);
      const pptxSlide = pptx.addSlide();
      if (model.bgColor) pptxSlide.background = { color: model.bgColor };

      // 이미지로 분류된 요소부터 크롭 캡처 (DOM 좌표 기준으로 다시 요소를 찾아 screenshot)
      let imgCounter = 0;
      for (const item of model.items) {
        const x = px2in(item.x), y = px2in(item.y), w = px2in(item.w), h = px2in(item.h);

        if (item.role === 'text') {
          pptxSlide.addText(item.text, {
            x, y, w, h,
            fontSize: px2pt(item.fontSize),
            color: item.color,
            bold: item.bold,
            align: item.align === 'center' ? 'center' : item.align === 'right' ? 'right' : 'left',
            valign: 'top',
            fontFace: 'Malgun Gothic',
          });
        } else if (item.role === 'list') {
          pptxSlide.addText(
            item.items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
            {
              x, y, w, h,
              fontSize: px2pt(item.fontSize),
              color: item.color,
              valign: 'top',
              fontFace: 'Malgun Gothic',
            }
          );
        } else if (item.role === 'shape') {
          pptxSlide.addShape(item.shape, { x, y, w, h, fill: { color: item.fill }, line: { type: 'none' } });
        } else if (item.role === 'image') {
          // 해당 좌표 영역을 다시 스크린샷으로 크롭
          const imgPath = path.join(tmpDir, `slide${i}_img${imgCounter++}.png`);
          await page.screenshot({
            path: imgPath,
            clip: { x: item.x, y: item.y, width: item.w, height: item.h },
          });
          pptxSlide.addImage({ path: imgPath, x, y, w, h });
        }
      }

      console.log(`슬라이드 ${i + 1}/${total} 변환 완료 (요소 ${model.items.length}개)`);
    }

    await pptx.writeFile({ fileName: outputPath });
    console.log('PPTX 생성 완료:', outputPath);
  } finally {
    await browser.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('PPTX 변환 실패:', err);
  process.exit(1);
});
