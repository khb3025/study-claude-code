---
description: '파일의 변경사항을 IntelliJ diff 뷰어로 보여줍니다.'
allowed-tools:
  [
    'Bash(git diff:*)',
    'Bash(git difftool:*)'
  ]
---
## 사용법 

1. /git diff $1 $2
2. /git diff $1 
3. /git diff 
4. /git diff $1 $2 -- $3

## 프로세스

1. 사용법 1
   - $1 : 비교 주체가 되는 git log 
   - $2 : 비교 대상이 되는 git log 
2. 사용법 2
   - $1 : 비교 대상이 되는 git log 
3. 사용법 3
   - 인자가 없을경우 현재 head와 직전 commit 비교 
4. 사용법 4
   - $1 : 비교 주체가 되는 git log 
   - $2 : 비교 대상이 되는 git log 
   - $3 : 비교 대상이 되는 파일만 비교

## 실행 규칙

- 특정 파일($3)이 지정된 경우:
  `git difftool --tool=intellij -y $1 $2 -- $3`

- 커밋 범위 비교($1, $2)인 경우:
  `git difftool --tool=intellij --dir-diff $1 $2`
  IntelliJ에서 변경된 파일 목록이 폴더 비교 형태로 열림

- HEAD vs 직전 커밋(인자 없음):
  `git difftool --tool=intellij --dir-diff HEAD~1 HEAD`

- HEAD vs 지정 커밋($1만 있는 경우):
  `git difftool --tool=intellij --dir-diff $1 HEAD`

## 참고사항

1. IntelliJ diff 창이 열리면 좌측에 변경 파일 목록, 클릭 시 좌우 비교 뷰가 표시됩니다.
2. `--dir-diff` 옵션으로 변경된 모든 파일을 한 번에 열어줍니다.
