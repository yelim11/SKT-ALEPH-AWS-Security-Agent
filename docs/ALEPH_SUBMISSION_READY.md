# ALEPH 13~22단계 · 최종 제출 안내 (노예 0.2.21)

## 제출 대상
- 저장소: https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent
- 개인 최종 브랜치: `final-week/noe-0.2.21-final`
- 제출 커밋: **이 문서를 추가한 최종 GitHub 커밋의 전체 40자리 SHA**를 사용합니다. 문서에 고정된 과거 SHA를 제출하지 마세요.
- 수업의 공식 과제 통과 이력이 있는 `main`과 이전 22단계 재현 기록은 **보존**됩니다. 이 개인 통합본은 당시 제출본과 다릅니다.

## 제출할 때
1. GitHub에서 위 브랜치의 최신 커밋 SHA(40자리)를 복사합니다.
2. ALEPH 제출 화면에 저장소 주소와 **최신 커밋 SHA**를 입력합니다. 브랜치 자체를 받는 칸이 있으면 개인 최종 브랜치를 선택합니다.
3. 단계별 제출이면 ALEPH가 안내하는 단계와 해당 단계 평가 기준을 확인합니다. 개인 통합본의 한 번의 제출만으로 13~22단계 모두가 자동 통과하는 것은 아닙니다.
4. 제출 후 공식 AI 판정 결과를 확인합니다. 사전 AI REVIEW는 공식 통과 판정과 다릅니다.

## 검증 상태 (2026-10-29)
- GitHub에서 브랜치 및 0.2.21의 `package.json`, `student/extension.mjs`, 실행·패키징 문서와 개인 통합 변경 확인.
- 13~22단계 학생 구현과 과거 Windows clean runner 재현 기록: `docs/STUDENT_FINAL_HANDOFF.md` (기존 **0.2.11 시점**, 실행 대상 커밋 고정). 그 성공 기록을 새로운 0.2.21 커밋의 실행 성공으로 대체하지 않습니다.
- 0.2.21의 과거 Linux 예제 실행·구문 검사는 `docs/NOE_FINAL_RELEASE_0_2_21.md`에 기록되어 있습니다.
- **이 최종 커밋 자체의 Windows fresh clone, native host, 실제 SDP·XDR, AI 추론, 설치형 릴리스 및 공식 판정은 확인되지 않았습니다.**
- SDP 개인 인증서가 없는 환경에서는 `ENGINE_NOT_CONNECTED`가 나타날 수 있습니다. 연결 실패를 실제 보호/탐지 성공으로 바꾸지 않습니다.

## 사용자가 직접 확인할 마지막 실행 명령 (선택 사항)
Windows + Node.js 24 환경에서 독립 폴더로 내려받아:

```powershell
git clone --branch final-week/noe-0.2.21-final --single-branch https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent.git ALEPH-FINAL
cd ALEPH-FINAL
git rev-parse HEAD
npm run check
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

앱: http://127.0.0.1:5189/

검토 자료: `docs/NOE_FINAL_RELEASE_0_2_21.md`, `docs/STUDENT_FINAL_HANDOFF.md`, `docs/STUDENT_RELEASE_RECORD.json`, `docs/IMPLEMENTATION_CONTRACT.md`.

**제출 가능의 의미:** GitHub 원문 조회를 위한 브랜치·커밋을 준비했다는 뜻이며, 수업 공식 승인·100점·운영 안전성 보증을 의미하지 않습니다.
