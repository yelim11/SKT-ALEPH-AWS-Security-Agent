# 노예 보안 Agent · 학생 실행 설명서와 시스템 구성도

> 이 문서는 21단계 학생 작성 문서입니다. 제공 문서를 덮어쓰지 않고, 현재 저장소의 package.json, .env.example, tools/start-alekov.ps1, src/server.mjs, public/index.html, student/extension.mjs를 기준으로 작성했습니다.
>
> ALEPH에서 정한 내 Agent 이름은 **노예**입니다. 제공 UI의 HTML 제목과 기본 제품명은 여전히 **케셰브(KESHEV)**입니다. public/index.html은 제공 코드이므로 이름을 맞추기 위해 수정하지 않았습니다.

## 1. 목적

이 프로젝트는 사용자가 자기 로그인·기기·세션 상태, 업무 앱 접근 판정, 본인 보안 기록과 XDR 경보, AI 사건 설명, 조치 요청 상태, 설치 패키지의 OSV 조회 결과를 확인하는 로컬 보안 Agent입니다.

학생이 작성한 화면 로직은 student/extension.mjs에 있고, 서버·기본 화면·접근 제어 연결·AI 연결·조치 연결·OSV 조회 모듈은 제공 코드입니다. 학생 화면은 제공 시스템의 결과를 표시하며, 접근 허용·AI 승인·보안 조치 집행·취약점 판정을 새로 만들어 내지 않습니다.

## 2. 현재 저장소에서 확인한 실행 환경

| 항목 | 현재 원문에서 확인한 값 | 확인 수준 |
|---|---|---|
| Node.js | package.json engines: **24.19.0** | 원문 확인 |
| 실행 가능 범위 | 실행 스크립트는 Node.js **22~24**를 허용하고 24.19.0을 수업 기준으로 안내 | 원문 확인 |
| 외부 npm 의존성 | package.json에 dependencies/devDependencies 없음 | 원문 확인 |
| 기본 포트 | 5189 | 원문 확인 |
| 기본 브라우저 주소 | http://127.0.0.1:5189/ | 원문 확인 |
| 기본 실행 명령 | powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 | 원문 확인 |
| 대체 실행 명령 | npm start → node src/server.mjs | 원문 확인 |
| 데모 | npm run demo → 예제 자료. 실제 연결 성공이 아님 | 원문 확인 |
| 학생 파일 문법 확인 | npm run check → node --check student/extension.mjs | 원문 확인 |
| 이 대화에서 새 PowerShell 창으로 실제 재실행 | 실행하지 않음 | **미확인** |

이 저장소 루트에는 현재 package-lock.json이 없습니다. 20단계 취약점 스캐너는 이 앱 자체의 lock을 자동으로 가정하지 않고, 담당자가 ON_PROJECT_DIRECTORY로 지정한 **검사 대상 프로젝트**의 package-lock.json과 설치된 node_modules/*/package.json을 대조합니다.

## 3. 폴더 구조와 작업 위치

현재 GitHub 저장소 루트가 앱 실행 폴더입니다. 다음 파일이 함께 있는 위치에서 PowerShell을 엽니다.

~~~text
SKT-ALEPH-AWS-Security-Agent/
├─ package.json
├─ .env.example
├─ tools/
│  └─ start-alekov.ps1
├─ public/
│  ├─ index.html
│  ├─ app.js
│  └─ vulnerabilities-view.mjs
├─ src/
│  ├─ server.mjs
│  ├─ engine.mjs
│  ├─ engine/
│  ├─ connection/
│  ├─ ai/
│  ├─ actions/
│  └─ vulnerabilities/
├─ student/
│  └─ extension.mjs
└─ docs/
   └─ STUDENT_RUNBOOK.md
~~~

공식 제공 안내에서는 이 실행 폴더를 on-client라고 부릅니다. 현재 저장소에서는 package.json과 tools/start-alekov.ps1이 저장소 루트에 있으므로 **그 루트에서** 명령을 실행합니다.

## 4. 처음 실행하기

### 4.1 PowerShell 열기

1. 저장소 루트 폴더를 파일 탐색기로 엽니다.
2. 주소 표시줄에 powershell을 입력하고 Enter를 누릅니다.
3. 현재 폴더에 package.json, tools\start-alekov.ps1, src\server.mjs가 있는지 확인합니다.

### 4.2 실행

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
~~~

실행 스크립트가 정상적으로 서버 응답까지 확인하면 다음 두 문장을 출력하도록 구현돼 있습니다.

~~~text
케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.
서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.
~~~

이 문구는 **로컬 HTTP 서버가 응답했다는 뜻**입니다. SDP 연결, ALEPH 계정 연결, AI 앱 승인, 모델 조회, AI 사건 설명, 조치 집행 성공을 뜻하지 않습니다.

### 4.3 브라우저

브라우저에서 다음 주소를 엽니다.

~~~text
http://127.0.0.1:5189/
~~~

제공 화면의 주 메뉴는 보호 현황 / 업무 앱 / 보안 기록 세 개입니다.

## 5. 종료와 재실행

### 종료

앱을 실행한 PowerShell 창에서 Ctrl+C를 누릅니다.

### 재실행

같은 저장소 루트에서 다시 다음 명령을 실행합니다.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
~~~

포트 5189가 이미 사용 중이면 실행 스크립트가 다른 포트를 사용하라고 안내합니다. 예시는 다음과 같습니다.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5190
~~~

이 경우 브라우저 주소도 http://127.0.0.1:5190/처럼 같은 포트로 바꿉니다.

## 6. 설정과 비밀값 경계

.env.example의 공개 가능한 예시는 다음 역할만 설명합니다.

| 이름 | 의미 | 기본/예시 |
|---|---|---|
| ON_PORT | 로컬 앱 서버 포트 | 5189 |
| ON_ENGINE_ADAPTER | 기존 접근 제어/XDR 엔진 어댑터 경로 예시 | ./student/engine-adapter.mjs |
| ON_AI_MODEL | 담당자 정책이 허용한 AI 모델 ID 예시 | aleph/auto |
| ON_PROJECT_DIRECTORY | 20단계에서 검사할 별도 프로젝트의 절대 경로 | 기본 빈 값 |
| ON_APPROVED_PUBLIC_PACKAGES | 외부 OSV 조회가 허용된 공개 npm 이름 목록 | 기본 [] |

학생 문서에는 토큰·비밀번호·API 키·개인키·확인 티켓을 적지 않습니다. 실제 SDP/AI 연결에 필요한 개인 설정은 담당자가 별도로 안내한 파일을 사용하며, Git 저장소와 제출물 밖에 둡니다.

## 7. 시스템 구성도

~~~mermaid
flowchart LR
    B["브라우저<br/>http://127.0.0.1:5189/<br/>public/app.js + student/extension.mjs"]
    L["로컬 앱 서버<br/>src/server.mjs"]
    E["접근 제어·XDR 시스템<br/>src/engine.mjs + src/engine/*"]
    A["AI 게이트웨이 연결<br/>src/connection/* + src/ai/*"]
    X["조치 처리 연결<br/>src/actions/*"]
    V["패키지 검사·OSV 조회<br/>src/vulnerabilities/*"]
    O["OSV 공개 API<br/>https://api.osv.dev/v1/querybatch"]

    B <--> L
    L --> E
    L --> A
    L --> X
    L --> V
    V --> O
~~~

### 데이터 흐름 설명

1. 브라우저는 public/index.html과 public/app.js를 로컬 서버에서 받습니다.
2. 제공 UI는 서버 API를 호출하고, 검증한 결과를 학생 표시 함수에 넘깁니다.
3. student/extension.mjs는 받은 상태를 DOM으로 표시합니다. 접근 제어·AI 요청·조치 집행·OSV 네트워크 요청을 학생 함수가 직접 수행하지 않습니다.
4. 접근 제어와 XDR 데이터는 src/engine.mjs 및 src/engine/* 경계를 통해 기존 시스템에 연결됩니다. 기본 실행에서는 실제 기존 시스템 연결이 확인되지 않은 상태가 정상일 수 있습니다.
5. AI 연결은 src/connection/*, src/ai/*를 통해 처리됩니다. 로컬 서버가 켜진 것만으로 AI 연결 성공이 아닙니다.
6. 조치 요청은 src/actions/*가 담당합니다. 19단계 학생 함수는 준비·ACK·효과 관측 상태를 표시할 뿐 직접 POST나 집행을 만들지 않습니다.
7. OSV 조회는 src/vulnerabilities/project-scan.mjs와 src/vulnerabilities/osv.mjs가 담당합니다. 승인된 공개 패키지만 고정 OSV endpoint로 조회합니다.

## 8. 제공 코드와 학생 작성 부분

| 구분 | 파일/기능 | 현재 역할 |
|---|---|---|
| 제공 | public/index.html | 메뉴, 버튼, 학생 표시 영역 등 기본 UI |
| 제공 | public/app.js | 서버 요청, 새로고침, 취소, 상태 전달, 학생 렌더 함수 호출 |
| 제공 | src/server.mjs | 로컬 HTTP 서버와 API 경계 |
| 제공 | src/engine.mjs, src/engine/* | 접근 제어·XDR 원천 연결 |
| 제공 | src/connection/*, src/ai/* | 계정/AI 연결 및 AI 응답 검증 |
| 제공 | src/actions/* | 조치 준비·사람 확인·원천 결과 확인 |
| 제공 | src/vulnerabilities/* | 설치 버전 검증과 OSV 조회 |
| 제공 | tools/start-alekov.ps1 | Node/폴더/포트 확인 및 서버 실행 |
| 학생 | student/extension.mjs | 13~20단계 학생 표시 로직 |
| 학생 | docs/STUDENT_RUNBOOK.md | 21단계 실행 설명서와 글로 쓴 구성도 |

## 9. 학생 구현 함수

| 함수 | 단계 | 표시하는 내용 |
|---|---:|---|
| renderIdentity | 13 | 현재 사용자·기기·세션과 기기/세션 목록의 상태 |
| renderDecision | 14 | 업무 앱 접근의 allow/deny/challenge/unknown, 이유, 확인 시각 |
| renderEvents | 15 | 본인 접속/XDR 기록 정렬·필터·근거·규칙·현재 상태 |
| renderStatus | 16 | 기기·세션 상태, 알림, 안전한 진단 도움정보와 오류 안내 |
| renderAiConnection | 17 | AI 연결 점검 상태와 실패 이유. 모델 목록 점검과 사건 설명을 구분 |
| renderExplanation | 18 | 선택 사건의 AI 설명을 사건 ID·근거 ID·규칙·현재 상태에 결속 |
| renderAction | 19 | 준비·사람 확인·전송·ACK·효과 관측·unknown을 서로 구분 |
| renderVulnerabilities | 20 | 정확한 설치 버전, OSV 출처·시각·취약점 ID, 미조회·부분 실패 구분 |

## 10. 실제 화면의 주요 버튼

문서 작성 시 public/index.html 원문과 대조한 버튼 이름입니다.

### 보호 현황

- 다시 불러오기
- 도움정보 불러오기
- 확인했으며 복사합니다
- 계정 연결 시작
- 계정 확인 페이지 열기
- 로그인 확인 완료
- 현재 로그인 확인
- 계정 연결 취소
- AI 연결 시작
- 승인 페이지 열기
- 승인했으며 연결 확인
- 상태 다시 확인
- 연결 취소
- 현재 API 연결 점검
- AI 연결 점검
- AI 연결 점검 취소
- 설치 패키지 조회
- 패키지 조회 취소

### 보안 기록 / 조치

- AI 설명 취소
- 대상과 조치를 확인했으며 집행합니다
- 원천 결과만 재조회
- 조치 화면 취소

조치 화면 취소는 이미 서버에 전달된 조치 효과를 되돌리는 기능이 아닙니다.

## 11. 오류가 생겼을 때 확인 순서

| 화면/오류 | 코드와 연결되는 실제 처리 | 확인 순서 |
|---|---|---|
| 서버가 안 켜짐 | tools/start-alekov.ps1가 Node 버전·폴더·포트·응답을 확인 | PowerShell 위치 → Node 버전 → 포트 사용 여부 → 창의 첫 오류 메시지 순서로 확인 |
| ENGINE_NOT_CONNECTED | 기존 서버·에이전트 연결 확인 불가 | 기본 미연결 실행인지 확인 → 담당자가 SDP 설정을 안내한 환경인지 확인 → 임의 설정 생성 금지 |
| ENGINE_RESULT_UNVERIFIED | 원천 응답을 검증할 수 없음 | 정상으로 간주하지 않고 도움정보 불러오기로 비밀 없는 진단 확인 |
| REQUEST_TIMEOUT | 요청 시간 초과 | 자동 성공/실패로 판단하지 말고 현재 화면에서 사용자가 직접 재조회 |
| ON_AI_PROVISIONING_PENDING | AI 앱 권한 준비 중 | 계정 연결과 앱 승인 상태 확인 → 담당자 확인 |
| WB_CLCO_AUTH_REQUIRED | AI 앱 인증 확인 필요 | 키를 복사하지 말고 계정 연결·앱 승인 상태와 도움정보 확인 |
| AI unknown | 연결/응답 결과 불명 | 성공으로 간주하지 않고 현재 상태를 직접 다시 확인 |
| 조치 pending | 서버 ACK·처리 중 | ACK를 효과 확인으로 보지 않고 원천 결과만 재조회 사용 |
| 조치 unknown | 효과 확인 불가 | 성공/효과 없음 모두 단정하지 않고 결과만 재조회 |
| 패키지 not_configured | 검사 대상 프로젝트 설정 미준비 | 담당자가 ON_PROJECT_DIRECTORY 등 대상 설정을 준비했는지 확인 |
| 패키지 not_checked | 승인된 공개 조회 대상 없음 | 외부 조회 0건 상태로 이해. 임의로 허용 목록 확대 금지 |
| 패키지 partial / unverifiable | 일부 또는 전체 조회 검증 실패 | 이미 받은 취약점 ID는 유지하고, 취약점 없음으로 해석하지 않음 |

오류를 해결하기 위해 학생이 비밀번호·토큰·API 키를 채팅, Git, README, 화면 캡처에 넣으면 안 됩니다.

## 12. 확인한 기능과 미확인 기능

### 원문과 모의 입력으로 확인한 항목

다음은 현재 커밋 원문과 13~20단계 구현 과정의 모의 입력 점검으로 확인한 범위입니다.

- 13단계: 기기 compliant/noncompliant/unknown, 세션 active/expired/revoked/unknown 구분
- 14단계: allow/deny/challenge/unknown과 요청 실패 구분
- 15단계: 보안 기록 정렬·필터·상세 근거/규칙/상태 표시
- 16단계: 오류·timeout·재시도 안내와 안전한 도움정보 표시
- 17단계: AI 연결 점검과 사건 설명 실행을 구분
- 18단계: 설명의 사건/근거 결속, unknown 표시, 근거 부족/잘못된 근거 거부
- 19단계: prepared/executing/pending/succeeded/unknown 분리, ACK와 효과 관측 분리, receipt 결속
- 20단계: exact semver 표시, complete/partial/not_checked/not_configured/unverifiable 구분, 취약점 ID 보존

### 아직 실제 환경에서 확인하지 않은 항목

다음 항목은 이 문서를 작성하는 현재 작업에서 실제 PC/운영 연결로 실행하지 않았습니다.

- 새 PowerShell 창에서 이 문서만 보고 처음부터 서버를 다시 켜는 21단계 직접 확인
- 실제 학생 계정의 SDP 운영 연결 성공
- 실제 학생 계정의 AI 앱 승인 및 유료 모델 추론
- 실제 보안 조치가 원천 시스템에 적용된 결과
- 실제 검사 대상 프로젝트의 package-lock.json / node_modules와 화면 버전의 직접 대조
- 실제 OSV 인터넷 조회 결과
- 새 환경에서 전체 기능을 처음부터 재현하는 22단계 인수 시험

위 항목은 **미확인**이며, 코드나 모의 입력 결과만으로 실제 성공이라고 쓰지 않습니다.

## 13. 21단계 직접 확인 절차

### 확인 1 — 새 PowerShell 창에서 실행

기존 작업을 지우거나 초기화하지 말고 새 PowerShell 창을 연 뒤 저장소 루트에서 다음 명령을 실행합니다.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
~~~

확인할 것:

1. 실행 폴더가 맞는지
2. Node.js 버전 안내가 실제 PC와 일치하는지
3. 케셰브가 켜졌습니다 문구와 서버가 응답한 것만 확인했습니다 문구가 실제로 나오는지
4. http://127.0.0.1:5189/가 열리는지
5. 보호 현황 / 업무 앱 / 보안 기록 메뉴가 보이는지

이 확인을 실제로 끝내기 전까지 이 문서의 새 환경 실행 확인 상태는 **미확인**입니다.

### 확인 2 — 경로·명령·버튼 대조

앱이 열린 뒤 이 문서 10장의 버튼 이름을 실제 화면과 하나씩 비교합니다. 이름이 다르면 문서를 수정하고, 제공 UI를 문서에 맞추려고 임의로 고치지 않습니다.

## 14. 21단계 제출 메모

21단계는 워크벤치의 13~20단계용 포털 제출 준비와 절차가 다릅니다. 제공 docs/STUDENT_LAUNCH_GUIDE.md에는 21·22단계 판정 방식이 아직 확정 전이라는 이전 문구가 남아 있지만, **현재 21단계 과제 화면의 공식 안내를 우선**합니다.

- 과제 화면에 저장소 주소와 **40자리 커밋**을 직접 입력합니다.
- 비공개 저장소라면 과제 화면의 비공개 저장소 원문 준비 방법에서 제공하는 최신 student-source-cli.mjs 안내를 따릅니다.
- 도구 ZIP과 생성 JSON은 프로젝트 밖에 둡니다.
- 도구 명령은 과제 화면이 제공한 실제 경로와 제출할 커밋을 확인한 뒤 사용합니다.
- 원문 전달 성공은 AI 검토 통과와 같은 뜻이 아닙니다.
- 실제 유료 AI 요청, 보안 조치, 단계 제출은 이 문서 작성 과정에서 자동 실행하지 않습니다.

## 15. 22단계 재현 기록

22단계의 같은 커밋 재현 시도, 13~21 누적 확인표, 데이터 보존/복원 계획과 최종 지원 범위는 [STUDENT_FINAL_HANDOFF.md](STUDENT_FINAL_HANDOFF.md)에 이어서 기록합니다. 현재 새 Windows clean clone 실행 결과는 미확인 상태이며, 원문 검토나 모의 입력 결과를 실제 새 환경 실행 성공으로 바꾸어 적지 않습니다.

