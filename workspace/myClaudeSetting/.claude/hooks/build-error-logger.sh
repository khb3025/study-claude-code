#!/bin/bash
# PostToolUse hook: gradlew 빌드 실패 시 에러 로그 기록
# 팀 공유용 — .claude/settings.json 의 PostToolUse 훅에서 호출됨

INPUT=$(cat)

# Python으로 JSON 파싱 (jq 없이도 동작, macOS/Linux/Windows Git Bash 모두 호환)
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)

OUTPUT=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_response', {}).get('output', ''))
except:
    print('')
" 2>/dev/null)

# gradlew 명령이 아니면 종료
if [[ "$COMMAND" != *"gradlew"* ]]; then
    exit 0
fi

# BUILD FAILED 가 없으면 종료 (성공한 빌드)
if ! echo "$OUTPUT" | grep -q "BUILD FAILED"; then
    exit 0
fi

# 로그 디렉토리: jar 생성 위치(build/libs) 하위 buildError 폴더
LOG_DIR="build/libs/buildError"
mkdir -p "$LOG_DIR"

DATE=$(date +%Y%m%d)
LOG_FILE="$LOG_DIR/error-${DATE}.log"

# 에러 내용 append
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
{
    echo "============================================================"
    echo "[${TIMESTAMP}] BUILD FAILED"
    echo "Command: ${COMMAND}"
    echo "============================================================"
    echo "$OUTPUT"
    echo ""
} >> "$LOG_FILE"

# 2주(14일) 지난 로그 파일 삭제
find "$LOG_DIR" -name "error-*.log" -mtime +14 -delete 2>/dev/null

exit 0
