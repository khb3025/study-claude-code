#!/bin/bash
# PreToolUse hook: main 브랜치 push/merge 전 Spring Boot 빌드 검증
# 빌드 실패 시 push/merge 취소 + build-error-logger.sh 와 동일한 위치/형식으로 로그 기록

INPUT=$(cat)

# 명령어 추출
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)

# push 또는 merge 명령인지 확인
IS_PUSH=false
IS_MERGE=false
[[ "$COMMAND" == *"git push"* ]] && IS_PUSH=true
[[ "$COMMAND" == *"git merge"* ]] && IS_MERGE=true

if [[ "$IS_PUSH" == "false" ]] && [[ "$IS_MERGE" == "false" ]]; then
    exit 0
fi

# main 브랜치 대상인지 확인
TARGETS_MAIN=false
[[ "$COMMAND" == *"main"* ]] && TARGETS_MAIN=true

# push인데 main이 명시 안 됐으면 현재 브랜치로 판단
if [[ "$TARGETS_MAIN" == "false" ]] && [[ "$IS_PUSH" == "true" ]]; then
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    [[ "$CURRENT_BRANCH" == "main" ]] && TARGETS_MAIN=true
fi

if [[ "$TARGETS_MAIN" == "false" ]]; then
    exit 0
fi

# Spring Boot 프로젝트인지 확인 (gradlew 또는 build.gradle 존재 여부)
if [[ ! -f "gradlew" ]] && [[ ! -f "build.gradle" ]] && [[ ! -f "build.gradle.kts" ]]; then
    exit 0
fi

echo "================================================================"
echo " [pre-push] Spring Boot 프로젝트 감지 -> 빌드 검증 시작"
echo "================================================================"
echo ""

# 빌드 실행 (테스트 포함)
BUILD_OUTPUT=$(./gradlew build 2>&1)
BUILD_EXIT_CODE=$?

if [[ $BUILD_EXIT_CODE -ne 0 ]]; then
    # 에러 로그 기록 - build-error-logger.sh 와 동일한 위치/형식
    LOG_DIR="build/libs/buildError"
    mkdir -p "$LOG_DIR"
    DATE=$(date +%Y%m%d)
    LOG_FILE="$LOG_DIR/error-${DATE}.log"
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    {
        echo "============================================================"
        echo "[${TIMESTAMP}] PRE-PUSH BUILD FAILED"
        echo "Command: ${COMMAND}"
        echo "============================================================"
        echo "$BUILD_OUTPUT"
        echo ""
    } >> "$LOG_FILE"

    # 커맨드창 출력
    echo ""
    echo "================================================================"
    echo " [FAILED] 빌드 실패 -> push/merge 취소"
    echo "----------------------------------------------------------------"
    echo " 원인: 테스트 실패 또는 컴파일 오류"
    echo " 로그: $LOG_FILE"
    echo "================================================================"
    echo ""

    # stderr 로 Claude 에게도 전달 (Claude가 실패 원인 인식)
    echo "[pre-push] 빌드 실패로 push/merge 가 취소되었습니다. 로그: $LOG_FILE" >&2

    exit 2
fi

echo ""
echo "================================================================"
echo " [SUCCESS] 빌드 성공 -> push/merge 진행"
echo "================================================================"
echo ""
exit 0
