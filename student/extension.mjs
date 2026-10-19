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
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
