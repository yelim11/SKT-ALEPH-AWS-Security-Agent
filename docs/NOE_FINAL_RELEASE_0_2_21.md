# 노예 · 0.2.21 개인 완성본 점검 및 제출 안내

## 출처와 범위
- 공식 자료: `alekov-starter-0.2.21.zip`의 `on-client/` 원본 소스(제공판 0.2.21).
- 개인 수정 자료: 사용자가 2026-10-29에 내보낸 `noe-0.2.21-source-only-20261029-103738.zip`의 10개 텍스트 파일.
- 개인 캐릭터 이미지 `noe-hachi-glasses.webp`, `alekov-ai-explain.webp`, `alekov-app-icon.webp`는 기존 개인 GitHub 브랜치에 있던 바이트 그대로 유지합니다. 신규 배포 묶음에서는 원본 두 이미지를 덮어쓰지 않습니다.
- 대상 브랜치: `final-week/noe-0.2.21-final`. 이 브랜치는 인증된 `main`과 원래 `final-week/chiikawa-personal`을 변경하지 않습니다.
- `src/local-pc-health.mjs`는 0.2.11 개인 실험에 사용한 구버전 엔드포인트이며 공식 0.2.21의 `src/pc-status.mjs` 및 `/api/pc/status`로 대체되므로 최종 브랜치에서 제거합니다.

## 정확히 확인된 항목
- 사용자가 Windows 11/Node v24.21.0에서 실행한 읽기 전용 점검: 앱 버전 0.2.21, 핵심 구성요소 9/9, 주요 JavaScript 4/4 문법 통과, 일반 실행 모드(`Demo:NO`), SDP 실행 설정 없음.
- 별도로 합친 동일 소스를 Linux 격리 환경에서 Node 문법 검사(5개) 실행하여 통과.
- Linux 격리 환경에서 `node src/server.mjs --demo`로 시작해 `/`, `/app.js`, `/style.css`, `/pc-status-view.mjs`, `/api/pc/status`, `/api/diagnostics` HTTP 200을 관찰. **이 예제 모드는 실제 보안 탐지·운영 AI 연결을 검증하지 않습니다.**
- 사용자 제공 10개 소스 파일에 대한 대표적 비밀값 패턴(PEM, JWT, GitHub/OpenAI/AWS 키) 검사에서 일치 항목이 없었음. 모든 비밀 누출 가능성을 증명하는 검사는 아닙니다.

## 운영 기능의 경계
- 공식 ALEPH 수업 안내(2026-10-29): SDP 개인 인증서는 학생에게 발급하지 않으며 `ENGINE_NOT_CONNECTED`는 기본 실행에서 정상일 수 있습니다. 수업의 코드 심사 통과와 실제 보안 서버 운영 연결은 다릅니다.
- `verified, modelCount=1`은 해당 시각의 AI 앱 인증과 모델 목록 응답 검증이며 **AI 사건 요약의 실행 성공을 의미하지 않습니다**.
- 읽기 전용 로컬 Windows 현황은 별도 API로 수집되며, 경고·오류 건수는 XDR 사건이나 침입 탐지 점수가 아닙니다.
- 외부 인증서/토큰/개인키/Native Host 자격/SDP 자격은 이 저장소에 포함하지 않습니다.
- 과제 판정 당시 `docs/STUDENT_FINAL_HANDOFF.md`, `docs/STUDENT_RELEASE_RECORD.json`은 과거 통과 시점의 기록으로 보존합니다. 이 문서는 별도 개인 완성본 변경 사항을 설명합니다.

## 재현 절차
1. Windows PowerShell + Node.js 22–24(교육 기준 24.19.0, 사용자 환경 24.21.0) + Git 사용.
2. 해당 브랜치의 저장소 최상위에서 `npm run check`.
3. `powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1` (실제 모드, `-Demo` 없음).
4. 브라우저에서 `http://127.0.0.1:5189/` 확인. PC 현황은 지원하는 Windows 시스템에서만 실제 값으로 표시하며 권한 제한은 확인 불가로 처리.
5. 앱 승인·모델 점검은 사용자가 직접 승인해야 하며 현재 사용자와 서비스의 권한에 따라 다름.
6. 제출할 저장소의 `git rev-parse HEAD`가 반환하는 40자리를 ALEPH 마무리 제출의 커밋 칸에 사용.

## 최종 사용자 직접 확인할 항목
- Windows 일반 모드 시작/종료/재실행, 홈/PC 상태/보안 기록/AI 연결/설정 메뉴를 키보드와 마우스로 이동.
- PC 사용량 갱신·실패/권한 부족 시 확인 불가 표시, 마지막 측정 시각 확인.
- 보안 기록과 세션/기기는 SDP 연결이 없을 때 실패 이유를 보여 주고 허위 데이터를 표시하지 않음.
- 새 GitHub 브랜치에서 fresh clone 후 `npm run check`와 앱 시작 성공 확인.
- 캐릭터 이미지 출처와 공개 저장소 재배포 권한 별도 확인.

**이번 최종 브랜치의 신규 자동 시험은 릴리스 완전 검증을 뜻하지 않습니다. 실제 PC에서 최종 커밋 재현한 결과는 사용자 확인 후 기록해야 합니다.**
