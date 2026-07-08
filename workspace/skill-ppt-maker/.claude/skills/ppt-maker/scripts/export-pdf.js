#!/usr/bin/env node
/**
 * HTML 슬라이드 덱 -> PDF 변환
 * 사용법: node export-pdf.js <input.html> <output.pdf>
 *
 * deck-engine.css의 body.print-mode 규칙을 이용해 슬라이드를
 * absolute 배치에서 순차 배치로 전환한 뒤, @page 크기(1280x720px)에
 * 맞춰 슬라이드 1장 = PDF 1페이지로 변환한다.
 */
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg || !outputArg) {
    console.error('사용법: node export-pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }

  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg);
  const fileUrl = 'file:///' + inputPath.replace(/\\/g, '/');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // 웹폰트 로딩 완료 대기 (미대기 시 PDF에서 폰트가 시스템 기본값으로 깨질 수 있음)
    await page.evaluate(() => document.fonts && document.fonts.ready);

    // print-mode로 전환: 모든 슬라이드를 순차 배치하고 등장 애니메이션을 즉시 표시 상태로 고정
    await page.evaluate(() => {
      document.body.classList.add('print-mode');
      document.querySelectorAll('.slide').forEach((slide) => slide.classList.add('active'));
    });

    await page.emulateMedia({ media: 'print' });

    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true, // deck-engine.css의 @page { size: 1280px 720px } 규칙을 따름
    });

    console.log('PDF 생성 완료:', outputPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('PDF 변환 실패:', err);
  process.exit(1);
});
