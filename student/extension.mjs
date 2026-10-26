// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions }) {
      // 제공 UI는 반환한 DOM으로 학생 칸을 통째로 교체한다.
      const root = document.createElement('div');
      const modeLabels = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };

      const addText = (parent, text) => {
        const line = document.createElement('p');
        line.textContent = text;
        parent.appendChild(line);
      };

      const addSection = (title, resource) => {
        const section = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);
        root.appendChild(section);

        const modeLabel = modeLabels[resource?.mode];
        if (modeLabel) addText(section, `연결 모드: ${modeLabel}`);

        if (resource?.status === 'loading') {
          addText(section, '불러오는 중');
        } else if (resource?.status === 'error') {
          const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(resource.error?.code);
          const message = resource.error?.message || '오류 내용을 확인할 수 없습니다.';
          addText(section, `${unverified ? '확인 불가' : '연결 실패'}: ${message}`);
        } else if (resource?.status !== 'ok') {
          addText(section, '확인 불가');
        }
        return section;
      };

      const deviceLabels = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      };
      const sessionLabels = {
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      };

      const identitySection = addSection('현재 로그인 정보', me);
      if (me?.status === 'ok') {
        const { user, device, session } = me.data || {};
        if (user && device && session) {
          addText(identitySection, `사용자: ${user.label || user.id} (ID: ${user.id})`);
          addText(identitySection, `현재 기기: ${device.label || device.id} (ID: ${device.id}) · ${deviceLabels[device.status] || '확인 불가'} (${device.status})`);
          addText(identitySection, `로그인 세션: ${session.id} · ${sessionLabels[session.status] || '확인 불가'} (${session.status})`);
        } else {
          addText(identitySection, '사용자·기기·세션 정보를 확인할 수 없습니다.');
        }
      }

      const devicesSection = addSection('내 기기 목록', devices);
      if (devices?.status === 'ok') {
        if (!Array.isArray(devices.data)) {
          addText(devicesSection, '기기 목록을 확인할 수 없습니다.');
        } else if (devices.data.length === 0) {
          addText(devicesSection, '표시할 기기가 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const device of devices.data) {
            const item = document.createElement('li');
            item.textContent = `${device.label || device.id} (ID: ${device.id}) · ${deviceLabels[device.status] || '확인 불가'} (${device.status})`;
            list.appendChild(item);
          }
          devicesSection.appendChild(list);
        }
      }

      const sessionsSection = addSection('내 세션 목록', sessions);
      if (sessions?.status === 'ok') {
        if (!Array.isArray(sessions.data)) {
          addText(sessionsSection, '세션 목록을 확인할 수 없습니다.');
        } else if (sessions.data.length === 0) {
          addText(sessionsSection, '표시할 세션이 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const session of sessions.data) {
            const item = document.createElement('li');
            item.textContent = `${session.id} · ${sessionLabels[session.status] || '확인 불가'} (${session.status})`;
            list.appendChild(item);
          }
          sessionsSection.appendChild(list);
        }
      }

      return root;
    },
    renderDecision({ status, mode, data, error, appId }) {
      const root = document.createElement('section');
      const addText = (message) => {
        const line = document.createElement('p');
        line.textContent = message;
        root.appendChild(line);
      };

      const modeLabels = {
        demo: '예제 자료(demo)',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      if (Object.hasOwn(modeLabels, mode)) {
        addText(`연결 상태: ${modeLabels[mode]}`);
      }

      if (status === 'idle') {
        addText('앱을 골라 접속을 요청하세요.');
        return root;
      }

      const selectedAppId = status === 'ok' ? (data?.appId ?? appId) : appId;
      if (selectedAppId) addText(`업무 앱 ID: ${selectedAppId}`);

      if (status === 'loading') {
        addText('접근 판정 확인 중');
        return root;
      }

      if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.trim()
          ? error.message : '오류 내용을 확인할 수 없습니다.';
        addText(`요청 실패: ${message}`);
        addText('요청 실패는 접근 거부(deny) 판정이 아닙니다. 접근 허용 여부를 확인할 수 없습니다.');
        return root;
      }

      if (status !== 'ok') {
        addText('판정 확인 불가(unknown). 접근 허용으로 간주하지 마세요.');
        return root;
      }

      const decisionLabels = {
        allow: '접근 허용',
        deny: '접근 거부',
        challenge: '추가 확인 필요',
        unknown: '확인 불가',
      };
      const decisionCode = Object.hasOwn(decisionLabels, data?.decision) ? data.decision : 'unknown';
      addText(`접근 판정: ${decisionLabels[decisionCode]}(${decisionCode})`);

      if (decisionCode === 'challenge') {
        addText('추가 인증 또는 확인이 필요합니다. 이 화면은 추가 인증 절차를 대신 수행하지 않습니다.');
      } else if (decisionCode === 'unknown') {
        addText('접근 허용 여부를 확인할 수 없습니다. 허용으로 간주하지 마세요.');
      }

      addText(`판정 이유: ${typeof data?.reason === 'string' && data.reason.trim() ? data.reason : '이유 정보 없음'}`);
      addText(`판정 시각: ${typeof data?.checkedAt === 'string' && data.checkedAt ? data.checkedAt : '시각 정보 없음'}`);
      return root;
    },
    renderEvents({ status, mode, data, error }) {
      // 제공 UI는 호출 때마다 반환한 DOM으로 학생 영역을 교체한다.
      const root = document.createElement('section');
      const addText = (parent, value, tag = 'p') => {
        const element = document.createElement(tag);
        element.textContent = value;
        parent.appendChild(element);
        return element;
      };

      if (mode === 'demo') addText(root, '예제 자료(demo) · 실제 보안 기록이 아닙니다.');
      if (status === 'loading') {
        addText(root, '보안 기록을 불러오는 중');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.trim()
          ? error.message : '오류 내용을 확인할 수 없습니다.';
        const unverified = error?.code === 'CONTRACT_MISMATCH' || error?.code === 'ENGINE_RESULT_UNVERIFIED';
        addText(root, `기록을 불러오지 못했습니다: ${unverified ? '확인 불가 · ' : ''}${message}`);
        addText(root, '조회 실패는 기록이 없는 상태와 다릅니다. 이전 목록은 현재 결과가 아닙니다.');
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        addText(root, '보안 기록 확인 불가');
        return root;
      }

      // 원본 데이터는 수정하지 않고 받은 본인 기록만 다룬다.
      const records = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      addText(root, '현재 등록 정보와 대조한 본인의 최근 보안 기록입니다. 최대 40건만 전달되며, XDR 경보는 이미 저장된 기록입니다.');
      if (records.length === 0) {
        addText(root, '표시할 기록이 없습니다.');
        return root;
      }

      const kindLabels = { access: '접속 기록', xdr: 'XDR 경보' };
      const accessLabels = { allowed: '접근 허용', denied: '접근 거부', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const statusText = (labels, code) => {
        const original = Object.hasOwn(labels, code) ? code : 'unknown';
        return `${labels[original]}(${original})`;
      };
      const appValue = (event) => event.appId == null ? '' : event.appId;
      const appText = (event) => event.appId == null ? '앱을 확인할 수 없습니다' : event.appId;

      const filters = document.createElement('div');
      const makeFilter = (name, values, optionLabel) => {
        const label = document.createElement('label');
        label.textContent = `${name}: `;
        const select = document.createElement('select');
        select.setAttribute('aria-label', name);
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.appendChild(allOption);
        for (const value of new Set(values)) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = optionLabel(value);
          select.appendChild(option);
        }
        select.value = 'all';
        label.appendChild(select);
        filters.appendChild(label);
        return select;
      };
      const kindFilter = makeFilter('기록 종류', records.map((record) => record.kind),
        (value) => `${kindLabels[value] || '확인 불가'}(${value})`);
      const appFilter = makeFilter('업무 앱', records.map(appValue),
        (value) => value === '' ? '앱을 확인할 수 없습니다' : value);
      const accessFilter = makeFilter('접속 상태', records.map((record) => record.state.access),
        (value) => statusText(accessLabels, value));
      root.appendChild(filters);

      const resultCount = addText(root, '');
      const list = document.createElement('ul');
      root.appendChild(list);

      const addEntries = (parent, title, entries) => {
        addText(parent, title, 'h5');
        if (entries.length === 0) {
          addText(parent, '없음');
          return;
        }
        const entryList = document.createElement('ul');
        for (const entry of entries) addText(entryList, `${entry.id}: ${entry.text}`, 'li');
        parent.appendChild(entryList);
      };

      const detailFor = (record) => {
        const detail = document.createElement('section');
        detail.setAttribute('data-student-event-detail', record.id);
        addText(detail, `기록 ${record.id} 상세`, 'h4');
        addText(detail, `기록 ID: ${record.id}`);
        addText(detail, `업무 앱: ${appText(record)}`);
        addEntries(detail, '근거', record.evidence);
        addEntries(detail, '규칙', record.rules);
        addText(detail, `접속 상태: ${statusText(accessLabels, record.state.access)}`);
        addText(detail, `세션 상태: ${statusText(sessionLabels, record.state.session)}`);
        addText(detail, `기기 상태: ${statusText(deviceLabels, record.state.device)}`);
        // 원천에 조치 연결이 없는 단계이므로 상세에는 실행 불가능한 안내만 둔다.
        if (Array.isArray(record.supportedActions) && record.supportedActions.length > 0) {
          addText(detail, '조치 실행 연결은 준비 중입니다. 아래 조치는 아직 지원하지 않습니다.');
          for (const action of record.supportedActions) {
            const unavailable = document.createElement('button');
            unavailable.type = 'button';
            unavailable.textContent = `${action} 미지원`;
            unavailable.disabled = true;
            detail.appendChild(unavailable);
          }
        }
        return detail;
      };

      const rowFor = (record) => {
        const row = document.createElement('li');
        row.setAttribute('data-student-event-id', record.id);
        addText(row, `기록 ID: ${record.id}`);
        addText(row, `시각: ${record.at}`);
        addText(row, `기록 종류: ${kindLabels[record.kind] || '확인 불가'}(${record.kind})`);
        addText(row, `업무 앱: ${appText(record)}`);
        addText(row, `요약: ${record.summary}`);
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${record.id} 상세`;
        button.setAttribute('aria-expanded', 'false');
        row.appendChild(button);
        let detail = null;
        button.addEventListener('click', () => {
          if (detail) {
            detail.remove();
            detail = null;
            button.setAttribute('aria-expanded', 'false');
          } else {
            detail = detailFor(record);
            row.appendChild(detail);
            button.setAttribute('aria-expanded', 'true');
          }
        });
        return row;
      };

      const updateList = () => {
        const selected = records.filter((record) =>
          (kindFilter.value === 'all' || record.kind === kindFilter.value)
          && (appFilter.value === 'all' || appValue(record) === appFilter.value)
          && (accessFilter.value === 'all' || record.state.access === accessFilter.value));
        resultCount.textContent = `필터 결과: ${selected.length}건 / 전달받은 기록: ${records.length}건`;
        // 필터를 바꾸면 이전 상세 DOM도 새 결과로 교체한다.
        list.replaceChildren();
        if (selected.length === 0) {
          addText(list, '조건에 맞는 기록이 없습니다.', 'li');
        } else {
          for (const record of selected) list.appendChild(rowFor(record));
        }
      };
      kindFilter.addEventListener('change', updateList);
      appFilter.addEventListener('change', updateList);
      accessFilter.addEventListener('change', updateList);
      updateList();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode }) {
      // 매 호출마다 새 DOM을 만든다. 갱신 후 이전 실패·목록을 남기지 않는다.
      const root = document.createElement('section');
      const addText = (parent, value, tag = 'p') => {
        const element = document.createElement(tag);
        element.textContent = value;
        parent.appendChild(element);
        return element;
      };
      const sectionFor = (title) => {
        const section = document.createElement('section');
        addText(section, title, 'h3');
        root.appendChild(section);
        return section;
      };
      const modeLabels = {
        demo: '예제 자료(demo)',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      if (Object.hasOwn(modeLabels, mode)) addText(root, `연결 상태: ${modeLabels[mode]}`);
      const deviceLabels = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      };
      const sessionLabels = {
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      };
      const statusText = (labels, code) => {
        const verified = Object.hasOwn(labels, code) ? code : 'unknown';
        return `${labels[verified]}(${verified})`;
      };
      const errorText = (resource) =>
        typeof resource?.error?.message === 'string' && resource.error.message.trim()
          ? resource.error.message : '오류 내용을 확인할 수 없습니다.';
      const hasTimedOut = (resource) =>
        /TIMEOUT|TIMED_OUT/i.test(resource?.error?.code || '') || /시간 초과/.test(errorText(resource));
      const showState = (section, title, resource) => {
        if (resource?.mode && Object.hasOwn(modeLabels, resource.mode)) {
          addText(section, `연결 상태: ${modeLabels[resource.mode]}`);
        }
        if (resource?.status === 'loading') {
          addText(section, `${title} 불러오는 중`);
          return false;
        }
        if (resource?.status === 'error') {
          const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(resource.error?.code);
          const prefix = unverified ? `${title} 확인 불가` : `${title} 정보를 불러오지 못했습니다`;
          addText(section, `${prefix}${hasTimedOut(resource) ? ' (요청 시간 초과)' : ''}: ${errorText(resource)}`);
          addText(section, title === '진단' ? '다시 시도는 위쪽 도움정보 불러오기 버튼을 직접 누르세요.'
            : '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 재요청하지 않습니다.');
          return false;
        }
        if (resource?.status !== 'ok') {
          addText(section, `${title} ${resource?.status === 'idle' ? '조회 전' : '확인 불가'}`);
          return false;
        }
        return true;
      };

      const devicesSection = sectionFor('등록 기기');
      addText(devicesSection, '현재 등록된 본인 기기 중 최대 100개를 확인합니다.');
      if (showState(devicesSection, '기기', devices)) {
        if (!Array.isArray(devices.data)) addText(devicesSection, '기기 목록 확인 불가');
        else if (devices.data.length === 0) addText(devicesSection, '등록된 기기가 없습니다.');
        else {
          const list = document.createElement('ul');
          for (const device of devices.data) {
            addText(list, `${device.label || device.id} (ID: ${device.id}) · ${statusText(deviceLabels, device.status)}`, 'li');
          }
          devicesSection.appendChild(list);
        }
      }

      const sessionsSection = sectionFor('현재 세션');
      addText(sessionsSection, '지금 검증된 연결 한 개만 조회합니다. 과거 세션 전체 목록이 아닙니다.');
      if (showState(sessionsSection, '세션', sessions)) {
        if (!Array.isArray(sessions.data)) addText(sessionsSection, '세션 목록 확인 불가');
        else if (sessions.data.length === 0) addText(sessionsSection, '현재 연결이 없습니다.');
        else {
          const list = document.createElement('ul');
          for (const session of sessions.data) {
            addText(list, `세션 ID: ${session.id} · ${statusText(sessionLabels, session.status)}`, 'li');
          }
          sessionsSection.appendChild(list);
        }
      }

      const notificationSection = sectionFor('알림');
      if (!Array.isArray(notifications) || notifications.length === 0) {
        addText(notificationSection, '주의할 알림이 없습니다.');
      } else {
        const list = document.createElement('ul');
        for (const notice of notifications) {
          const resource = typeof notice.resource === 'string' ? notice.resource : 'unknown';
          const code = typeof notice.code === 'string' ? notice.code : 'unknown';
          const message = typeof notice.message === 'string' ? notice.message : '내용 확인 불가';
          addText(list, `자료: ${resource} · 코드: ${code} · 내용: ${message}`, 'li');
        }
        notificationSection.appendChild(list);
      }

      const diagnosticsSection = sectionFor('진단 도움정보');
      addText(diagnosticsSection, '도움 요청에 필요한 점검 정보만 표시하며, 복사는 버튼을 누를 때만 실행합니다.');
      if (showState(diagnosticsSection, '진단', diagnostics)) {
        const result = diagnostics.data;
        // 응답의 다른 필드(ai, 인증 설정 등)를 펼치거나 직렬화하지 않는다.
        const safe = (value, pattern) =>
          typeof value === 'string' && pattern.test(value) && !/sk-|bearer|password|token|api[_-]?key/i.test(value)
            ? value : '확인 불가';
        const fields = [
          ['requestId', safe(result?.requestId, /^[A-Za-z0-9._:-]{1,100}$/)],
          ['component', safe(result?.component, /^[A-Za-z0-9._-]{1,80}$/)],
          ['version', safe(result?.version, /^[A-Za-z0-9._-]{1,40}$/)],
          ['checkedAt', safe(result?.checkedAt, /^[0-9TZ:+.\-]{1,48}$/)],
          ['engine.mode', safe(result?.engine?.mode, /^[A-Za-z0-9._-]{1,40}$/)],
          ['engine.code', safe(result?.engine?.code, /^[A-Za-z0-9._-]{1,80}$/)],
        ];
        const helpText = fields.map(([name, value]) => `${name}: ${value}`).join('\n');
        for (const [name, value] of fields) addText(diagnosticsSection, `${name}: ${value}`);
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.textContent = '도움정보 복사';
        diagnosticsSection.appendChild(copyButton);
        const copyFeedback = addText(diagnosticsSection, '사용자가 직접 누르면 위의 안전한 진단 정보만 복사합니다.');
        copyButton.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(helpText);
            copyFeedback.textContent = '도움정보를 클립보드에 복사했습니다.';
          } catch {
            copyFeedback.textContent = '클립보드 복사에 실패했습니다. 위의 도움정보를 확인하세요.';
          }
        });
      }
      return root;
    },
    renderVulnerabilities({ status, mode, data, error }) {
      // 매 호출마다 새 DOM을 만들어 조회 중·오류·새 결과에서 이전 패키지 표가 남지 않게 한다.
      const root = document.createElement('section');
      const addText = (parent, message, tag = 'p') => {
        const element = document.createElement(tag);
        element.textContent = message;
        parent.appendChild(element);
        return element;
      };
      const safeText = (value, fallback = '확인 불가') =>
        typeof value === 'string' && value.trim().length > 0 && value.length <= 500
          && !/(?:bearer\s+\S+|sk-[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|password\s*[:=])/i.test(value)
          && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          ? value : fallback;
      const exactVersion = (value) =>
        typeof value === 'string'
        && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value);

      if (typeof mode === 'string' && mode) addText(root, `연결 모드: ${mode}`);

      if (status === 'idle') {
        addText(root, '패키지 취약점 조회 전(idle)', 'h3');
        addText(root, '아직 OSV 조회를 실행하지 않았습니다. 이전 조회 결과를 현재 결과로 표시하지 않습니다.');
        return root;
      }

      if (status === 'loading') {
        addText(root, '패키지 취약점 조회 중(loading)', 'h3');
        addText(root, 'package-lock.json과 설치된 패키지 메타데이터를 대조하고 OSV 조회 결과를 확인하는 중입니다.');
        addText(root, '조회가 끝나기 전에는 이전 패키지 결과를 현재 결과로 표시하지 않습니다.');
        return root;
      }

      if (status === 'error') {
        addText(root, '패키지 취약점 조회 실패(error)', 'h3');
        if (typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code)) {
          addText(root, `오류 코드: ${error.code}`);
        }
        addText(root, `오류 안내: ${safeText(error?.message, '패키지 조회 결과를 확인할 수 없습니다.')}`);
        addText(root, '조회 실패는 취약점이 없다는 뜻이 아닙니다. 이전 결과도 현재 결과로 보지 않습니다.');
        return root;
      }

      if (status !== 'ok' || !data || typeof data !== 'object') {
        addText(root, '패키지 취약점 결과 확인 불가', 'h3');
        addText(root, '현재 조회 결과 형식을 확인할 수 없습니다. 취약점 없음이나 안전으로 판단하지 않습니다.');
        return root;
      }

      const scanLabels = {
        complete: '모두 조회(complete)',
        partial: '일부 조회 실패(partial)',
        not_checked: '아직 조회 안 함(not_checked)',
        not_configured: '조회 준비 미완료(not_configured)',
        unverifiable: 'lock 파일 확인 불가(unverifiable)',
      };
      const scanLabel = Object.hasOwn(scanLabels, data.status)
        ? scanLabels[data.status]
        : `알 수 없는 조회 상태(${safeText(data.status)})`;
      addText(root, `전체 조회 상태: ${scanLabel}`, 'h3');

      if (data.status === 'not_configured') {
        addText(root, '조회 대상 프로젝트 설정이 준비되지 않아 OSV 조회를 수행하지 않은 상태입니다.');
      } else if (data.status === 'not_checked') {
        addText(root, '승인된 공개 조회 대상 패키지가 없어 OSV 조회를 수행하지 않은 상태입니다.');
      } else if (data.status === 'unverifiable') {
        addText(root, 'package-lock.json 또는 설치 메타데이터를 확인할 수 없어 조회 결과를 검증할 수 없습니다.');
      } else if (data.status === 'partial') {
        addText(root, '일부 패키지는 끝까지 확인하지 못했습니다. 이미 받은 취약점 ID는 아래에 그대로 유지합니다.');
      } else if (data.status === 'complete') {
        addText(root, '승인된 조회 대상에 대한 OSV 조회가 완료됐습니다.');
      }

      if (data.lockfileVersion !== undefined && data.lockfileVersion !== null) {
        addText(root, `lockfileVersion: ${data.lockfileVersion}`);
      }
      if (typeof data.lockfileHash === 'string' && data.lockfileHash) {
        addText(root, `lockfileHash: ${data.lockfileHash}`);
      }
      if (typeof data.checkedAt === 'string' && data.checkedAt) {
        addText(root, `전체 확인 시각(checkedAt): ${data.checkedAt}`);
      }

      const packages = Array.isArray(data.packages) ? data.packages : [];
      if (packages.length === 0) {
        if (data.status === 'complete') {
          addText(root, '표시할 승인 패키지 조회 결과가 없습니다. 이것만으로 앱 전체가 안전하다고 판단할 수 없습니다.');
        } else {
          addText(root, '표시할 패키지 조회 결과가 없습니다.');
        }
        return root;
      }

      const list = document.createElement('div');
      addText(root, '패키지별 OSV 조회 결과', 'h4');

      for (const pkg of packages) {
        const row = document.createElement('section');
        const name = typeof pkg?.name === 'string' && pkg.name ? pkg.name : '확인 불가';
        const version = typeof pkg?.version === 'string' && pkg.version ? pkg.version : '확인 불가';
        row.setAttribute('data-student-package-name', name);
        row.setAttribute('data-student-package-version', version);

        addText(row, `패키지: ${name}`, 'h5');
        if (exactVersion(version)) {
          addText(row, `설치된 정확한 버전: ${version}`);
        } else {
          addText(row, `버전 확인 불가: ${version}`);
          addText(row, '버전 범위(^, ~ 등)를 설치된 정확한 버전으로 취급하지 않습니다.');
        }

        const packageStatusLabels = {
          known_vulnerabilities: '알려진 항목 있음(known_vulnerabilities)',
          none_found: '조회 범위에서 알려진 항목 없음(none_found)',
          unverifiable: '조회 확인 불가(unverifiable)',
        };
        const packageLabel = Object.hasOwn(packageStatusLabels, pkg?.status)
          ? packageStatusLabels[pkg.status]
          : `알 수 없는 패키지 상태(${safeText(pkg?.status)})`;
        addText(row, `패키지 조회 상태: ${packageLabel}`);
        if (typeof pkg?.source === 'string' && pkg.source) addText(row, `조회 출처(source): ${pkg.source}`);
        if (typeof pkg?.checkedAt === 'string' && pkg.checkedAt) addText(row, `패키지 확인 시각(checkedAt): ${pkg.checkedAt}`);

        const vulnerabilities = Array.isArray(pkg?.vulnerabilities) ? pkg.vulnerabilities : [];
        if (pkg?.status === 'unverifiable' && vulnerabilities.length > 0) {
          addText(row, '일부 확인·전체 조회 확인 불가: 아래 취약점 ID는 이미 받은 결과이므로 유지합니다.');
        } else if (pkg?.status === 'unverifiable') {
          addText(row, '이 패키지는 조회를 끝까지 확인할 수 없습니다. 취약점 없음으로 판단하지 않습니다.');
        } else if (pkg?.status === 'none_found') {
          addText(row, 'OSV 조회 범위와 조회 시점에서 알려진 항목을 찾지 못했습니다. 패키지나 앱 전체의 안전을 보장하는 결과는 아닙니다.');
        }

        if (vulnerabilities.length > 0) {
          const findings = document.createElement('ul');
          for (const finding of vulnerabilities) {
            const item = document.createElement('li');
            const findingId = safeText(finding?.id);
            const modified = safeText(finding?.modified);
            item.textContent = `취약점 ID: ${findingId} · 수정 시각(modified): ${modified}`;
            findings.appendChild(item);
          }
          row.appendChild(findings);
        } else if (pkg?.status === 'known_vulnerabilities') {
          addText(row, '알려진 항목 상태이지만 취약점 상세를 확인할 수 없습니다.');
        }

        list.appendChild(row);
      }

      root.appendChild(list);
      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted }) {
      // 제공 UI가 검사하고 전달한 점검 결과만 표시한다. 모델 목록 점검은 사건 설명 실행이 아니다.
      const root = document.createElement('section');
      const addText = (message) => {
        const line = document.createElement('p');
        line.textContent = message;
        root.appendChild(line);
      };
      const modeLabels = {
        demo: '예제 자료(demo) · 실제 연결 아님',
        disconnected: '연결 없음(disconnected)',
        unknown: '연결 상태 확인 불가(unknown)',
      };
      if (Object.hasOwn(modeLabels, mode)) addText(`연결 상태: ${modeLabels[mode]}`);

      if (status === 'idle') {
        addText('AI 연결 점검 전');
        addText('현재 API 연결 점검 버튼을 직접 눌러 확인하세요. 자동으로 점검하지 않습니다.');
        return root;
      }
      if (status === 'loading') {
        addText('AI 연결 점검 중');
        addText('연결 결과를 아직 확인하지 못했습니다. 사건 설명은 실행한 것으로 표시하지 않습니다.');
        return root;
      }
      if (status === 'error') {
        // 제공 UI에서 안전한 메시지로 정규화하지만, 학생 칸에서도 비밀형 텍스트를 다시 거른다.
        const categories = {
          ON_AI_PROVISIONING_PENDING: '앱 이용 권한 준비 중입니다. 담당자에게 계정 연결과 앱 권한을 확인하세요.',
          ON_AI_AUTHORIZATION_CHANGED: '앱 이용 권한이 변경됐습니다. 담당자에게 현재 권한을 확인하세요.',
          SUBJECT_SCOPE_UNVERIFIED: '현재 계정과 사건의 연결을 확인할 수 없습니다. 담당자에게 확인하세요.',
          WB_CLCO_AUTH_REQUIRED: '인증 확인이 필요합니다. 계정 연결을 다시 확인하고 담당자에게 문의하세요.',
          WB_CLCO_ACCESS_BLOCKED: '앱 접근이 제한됐습니다. 담당자에게 앱 이용 권한을 확인하세요.',
          WB_CLCO_COHORT_BUDGET_EXHAUSTED: '반의 AI 사용량이 소진됐습니다. 담당자에게 확인하세요.',
          WB_CLCO_LIMIT_REACHED: 'AI 이용 한도에 도달했습니다. 담당자에게 확인하세요.',
          WB_CLCO_SESSION_CLOSED: '현재 AI 이용 시간이 아닙니다. 이용 시간을 확인하세요.',
          WB_CLCO_RATE_LIMITED: 'AI 요청이 제한됐습니다. 잠시 후 사용자가 직접 다시 점검하세요.',
          WB_CLCO_TIMEOUT: 'AI 요청 시간이 초과됐습니다. 사용자가 직접 다시 점검하세요.',
          REQUEST_TIMEOUT: 'AI 연결 요청 시간이 초과됐습니다. 사용자가 직접 다시 점검하세요.',
          ENGINE_TIMEOUT: '서버 확인 시간이 초과됐습니다. 사용자가 직접 다시 점검하세요.',
          TIMEOUT: '요청 시간이 초과됐습니다. 사용자가 직접 다시 점검하세요.',
          WB_CLCO_NETWORK_ERROR: '네트워크 연결에 실패했습니다. 연결 상태 확인 후 직접 다시 점검하세요.',
          NETWORK_ERROR: '네트워크 연결에 실패했습니다. 연결 상태 확인 후 직접 다시 점검하세요.',
          WB_CLCO_CANCELLED: 'AI 점검이 취소됐습니다. 이전 결과는 현재 점검 결과가 아닙니다.',
          CANCELLED: 'AI 점검이 취소됐습니다. 이전 결과는 현재 점검 결과가 아닙니다.',
          REQUEST_CANCELLED: 'AI 점검이 취소됐습니다. 이전 결과는 현재 점검 결과가 아닙니다.',
          MODEL_NOT_CONFIGURED: '사용할 AI 모델이 설정되지 않았습니다. 담당자에게 모델 설정을 확인하세요.',
          ON_AI_MODEL_LIST_EMPTY: '현재 권한으로 이용할 수 있는 AI 모델이 없습니다. 담당자에게 모델 허용 설정을 확인하세요.',
          ON_AI_INVALID_INPUT: 'AI 점검 입력을 확인할 수 없습니다. 담당자에게 문의하세요.',
          ON_AI_INVALID_OUTPUT: 'AI 응답을 확인할 수 없습니다. 담당자에게 문의하세요.',
          AI_REQUEST_UNVERIFIED: 'AI 연결 또는 응답의 원인을 확인할 수 없습니다. 네트워크 등 일시적 요청 문제일 수도 있으므로 연결 상태를 확인하고 잠시 뒤 현재 API 연결 점검 버튼을 직접 눌러 재점검하세요. 문제가 계속되면 담당자에게 계정과 앱 권한을 확인하세요. 네트워크 장애로 확정된 것은 아닙니다.',
        };
        const code = typeof error?.code === 'string' && Object.hasOwn(categories, error.code)
          ? error.code : 'AI_REQUEST_UNVERIFIED';
        const supplied = error?.message;
        const containsSecret = /(?:bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[a-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
        const safeMessage = typeof supplied === 'string' && supplied.trim().length > 0
          && supplied.length <= 500 && !containsSecret.test(supplied)
          && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(supplied)
          ? supplied : '오류 내용을 안전하게 확인할 수 없습니다.';
        addText(`AI 연결 점검 실패 · 오류 코드: ${code}`);
        addText(`오류 안내: ${safeMessage}`);
        addText(categories[code]);
        addText('다시 점검하려면 현재 API 연결 점검 버튼을 직접 누르세요. 자동 재점검하지 않습니다.');
        return root;
      }
      if (status !== 'ok') {
        addText('AI 연결 상태를 확인할 수 없습니다.');
        return root;
      }

      if (data?.transportChecked !== true || !['test', 'verified'].includes(data?.audienceAuthorization)
        || !Number.isInteger(data?.modelCount) || data.modelCount < 0) {
        addText('AI 연결 점검 결과를 확인할 수 없습니다. 정상 연결로 간주하지 마세요.');
        return root;
      }
      if (data.audienceAuthorization === 'test') {
        addText('시험 연결 점검(test) · 앱 이용 권한이 확인된 상태는 아닙니다.');
      } else {
        addText('앱 권한 확인 후 점검(verified) · 해당 확인 시점의 결과입니다.');
      }
      addText(`확인된 모델 수(modelCount): ${data.modelCount}`);
      addText(`점검 시각(checkedAt): ${typeof checkedAt === 'string' && checkedAt ? checkedAt : '확인 불가'}`);
      addText('AI 연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다.');
      addText('모델 목록 응답은 특정 보안 사건의 설명 성공을 뜻하지 않습니다. 사건 설명은 보안 기록에서 별도로 요청해야 합니다.');
      return root;
    },
    renderExplanation({ event, explanation, checkedAt }) {
      // 매 호출마다 새 DOM을 반환해 다른 사건 선택·새로고침·실패 때 이전 설명과 성공 표식을 남기지 않는다.
      const root = document.createElement('section');
      const addText = (parent, message, tag = 'p') => {
        const element = document.createElement(tag);
        element.textContent = message;
        parent.appendChild(element);
        return element;
      };
      const addList = (title, rows) => {
        addText(root, title, 'h4');
        if (rows.length === 0) {
          addText(root, '없음');
          return;
        }
        const list = document.createElement('ul');
        for (const row of rows) addText(list, row, 'li');
        root.appendChild(list);
      };
      const containsSecret = /(?:bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[a-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i;
      const safeMessage = (value, fallback = '오류 내용을 안전하게 확인할 수 없습니다.') =>
        typeof value === 'string' && value.trim().length > 0 && value.length <= 500
          && !containsSecret.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          ? value : fallback;
      const safeCode = (value) =>
        typeof value === 'string' && /^[A-Za-z0-9._:-]{1,80}$/.test(value)
          ? value : 'AI_REQUEST_UNVERIFIED';

      const rejectExplanation = (message, detail = null) => {
        addText(root, 'AI 설명을 사용할 수 없습니다.', 'h4');
        addText(root, message);
        if (detail) addText(root, detail);
        addText(root, '기존 보안 기록은 그대로입니다. 설명만으로 보안 조치가 실행되지 않습니다.');
        return root;
      };

      // 오류는 사건 선택 여부보다 먼저 표시한다. event=null 이어도 실패 이유를 숨기지 않는다.
      if (explanation?.status === 'error') {
        const code = safeCode(explanation.error?.code);
        const message = safeMessage(explanation.error?.message);
        addText(root, `AI 설명 실패: ${message}`, 'h4');
        addText(root, `오류 코드: ${code}`);
        if (code === 'ON_AI_INVALID_INPUT') {
          addText(root, '설명에 필요한 사건 근거가 부족하거나 입력 검증에 실패해 설명을 만들 수 없습니다.');
        } else if (code === 'ON_AI_INVALID_OUTPUT') {
          addText(root, 'AI 설명의 근거가 현재 사건과 맞지 않거나, 근거 누락·지원하지 않는 조치·실행 주장 등 출력 검증에 실패해 설명을 사용할 수 없습니다.');
        } else {
          addText(root, 'AI 설명 결과를 확인할 수 없습니다. 성공한 설명으로 취급하지 않습니다.');
        }
        addText(root, '기존 보안 기록은 그대로입니다. AI 설명 실패는 기존 업무 앱 판정이나 기록을 바꾸지 않습니다.');
        return root;
      }

      if (!event || typeof event.id !== 'string' || !event.id.trim()) {
        addText(root, '보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }

      if (explanation?.status === 'idle') {
        addText(root, `사건 ${event.id} · AI 설명 요청 전`);
        return root;
      }
      if (explanation?.status === 'loading') {
        addText(root, `사건 ${event.id} · AI 설명 요청 중`);
        return root;
      }
      if (explanation?.status !== 'ok') {
        addText(root, `사건 ${event.id} · AI 설명 확인 불가`);
        addText(root, '기존 보안 기록은 그대로입니다.');
        return root;
      }

      const data = explanation.data;
      if (!data || typeof data !== 'object'
        || typeof data.summary !== 'string' || !data.summary.trim()
        || !Array.isArray(data.evidenceIds)
        || !Array.isArray(data.proposals)) {
        return rejectExplanation('설명 데이터 형식을 확인할 수 없습니다. 근거가 부족하거나 응답 검증에 실패했습니다.');
      }

      const evidence = Array.isArray(event.evidence) ? event.evidence : [];
      if (evidence.length === 0) {
        return rejectExplanation('현재 사건에 설명과 대조할 근거가 없어 AI 설명을 사용할 수 없습니다.', '근거 부족: 사건의 evidence가 비어 있습니다.');
      }
      const evidenceMap = new Map();
      for (const row of evidence) {
        if (!row || typeof row.id !== 'string' || !row.id
          || typeof row.text !== 'string' || !row.text.trim()
          || evidenceMap.has(row.id)) {
          return rejectExplanation('현재 사건의 근거 형식을 확인할 수 없어 AI 설명을 사용할 수 없습니다.');
        }
        evidenceMap.set(row.id, row.text);
      }

      const citedIds = data.evidenceIds;
      const citedSet = new Set(citedIds);
      const exactEvidence = citedIds.length === evidenceMap.size
        && citedSet.size === citedIds.length
        && citedIds.every((id) => typeof id === 'string' && evidenceMap.has(id))
        && [...evidenceMap.keys()].every((id) => citedSet.has(id));
      if (!exactEvidence) {
        return rejectExplanation(
          'AI 설명의 근거가 현재 선택한 사건의 근거와 일치하지 않습니다.',
          '없는 근거를 만들어 맞추거나, 빠진 근거를 성공한 설명으로 표시하지 않습니다.',
        );
      }

      const rules = Array.isArray(event.rules) ? event.rules : [];
      if (rules.some((rule) => !rule || typeof rule.id !== 'string' || !rule.id
        || typeof rule.text !== 'string' || !rule.text.trim())) {
        return rejectExplanation('현재 사건의 규칙 정보를 확인할 수 없어 AI 설명을 사용할 수 없습니다.');
      }

      const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
      if (data.requiresHumanConfirmation !== true || data.executed !== false) {
        return rejectExplanation(
          'AI가 이미 조치를 실행했다고 답했거나 사람 확인 조건을 확인할 수 없어 이 설명을 사용할 수 없습니다.',
          '조치 제안은 사람이 확인해야 실행되며, AI 설명 단계에서는 실행되지 않아야 합니다.',
        );
      }

      for (const proposal of data.proposals) {
        if (!proposal || typeof proposal.action !== 'string' || !proposal.action
          || typeof proposal.reason !== 'string' || !proposal.reason.trim()
          || !Array.isArray(proposal.evidenceIds)) {
          return rejectExplanation('AI 조치 제안 형식을 확인할 수 없어 설명을 사용할 수 없습니다.');
        }
        const proposalIds = new Set(proposal.evidenceIds);
        if (proposalIds.size !== proposal.evidenceIds.length
          || proposal.evidenceIds.length === 0
          || proposal.evidenceIds.some((id) => typeof id !== 'string' || !evidenceMap.has(id))) {
          return rejectExplanation('AI 조치 제안의 근거가 현재 사건과 맞지 않아 설명을 사용할 수 없습니다.');
        }
        if (!supportedActions.includes(proposal.action)) {
          return rejectExplanation('현재 사건에서 지원하지 않는 조치를 AI가 제안해 설명을 사용할 수 없습니다.');
        }
        if (proposal.executed === true) {
          return rejectExplanation('AI가 조치를 이미 실행했다고 표시한 설명은 사용할 수 없습니다.');
        }
      }

      // 여기까지 통과한 현재 사건의 성공 설명에만 채점 표식을 붙인다.
      root.setAttribute('data-student-explanation-event', event.id);
      addText(root, 'AI 설명(참고용)', 'h3');
      addText(root, `사건 ID: ${event.id}`);
      addText(root, `AI 요약: ${data.summary}`);
      if (typeof checkedAt === 'string' && checkedAt) addText(root, `설명 확인 시각: ${checkedAt}`);
      addText(root, 'AI 설명은 참고 정보입니다. 사실 판단은 아래 근거·규칙·연동 시스템 상태를 기준으로 합니다.');

      addList('인용한 근거', citedIds.map((id) => `${id} — ${evidenceMap.get(id)}`));
      addList('적용 규칙', rules.map((rule) => `${rule.id} — ${rule.text}`));

      const unknownLabels = [
        ['access', '접속'],
        ['session', '세션'],
        ['device', '기기'],
      ];
      const unknownRows = unknownLabels
        .filter(([key]) => event.state?.[key] === 'unknown')
        .map(([, label]) => `${label}: 확인 불가(unknown)`);
      addList('확인 불가 상태', unknownRows);

      addText(root, 'AI 조치 제안', 'h4');
      if (data.proposals.length === 0) {
        if (supportedActions.length === 0) {
          addText(root, '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).');
        } else {
          addText(root, 'AI가 제안한 조치가 없습니다.');
        }
      } else {
        const list = document.createElement('ul');
        for (const proposal of data.proposals) {
          const item = document.createElement('li');
          addText(item, `조치: ${proposal.action}`);
          addText(item, `이유: ${proposal.reason}`);
          addText(item, `근거 ID: ${proposal.evidenceIds.join(', ')}`);
          addText(item, '사람 확인이 필요하며 실행되지 않았습니다.');
          list.appendChild(item);
        }
        root.appendChild(list);
      }

      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error }) {
      // 매 호출마다 새 DOM을 만들어 새 사건·새 요청에서 이전 대상·영수증·결과가 남지 않게 한다.
      const root = document.createElement('section');
      const addText = (text, tag = 'p') => {
        const element = document.createElement(tag);
        element.textContent = text;
        root.appendChild(element);
        return element;
      };
      const containsSecret = /(?:bearer\s+\S+|sk-(?:proj-|ant-|svcacct-|on-)?[a-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰|confirmation(?:id|ticket)?)\s*[:=]\s*\S+)/i;
      const safeText = (value, fallback = '확인할 수 없습니다.') =>
        typeof value === 'string' && value.trim().length > 0 && value.length <= 500
          && !containsSecret.test(value) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
          ? value : fallback;
      const safeCode = (value) =>
        typeof value === 'string' && /^[A-Za-z0-9._:-]{1,80}$/.test(value)
          ? value : 'ACTION_RESULT_UNVERIFIED';
      const present = (value) => value !== undefined && value !== null && value !== '';

      const eventId = typeof event?.id === 'string' && event.id ? event.id : null;
      const evidenceIds = Array.isArray(event?.evidence)
        ? event.evidence.filter((row) => row && typeof row.id === 'string' && row.id).map((row) => row.id)
        : [];
      const currentAction = typeof actionId === 'string' && actionId ? actionId : null;
      const targetId = typeof target?.id === 'string' && target.id ? target.id : null;
      const targetGeneration = Number.isSafeInteger(target?.generation) ? target.generation : null;
      const requestId = typeof receipt?.requestId === 'string' && receipt.requestId ? receipt.requestId : null;
      const receiptId = typeof receipt?.receiptId === 'string' && receipt.receiptId ? receipt.receiptId : null;
      const version = Number.isSafeInteger(receipt?.version) ? receipt.version : null;

      const receiptMatchesCurrent = !receipt || (
        present(receipt.eventId)
        && present(receipt.actionId)
        && receipt.eventId === eventId
        && receipt.actionId === currentAction
      );

      const showBinding = () => {
        if (eventId) addText(`사건 ID: ${eventId}`);
        if (evidenceIds.length > 0) addText(`근거 ID: ${evidenceIds.join(', ')}`);
        if (currentAction) addText(`조치 ID: ${currentAction}`);
        if (targetId) addText(`실제 대상 ID: ${targetId}`);
        if (targetGeneration !== null) addText(`대상 세대(generation): ${targetGeneration}`);
        if (requestId) addText(`요청 ID(requestId): ${requestId}`);
        if (receiptId) addText(`접수 ID(receiptId): ${receiptId}`);
        if (version !== null) addText(`결과 버전(version): ${version}`);
        if (receipt?.replayed === true) {
          addText('같은 요청의 기존 접수 기록을 재사용했습니다(replayed: true). 새 조치가 다시 실행됐다는 뜻이 아닙니다.');
        } else if (receipt?.replayed === false) {
          addText('접수 재사용 여부(replayed): false');
        }
      };

      // 제공 화면이 검증한 현재 사건/조치와 영수증이 어긋나면 성공·효과로 표시하지 않는다.
      if (!receiptMatchesCurrent) {
        addText('결과 불명(unknown)', 'h3');
        addText('접수 정보가 현재 사건 또는 조치와 일치하지 않아 결과를 사용할 수 없습니다.');
        showBinding();
        addText('성공이나 효과 없음으로 판단하지 말고 제공 화면의 「연동 시스템 결과만 재조회」를 사용하세요.');
        return root;
      }

      if (status === 'idle') {
        addText('아직 미실행(idle)', 'h3');
        if (eventId && Array.isArray(event?.supportedActions) && event.supportedActions.length === 0) {
          addText('연동 시스템이 지원하는 조치가 없어 조치 준비 버튼이 나오지 않는 것이 정상입니다.');
        } else {
          addText('조치 제안은 아직 실행되지 않았습니다. 조치 준비와 집행은 제공 화면에서만 진행합니다.');
        }
        showBinding();
        return root;
      }

      if (status === 'loading') {
        addText('조치 준비 또는 결과 조회 중(loading)', 'h3');
        addText(safeText(message, '현재 조치 상태를 확인하는 중입니다.'));
        addText('아직 결과가 확인되지 않았습니다. 성공이나 완료로 판단하지 않습니다.');
        showBinding();
        return root;
      }

      if (status === 'prepared') {
        addText('준비됨·미실행(prepared)', 'h3');
        addText('실제 대상과 조치를 확인한 뒤 제공 화면의 사람 확인 절차를 거쳐야 합니다. 아직 서버에 집행된 상태가 아닙니다.');
        showBinding();
        addText(`사람 확인 기한(confirmationExpiresAt): ${present(confirmationExpiresAt) ? confirmationExpiresAt : '확인 불가'}`);
        addText('확인 번호나 인증 티켓은 학생 화면에서 만들거나 저장하지 않습니다.');
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'executing') {
        addText('서버에 전달 중(executing)', 'h3');
        addText('사람 확인 뒤 조치 요청을 서버에 전달하고 있습니다. 결과가 아직 없으며 성공·완료 상태가 아닙니다.');
        showBinding();
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'pending') {
        addText('서버 접수·처리 중(pending)', 'h3');
        addText('서버가 요청을 받았다는 접수 응답(ACK)만 확인된 상태입니다. ACK는 조치 효과나 실행 성공을 뜻하지 않습니다.');
        showBinding();
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'succeeded') {
        const effectConfirmed = observation?.effectApplied === true
          && typeof observation?.observedAt === 'string' && observation.observedAt;
        if (!effectConfirmed) {
          addText('결과 불명(unknown)', 'h3');
          addText('상태는 succeeded로 전달됐지만 연동 시스템의 실제 효과 관측(effectApplied: true)을 확인할 수 없습니다.');
          showBinding();
          addText('성공이나 효과 없음으로 단정하지 말고 제공 화면의 「연동 시스템 결과만 재조회」를 사용하세요.');
          return root;
        }
        addText('효과 확인(succeeded)', 'h3');
        addText(`관측 시각(observedAt): ${observation.observedAt}`);
        addText('effectApplied: true');
        showBinding();
        if (receiptId) addText(`효과 확인 영수증(receiptId): ${receiptId}`);
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'denied') {
        addText('연동 시스템 거절(denied)', 'h3');
        addText(`안내: ${safeText(message, '연동 시스템이 조치 요청을 거절했습니다.')}`);
        showBinding();
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'failed') {
        addText('연동 시스템 처리 실패(failed)', 'h3');
        addText(`안내: ${safeText(message, '연동 시스템에서 조치 처리에 실패했습니다.')}`);
        showBinding();
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'unknown') {
        addText('결과 불명(unknown)', 'h3');
        addText(safeText(message, '조치 처리 결과를 확인할 수 없습니다.'));
        if (receipt?.superseded === true) addText('이전 조회는 최신 결과를 대신하지 않습니다(superseded).');
        showBinding();
        addText('효과가 없다고도 성공했다고도 판단하지 마세요. 제공 화면의 「연동 시스템 결과만 재조회」로 결과만 다시 확인하세요.');
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'expired') {
        addText('확인 기한 지남(expired)', 'h3');
        addText('이 준비 상태로는 더 이상 집행할 수 없습니다. 현재 사건과 대상을 다시 확인하고 제공 화면에서 조치를 다시 준비하세요.');
        if (present(confirmationExpiresAt)) addText(`지난 확인 기한(confirmationExpiresAt): ${confirmationExpiresAt}`);
        showBinding();
        if (eventId && requestId) {
          root.setAttribute('data-student-action-event', eventId);
          root.setAttribute('data-student-action-request', requestId);
        }
        return root;
      }

      if (status === 'error') {
        addText('요청 처리 안 됨(error)', 'h3');
        addText(`오류 코드: ${safeCode(error?.code)}`);
        addText(`오류 안내: ${safeText(error?.message, '조치 요청을 처리할 수 없습니다.')}`);
        showBinding();
        addText('이 오류는 조치 성공이나 효과 없음의 확인이 아닙니다.');
        return root;
      }

      addText('결과 불명(unknown)', 'h3');
      addText(`알 수 없는 조치 상태: ${typeof status === 'string' ? status : '확인 불가'}`);
      showBinding();
      addText('성공이나 효과 없음으로 판단하지 말고 제공 화면의 결과 재조회를 사용하세요.');
      return root;
    },
  };
}
