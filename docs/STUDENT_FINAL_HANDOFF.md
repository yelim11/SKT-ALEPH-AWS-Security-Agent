# 노예 보안 Agent · 22단계 최종 인수인계와 재현 기록

> 이 문서는 22단계 학생 실행 결과·버전 기록입니다. 서버의 AI 원문 검토와 실제 새 환경 실행을 구분합니다. 이 문서에 적힌 “원문 확인”은 코드를 읽은 결과이고, “모의 입력 확인”은 학생 렌더 함수에 시험 데이터를 넣어 확인한 결과이며, “실제 환경”은 별도 새 폴더/PC에서 직접 실행한 경우에만 사용합니다.

## 1. 재현 기준 소스

| 항목 | 값 |
|---|---|
| Agent 이름 | 노예 |
| 저장소 | https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent |
| 브랜치 | main |
| 21단계 통과 시점 기준 커밋 | 4b543b829f9a4e41f2da20305dcba9138e4faae3 |
| Windows clean 재현 대상 커밋 | a509c06619560e0bfa155758605764e07f8bb911 |
| 시작 틀/앱 버전 | package.json 기준 0.2.11 |
| Node.js 기준 | package.json 기준 24.19.0 |
| 22단계 릴리스 상태 | **clean-environment 재현 확인 / 운영 통합 미검증** |
| 운영 v1.0 인증 | **아님** |

21단계 과제 화면에서 “21단계 통과”가 표시된 것은 사용자에게 확인된 사실입니다. 21단계 통과 뒤 22단계 초안 문서만 추가한 `a509c06619560e0bfa155758605764e07f8bb911`을 깨끗한 Windows 환경의 실제 재현 대상으로 고정했습니다.

Git 커밋은 자기 자신의 해시를 파일 내용에 미리 포함할 수 없으므로, 재현 결과를 문서에 반영하는 최종 제출 커밋은 재현 대상 커밋의 문서 전용 자식 커밋이 됩니다. 이 문서 갱신에서 `student/`, `src/`, `public/`, `package.json`, 실행 스크립트는 바꾸지 않습니다. 제출 전에는 현재 HEAD의 40자리 SHA를 별도로 확인합니다.

## 2. 원래 작업 보존

22단계 작업 중 원래 GitHub 저장소의 13~21단계 이력은 삭제·초기화·force push하지 않았습니다. 재현용 clone 시도는 원래 작업 폴더가 아닌 별도 임시 경로를 대상으로 했습니다.

현재 Git 이력에는 다음 누적 학생 구현이 순서대로 남아 있습니다.

| 단계 | 대표 커밋 | 현재 최종 소스에 남은 기능 |
|---:|---|---|
| 13 | 56d175757cbbd1846d6db76bb9db5d6e9180d14b | renderIdentity · 사용자/기기/세션 상태 |
| 14 | 0483a54ac5fffe53ae4803bee238277fe4a0798f | renderDecision · 접근 판정/이유/시각 |
| 15 | 6f7e48479b4ccb71a08bab0e83f21aca7ea6ead3 | renderEvents · 접속/XDR 기록 필터·상세 |
| 16 | 4506a53bd51114e4c48aa152e93fe6b9c1ec1367 | renderStatus · 오류·진단·미지원 상태 |
| 17 | ff02fc2b528ed4985a9558d37012fcc0f20a0c3b | renderAiConnection · AI 연결 점검/재시도 안내 |
| 18 | fd301261e1eac6d9b72c7336d4d6107f78019c7c | renderExplanation · 사건/근거 결속 |
| 19 | 0024ba4707ad41b0255ec842a81d02f9ca5d5208 | renderAction · 제안/ACK/효과 관측 구분 |
| 20 | 7782cde42f21bfefe8431851a421a22e538d0c4d | renderVulnerabilities · 정확한 버전/OSV 상태 |
| 21 | 4b543b829f9a4e41f2da20305dcba9138e4faae3 | 학생 실행 설명서·구성도 |

서로 다른 커밋에서 따로 확인한 결과를 “한 번에 같은 새 환경에서 모두 성공”한 것으로 합산하지 않습니다.

## 3. 새 환경 재현 시도 기록

### 3.1 이 AI 실행 환경에서 실제로 수행한 시도

원래 작업과 분리된 임시 폴더를 대상으로 다음 명령을 실제로 시도했습니다.

~~~text
git clone https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent.git /tmp/alekov-stage22-repro
~~~

결과:

~~~text
fatal: unable to access 'https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent.git/':
Could not resolve host: github.com
~~~

따라서 이 AI 실행 환경에서는 clone 이후의 Node 버전 확인, npm run check, 서버 기동, 브라우저 확인, 종료·재실행을 **실행하지 못했습니다**. DNS 제한을 앱 실패나 GitHub 저장소 실패로 해석하지 않습니다.

GitHub 연결 도구를 통한 원문 읽기에서는 4b543b829f9a4e41f2da20305dcba9138e4faae3의 저장소·Git 이력·파일 내용을 확인했습니다. 이것은 **새 환경 실행 성공 증거가 아닙니다**.

### 3.2 GitHub-hosted Windows clean runner 실제 재현

2026-10-26에 GitHub Actions의 새 `windows-latest` 러너(Windows Server 2025)에서 **정확히 `a509c06619560e0bfa155758605764e07f8bb911`을 checkout**해 실제 실행했습니다.

- 실행 기록: https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/actions/runs/40292831748
- 실행 결과: `success`
- 확인 커밋: `a509c06619560e0bfa155758605764e07f8bb911`
- Node.js: `v24.19.0`
- npm: `11.17.0`
- `npm run check`: PASS (`node --check student/extension.mjs`)
- 첫 실행: `http://127.0.0.1:5189/` → HTTP 200
- 첫 실행 화면: 보호 현황·업무 앱·보안 기록·학생 표시·취약점 영역의 DOM 식별자를 확인
- 첫 서버 종료 후 포트 5189 해제 확인
- 같은 clean checkout에서 재실행 → HTTP 200
- 두 번째 서버 종료 후 저장소 `git status --porcelain` 출력 없음
- 최종 로그: `REPRODUCTION_RESULT=PASS`
- 완료 시각: `2026-10-26T08:32:53Z` (`2026-10-26T17:32:53+09:00`)

이 결과는 **새 Windows 환경에서 기본 실행 진입점과 화면 제공, 종료·재실행, 저장소 비변조를 실제 확인한 증거**입니다. 실제 SDP 계정·AI 유료 모델·19단계 원천 조치·20단계 외부 OSV 운영 연결까지 성공했다는 뜻은 아닙니다.

첫 번째 검증 워크플로는 테스트 셸의 한글 인코딩 문제로 실패했으며 앱 코드 실패가 아니었습니다. 검증 스크립트를 ASCII 기준으로 고친 뒤 동일 재현 대상 커밋으로 위 성공 결과를 얻었습니다.

### 3.3 Windows 학생 PC에서 수행할 clean clone 절차

기존 작업 폴더를 그대로 두고, 기존 폴더의 하위가 아닌 새 빈 부모 폴더에서 PowerShell을 엽니다. 예시 폴더 이름은 자유롭게 바꿀 수 있습니다.

~~~powershell
git clone https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent.git .\alekov-stage22-repro
Set-Location .\alekov-stage22-repro
git checkout --detach a509c06619560e0bfa155758605764e07f8bb911
git rev-parse HEAD
git status --short
node --version
npm run check
~~~

기대 확인값:

- git rev-parse HEAD: a509c06619560e0bfa155758605764e07f8bb911
- git status --short: 출력 없음
- Node.js 수업 기준: v24.19.0
- npm run check: student/extension.mjs 문법 오류 없이 종료

그 다음 같은 폴더에서 21단계 설명서의 실행 명령을 사용합니다.

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
~~~

정상 시작 시 스크립트 원문상 다음 문구가 나옵니다.

~~~text
케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.
서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.
~~~

브라우저에서 http://127.0.0.1:5189/ 를 열어 보호 현황 / 업무 앱 / 보안 기록을 확인합니다.

종료는 실행 PowerShell에서 Ctrl+C입니다. 종료 후 같은 명령으로 한 번 더 실행해 재실행 여부를 확인합니다.

GitHub-hosted Windows clean runner에서는 위 기본 실행 절차를 실제로 재현했습니다. 학생 개인 PC에서의 수동 clean clone은 별도 미확인으로 남깁니다.

## 4. 설치와 이동 가능한 구성

이 앱 시작 틀은 package.json에 외부 npm dependencies/devDependencies가 없습니다. 따라서 현재 원문 기준으로 npm install을 선행해야 하는 외부 패키지는 없습니다. Node.js와 저장소 파일이 실행에 필요한 기본 구성입니다.

이동 시 Git에 포함할 것:

- package.json
- public/
- src/
- student/
- tools/
- docs/
- .env.example
- README.md

이동 시 Git에 넣지 않고 별도로 재준비할 것:

- 실제 비밀번호·토큰·API 키·개인키
- NativeHostConfig 실제 파일
- SdpHostConfig 실제 파일
- AI credential vault의 실제 자격
- 외부 시스템이 소유한 SQLite DB와 SDP/XDR 원천 데이터
- 운영자가 지정한 ON_PROJECT_DIRECTORY 대상 프로젝트의 개인/비공개 자료

로컬 절대경로는 문서 예시로 고정하지 않습니다. 새 환경에서는 담당자가 승인한 실제 경로를 다시 제공해야 합니다.

## 5. 13~21단계 누적 확인 기록

확인 시각 기준: 2026-10-26 KST. 아래 “원문 확인”은 최종 누적 소스를 읽은 결과이고 “모의 확인”은 구현 과정에서 시험 입력을 사용한 결과입니다. 실제 운영 시스템 연결 성공으로 바꾸어 읽지 않습니다.

| 단계 | 기능 | 현재 결과 | 근거 | 실제 운영/새 환경 미확인 |
|---:|---|---|---|---|
| 13 | 로그인·기기·세션 | 원문 확인 | renderIdentity, 커밋 56d175… | 실제 SDP 계정/기기 |
| 14 | 업무 앱 판정 | 원문 확인 | renderDecision, 커밋 0483a5… | 실제 SDP 접근 요청 |
| 15 | 보안 기록/XDR | 원문 확인 | renderEvents, 커밋 6f7e48… | 실제 사용자 기록 |
| 16 | 상태·오류·진단 | 원문 확인 | renderStatus, 커밋 4506a5… | 실제 장애 복구 |
| 17 | AI 연결 점검 | 원문 확인 | renderAiConnection, 커밋 ff02fc… | 실제 학생 AI 앱 승인/유료 모델 |
| 18 | 근거 있는 AI 설명 | 원문+모의 확인 | renderExplanation, 커밋 fd3012… | 실제 유료 AI 사건 설명 |
| 19 | 조치 상태/효과 구분 | 원문+모의 확인 | renderAction, 커밋 0024ba… | 실제 원천 조치 집행은 현재 미준비 |
| 20 | 정확한 패키지/OSV | 원문+모의 확인 | renderVulnerabilities, 커밋 7782cd… | 실제 대상 project lock/node_modules와 OSV 인터넷 조회 |
| 21 | 실행 설명서/구성도 | **ALEPH 화면에서 통과 확인 + clean Windows 기본 실행 재현** | README + docs/STUDENT_RUNBOOK.md, 커밋 4b543b… / Windows 재현 대상 a509c0… | 실제 SDP·AI·조치·OSV 운영 연결은 별도 미확인 |

### demo와 실제 연결 구분

npm run demo 또는 합성/모의 입력 결과는 화면 표시 로직을 확인하는 자료일 뿐 실제 회사 SDP·AI·조치·OSV 운영 연결 성공이 아닙니다. 기본 연결 없음(disconnected)도 실제 연결 성공이 아닙니다.

## 6. 데이터 보존·백업·복원 계획

### 6.1 Git 소스와 학생 문서

**보존 대상:** README.md, docs/, student/extension.mjs, 제공 코드, Git 이력.

권장 백업:

~~~powershell
git status
git log -1 --oneline
git bundle create ..\SKT-ALEPH-AWS-Security-Agent.bundle --all
~~~

bundle은 프로젝트 밖에 보관합니다. 원격 GitHub 저장소도 별도 소스 사본입니다.

복원 예시:

~~~powershell
git clone .\SKT-ALEPH-AWS-Security-Agent.bundle .\alekov-restored
~~~

복원 뒤 반드시 원하는 40자리 커밋을 git rev-parse HEAD로 확인합니다.

### 6.2 학생 화면의 상태

현재 학생 렌더 함수는 호출마다 전달받은 상태로 DOM을 다시 만들며, student/extension.mjs가 localStorage/sessionStorage에 별도 학생 데이터를 저장하는 경로는 확인되지 않았습니다. 따라서 화면에 보이는 임시 상태 자체를 Git 백업 대상으로 보지 않습니다.

### 6.3 접근 제어·XDR 원천 데이터

사용자·기기·세션·접속 판정·보안 기록은 기존 SDP/XDR 원천 시스템의 데이터입니다. 학생 Git 저장소에서 복원하지 않습니다. 새 환경에서는 승인된 엔진/SDP 설정을 다시 연결한 뒤 원천 시스템이 반환하는 데이터를 확인합니다.

### 6.4 조치 기록 SQLite

src/actions/store.mjs는 운영자가 명시적으로 제공한 **기존 SQLite DB 파일**에 alekov_action_intents / alekov_action_state / alekov_action_audit 테이블을 추가하는 구조입니다. 학생 저장소에 DB 파일을 포함하지 않습니다.

보존 원칙:

1. 실제 조치 DB가 운영 연결된 경우 담당자 승인 절차로 DB snapshot/backup을 수행합니다.
2. 실행 중 DB를 학생이 임의 복사해 일관된 백업이라고 주장하지 않습니다.
3. 복원 뒤 경로·파일 권한·현재 사용자/프로젝트 결속을 운영자가 확인한 후 연결합니다.
4. 현재 수업 범위에서 실제 19단계 원천 집행은 미완료이므로, 이 문서 작성 과정에서 조치 DB 백업/복원을 실행했다고 주장하지 않습니다.

### 6.5 AI 연결 자격과 private host 설정

src/ai/credential-vault.mjs와 native host 경로의 자격은 Git 저장소 밖의 신뢰된 Windows 경계에 있습니다. NativeHostConfig / SdpHostConfig / 토큰 / 개인키를 clean clone 폴더로 무작정 복사하지 않습니다.

새 환경에서는 담당자의 승인된 절차로 계정 연결·앱 승인을 다시 수행하거나 승인된 복구 절차를 사용합니다. 비밀 파일을 README, Git, 제출 JSON에 넣지 않습니다.

### 6.6 20단계 검사 대상과 OSV 결과

ON_PROJECT_DIRECTORY는 별도의 검사 대상 프로젝트를 가리킵니다. 해당 프로젝트의 데이터는 이 Agent 저장소 백업에 포함된다고 가정하지 않습니다. 새 환경에서 운영자가 승인한 대상 경로와 ON_APPROVED_PUBLIC_PACKAGES를 다시 구성한 뒤 조회합니다.

OSV 조회 결과는 특정 조회 시각의 공개 데이터 결과이므로 과거 결과를 영구 안전 판정으로 복원하지 않고 새 조회를 수행합니다.

## 7. 문제 수정 시 같은 최종 버전 유지 규칙

clean clone에서 문제가 발견되면:

1. 원래 개발 저장소에서 원인을 수정합니다.
2. 새 커밋을 만듭니다.
3. 22단계 재현 기준 커밋을 새 40자리 SHA로 갱신합니다.
4. 이전 clone 결과와 새 commit 결과를 합쳐 “전체 성공”으로 쓰지 않습니다.
5. 새 빈 폴더에서 새 커밋을 다시 받아 처음부터 재현합니다.
6. 문서의 단계 표·미확인 항목·버전 상태를 새 결과로 갱신합니다.

## 8. 릴리스 상태

현재 상태는 **수업용 clean-environment 재현 확인 / 운영 통합 미검증**입니다.

실제 완료된 근거:

- 13~20 학생 구현이 현재 누적 source에 존재
- 21단계 학생 문서와 구성도가 현재 source와 일치하도록 작성됨
- 사용자 제공 ALEPH 화면에서 21단계 통과 확인
- GitHub-hosted Windows Server 2025 clean runner에서 `a509c06619560e0bfa155758605764e07f8bb911` checkout 성공
- Node.js `v24.19.0`, `npm run check` 성공
- 첫 실행 HTTP 200 및 핵심 UI DOM 확인
- 첫 실행 종료 후 포트 해제 확인
- 동일 clean checkout 재실행 HTTP 200
- 재실행 종료 뒤 Git working tree clean 확인
- 원래 개발 Git 이력과 런타임 source를 삭제하거나 덮어쓰지 않음

미완료/미확인:

- 학생 개인 Windows PC에서의 별도 수동 clean clone
- 실제 학생 SDP 운영 연결
- 실제 학생 AI 앱 승인과 유료 모델 추론
- 실제 19단계 원천 조치 집행
- 실제 대상 프로젝트의 OSV 외부 조회와 package-lock/node_modules 직접 대조
- 운영 자격/외부 DB의 실제 복원 시험

따라서 22단계 문서 검토와 clean runner 성공을 운영 인증, 실제 집행 인증, 또는 자동 v1.0 인증으로 표현하지 않습니다.

## 9. 실제 재현 결과

| 항목 | 기록 |
|---|---|
| 재현 환경 | GitHub-hosted Windows Server 2025 clean runner |
| 재현 대상 커밋 | a509c06619560e0bfa155758605764e07f8bb911 |
| git rev-parse HEAD | a509c06619560e0bfa155758605764e07f8bb911 |
| git status --short | 실행 전/후 출력 없음 |
| node --version | v24.19.0 |
| npm --version | 11.17.0 |
| npm run check | PASS |
| 첫 실행 HTTP/화면 | HTTP 200 + 핵심 UI DOM 식별자 확인 |
| 첫 실행 종료 | 서버 프로세스 종료 + 포트 5189 해제 확인 |
| 재실행 | HTTP 200 |
| 재실행 종료 | 서버 프로세스 종료 |
| 최종 결과 | REPRODUCTION_RESULT=PASS |
| 확인 시각 | 2026-10-26T08:32:53Z / 2026-10-26T17:32:53+09:00 |
| 실행 기록 | https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/actions/runs/40292831748 |
| 학생 개인 PC 직접 재현 | 미확인 |
| 운영 시스템 연결 | 미확인 |

이 표의 PASS는 **기본 로컬 앱의 clean Windows 실행·종료·재실행과 source 비변조**를 뜻합니다. 실제 SDP·AI·조치·OSV 운영 연동 성공을 뜻하지 않습니다.

