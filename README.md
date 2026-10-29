# 내 보안 Agent 시작 틀 0.2.21

이 보안 Agent는 회사 직원이 자기 로그인 상태, 업무 앱 접속 결과, 최근 접속 기록과 보안 경보를 보는 보안 앱입니다. 13단계부터 22단계까지 이 프로젝트 하나로 화면을 채워 가며 완성합니다. 처음이라면 docs/GETTING_STARTED_STUDENT.md부터 읽습니다. 무엇을 왜 만드는지와 단계별 순서가 그 문서에 있습니다.

이 시작 틀을 받은 것만으로 단계를 통과하지 않습니다. 단계마다 docs/STUDENT_PROMPTS.md의 안내를 수업용 AI에 붙여 넣어 student/extension.mjs를 고치고, 화면에서 확인하고, 커밋한 뒤 ALEPH에 제출합니다. 제출하면 서버가 그 커밋의 코드를 받아 AI가 단계 과제 기준으로 읽고 판정합니다. 코드를 실행해서 판정하지 않습니다.

## 켜기

검수 환경은 Node.js 24.19.0이며 외부 npm 의존성이 없습니다. 이 폴더의 PowerShell에서 아래를 실행하고 PC 브라우저로 http://127.0.0.1:5189 를 엽니다. 자세한 켜기·끄기·다시 켜기는 docs/STUDENT_LAUNCH_GUIDE.md에 있습니다.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

npm start도 같은 서버를 켭니다. 기본 실행은 실제 회사 시스템(기존 엔진)에 연결되지 않은 상태입니다. npm run demo는 예제 자료로 화면을 보여 줄 뿐이며 실제 연결이나 성취가 아닙니다. npm run check는 student/extension.mjs의 문법만 확인합니다.

## 지킬 것

- 기존 1~3차 프로젝트와 학생 파일은 지우거나 덮어쓰지 않습니다. 새 폴더에서 시작하거나, 이미 하던 프로젝트를 이어 씁니다.
- AI 열쇠·비밀번호·토큰을 코드, 커밋, 캡처, 도움정보에 넣지 않습니다. 주소나 열쇠를 직접 입력하는 칸도 만들지 않습니다.
- .env.example에는 비밀 없는 설정만 있습니다.

## 더 읽을 곳

- 단계별 안내와 AI에 붙여 넣을 문장: docs/STUDENT_PROMPTS.md
- 단계별 확인 항목: docs/CURRICULUM.json, docs/IMPLEMENTATION_CONTRACT.md
- 오류 코드별 해결: docs/CONNECTION_TROUBLESHOOT.md
- 시작 틀 업데이트(내 파일 보존): docs/STARTER_UPDATE.md
- 실제 회사 시스템(SDP)·앱 안 AI 연결은 담당자가 따로 안내할 때만 씁니다: docs/SDP_HOST_CONNECTION.md, docs/AI_SETUP_GUIDE.md. 이 연결은 앱을 처음 켜고 13~16단계 화면을 만들거나 공식 AI 코드 판정을 받기 위한 전제 조건은 아닙니다. 다만 17단계 이후의 실제 연결과 새 환경 재현은 해당 단계의 기준에 따라 따로 확인합니다.


---

## 학생 개인 완성본: 노예 0.2.21

이 브랜치는 인증된 22단계 `main`과 구별되는 **개인 완성본 작업 브랜치**입니다. 제공 시작 틀 0.2.21에 `student/extension.mjs` 등의 개인 UI와 읽기 전용 PC 현황 화면을 통합했습니다.

- 사용자 측 직접 점검(2026-10-29): Windows에서 일반 모드 실행, 네이티브 계정과 AI 앱 승인, `verified` 모델 1개 확인. 이는 해당 시각 기준이며 다른 PC에서 자동으로 승인된다는 뜻이 아닙니다.
- 코드 점검: 중요한 JS 5개 파일 Node 구문 검사 통과, 격리된 Linux 예제 모드에서 로컬 첫 화면과 `/api/pc/status` 응답 확인. Linux 결과는 Windows 기능의 운영 검증이 아닙니다.
- 실제 SDP 서버 인증서가 교육생에게 발급되지 않아 실제 접속 기록·기기·세션 및 XDR 조회는 기본 실행 시 `ENGINE_NOT_CONNECTED`로 안내됩니다. 이 표시를 정상 빈 목록이나 XDR 조회 성공으로 간주하지 않습니다.
- AI 모델 목록 확인은 실제 사건 AI 설명 성공을 의미하지 않습니다. 사건 설명 기능의 실제 운영 검증은 미실행입니다.
- 기존 단계 21·22 문서는 이전 수업 판정 시점의 기록으로 그대로 보존합니다. 개인 완성본 추가 검증은 [docs/NOE_FINAL_RELEASE_0_2_21.md](docs/NOE_FINAL_RELEASE_0_2_21.md)에서 확인합니다.
- 이번 마무리 제출은 저장소 주소와 **정확한 마지막 커밋 40자리**만 제출하며, `npm run package-app`이나 `setup.exe`는 만들 필요가 없습니다.
- 캐릭터 이미지는 사용자가 제공한 개인 테마 자료가 포함되어 있습니다. 원저작권과 재배포·상업적 사용 권한을 별도로 확인해야 합니다.
