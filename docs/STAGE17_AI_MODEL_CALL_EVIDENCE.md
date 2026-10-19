# 17단계 `ai_model_called` 원문 연결 검토 자료

> 검토 대상: `fa2a90fe39cd36ab8125c0cc01bec8104732b546` 및 이 커밋의 후속 문서 추가. 학생 구현과 제공 서버 파일을 수정하지 않습니다.
> 정적 소스 연결 확인일 뿐, 운영 계정의 실제 모델 호출 성공이나 단계 통과를 인증하지 않습니다.

## 검토에서 누락된 원문 파일

- [`src/server.mjs` — `/api/ai/explain` 처리 (native 경로)](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/src/server.mjs#L466-L526)
- [`src/server.mjs` — `/api/ai/explain` 처리 (일반 경로)](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/src/server.mjs#L527-L545)
- [`src/ai/vault-service.mjs` — 비밀값을 화면에 노출하지 않는 서비스 전달](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/src/ai/vault-service.mjs#L116-L126)
- [`src/ai/service.mjs` — AI 호출 / 응답 검사](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/src/ai/service.mjs#L337-L393)
- [`vendor/clco-http.mjs` — 실제 HTTP 채팅 전송](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/vendor/clco-http.mjs#L113-L124)
- [`public/app.js` — 사용자 사건 설명 버튼](https://github.com/yelim11/SKT-ALEPH-AWS-Security-Agent/blob/fa2a90fe39cd36ab8125c0cc01bec8104732b546/public/app.js#L978-L1016)

## 원문에 나타난 요청 연결

1. 제공 UI는 사용자가 `AI 설명 요청`을 누를 때만 본인 기록의 `event.id`로 `/api/ai/explain`을 호출합니다. (그 전에 사건 입력을 확인하고, 완료 전후 세대를 검사합니다.)

   원문 `public/app.js`:
   ```js
   const result = safeEvent ? await aiRequest('/api/ai/explain', { body: { eventId: event.id }, signal: controller.signal })
     : localFailure('ON_AI_INVALID_INPUT', AI_MESSAGES.ON_AI_INVALID_INPUT, UNKNOWN_META);
   ```

2. 제공 서버의 native-host 경로는 사건·계정 범위를 검사한 다음 vault 서비스의 `explainIncident`로 전달합니다. native-host가 없는 경우에도 별도의 `/api/ai/explain` 분기가 있고 `mappedService().explainIncident`를 호출합니다.

   원문 `src/server.mjs`: 
   ```js
   const service=createVaultOnAiService({enabled:true,vault:createNativeOperationVault(nativeHost,nativeOperation),timeoutMs:remaining(),
     appAuthorization:nativeConfiguration.fetchImpl?{fetchImpl:nativeConfiguration.fetchImpl}:{}});
   const raw=await bounded(()=>service.explainIncident(incident,options));
   ```
   ```js
   const output=await bounded(()=>mappedService().explainIncident({incidentId:event.id,evidence:event.evidence.map(e=>({id:e.id,summary:e.text})),rules:event.rules.map(r=>({id:r.id,description:r.text})),currentState:event.state,supportedActions:event.supportedActions},authOptions(binding)));
   ```

3. Vault 서비스는 권한을 확인한 서비스에 전달하고 `createOnAiService`의 `explainIncident`에 이어집니다. 앱 전용 비밀값 자체는 이 문서나 학생 코드에 적지 않습니다.

   원문 `src/ai/vault-service.mjs`:
   ```js
   const result=await (method==='models' ? service.checkConnection(serviceOptions)
     : method==='learner-support' ? service.explainLearningSupport(incident,observation,serviceOptions)
       : service.explainIncident(incident,serviceOptions));
   ```

4. AI 서비스의 사건 설명 경로는 `ai.explain` 권한과 모델을 확인하고 클라이언트의 `chat` 메서드를 호출합니다. 모델 **목록** 조회인 `checkConnection`과 별개입니다.

   원문 `src/ai/service.mjs`:
   ```js
   const response=await Reflect.apply(method.value,activeClient,[body,{signal}]);alive(signal);sameAuthority(dispatch);
   ```
   비 native 경로에도 별도의 실제 호출이 존재합니다:
   ```js
   const result = await activeClient.chat({ model, stream: false, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify(incident) }] }, { signal });guard(authorization,signal);
   ```

5. HTTP 전송 클라이언트는 `chat`의 요청을 `/chat/completions`로 전달합니다. `/models` 조회와 다른 API입니다.

   원문 `vendor/clco-http.mjs`:
   ```js
   async chat(body, options = {}) {
     if (!body || typeof body.model !== 'string' || !body.model || !Array.isArray(body.messages) || !body.messages.length || (body.stream !== undefined && typeof body.stream !== 'boolean')) throw fail('WB_CLCO_INVALID_REQUEST');
     if (body.stream && typeof options.readStream !== 'function') throw fail('WB_CLCO_STREAM_READER_REQUIRED');
     const result = await request('/chat/completions', body, options);
   ```

## 확인 경계 및 직접 확인

- 이 문서는 소스상 연결을 확인한 것이며 실제 HTTP 요청, AI 사용 권한, 모델 호출 결과는 실행하지 않아 **미확인**입니다.
- 운영자의 계정·AI 앱 권한 준비 뒤, 사용자가 앱의 **보안 기록**에서 본인 사건을 골라 **AI 설명 요청**을 직접 눌러야 합니다. 완료된 설명 요약과 해당 사건 ID가 표시되는지 확인합니다.
- `현재 API 연결 점검`의 모델 수만으로 `ai_model_called`를 인증하지 않습니다. 연결이 준비되지 않았다면 권한 준비 중/확인 불가로 남겨야 합니다.
- 실패 시 화면의 안전한 **오류 코드만** 기록하세요. API 키·토큰·승인 번호·원문 인증정보는 기록·캡처·커밋에 포함하지 않습니다.
- 제공 서버/전송/인증 코드와 기존 학생 구현은 본 문서를 추가하는 과정에서 변경하지 않았습니다.
