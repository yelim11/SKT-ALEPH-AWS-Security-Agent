// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.

// 개인 개발용 캐릭터 안내. 현재 0.2.11은 학생 전용 이미지/CSS 경로를 제공하지 않아
// 이름과 임시 기호만 표시한다. 공식 이미지는 공개 Git에 포함하지 않는다.
const FINAL_WEEK_CHARACTERS = Object.freeze({
  identity: ['🐹', '치이카와', '사용자·기기·세션'],
  decision: ['🦦', '랏코', '업무 앱 접근 판정'],
  events: ['🐱', '하치와레', '보안 기록 타임라인'],
  status: ['💗', '모몽가', '내 PC 상태와 알림'],
  ai: ['🌰', '쿠리만쥬', 'AI 연결 점검'],
  explanation: ['🦀', '카니', '사건 설명과 근거'],
  action: ['🐰', '우사기', '조치 상태 확인'],
  vulnerabilities: ['🌼', '시사', '설치 패키지 점검'],
});

function addFinalWeekCharacter(root, slot) {
  const [symbol, name, topic] = FINAL_WEEK_CHARACTERS[slot];
  const heading = document.createElement('div');
  heading.className = 'notice';
  const title = document.createElement('h3');
  title.textContent = slot === 'status' ? topic : symbol + ' ' + name + ' · ' + topic;
  const source = document.createElement('span');
  source.className = 'tag tag-student';
  source.textContent = '학생 테마 · 개인 사용';
  heading.append(title, source);
  root.appendChild(heading);
}

// PC 값을 받을 수 없는 앱 버전에서 미측정 항목을 정상/0으로 꾸미지 않는다.
function addPcReadOnlyAvailability(root, mode) {
  const box=document.createElement('section');box.className='card';
  const title=document.createElement('h3');
  title.textContent='보안 Agent 연결 정보';
  const info=document.createElement('p');
  info.textContent='Windows CPU·메모리·방화벽·이벤트 실측은 위쪽 로컬 PC 상태 화면에서 별도 조회합니다. 아래 기기·세션 자료는 Windows 실측과 다릅니다.';
  box.append(title,info);
  if(mode==='demo'){
    const warning=document.createElement('p');
    warning.textContent='예제 모드: SDP/XDR·기기·세션 내용은 실제 운영 탐지가 아닙니다.';
    box.append(warning);
  }
  root.append(box);
}


// Personal dashboard summaries read ONLY the validated inputs of the existing student renderers.
// No re-fetching of private events and no persistence of any security evidence.
let noeUpdateEvents=null;
let noeUpdateStatus=null;

// NOE_PRIVATE_SHELL_BEGIN — personal theme; no SDP/auth/action changes.
function installNoePrivatePages() {
  const $ = id => document.getElementById(id);
  if ($('noe-page-home')) return;
  const protection = $('view-protection');
  const records = $('view-records');
  const apps = $('view-apps');
  const nav = $('nav');
  const homeTab = $('tab-protection');
  const recordTab = $('tab-records');
  const appTab = $('tab-apps');
  if (!protection || !records || !apps || !nav || !homeTab || !recordTab || !appTab) return;

  const el = (tag, cls = '', value = '') => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value) n.textContent = value;
    return n;
  };

  // NOE_CHARTS_2026: SVG-free, accessible visual meters. Unknown is never 0%.
  const meter=(name,klass='')=>{
    const track=el('div','noe-bar '+klass),fill=el('div','noe-bar-fill');
    track.setAttribute('role','progressbar');
    track.setAttribute('aria-label',name);
    track.setAttribute('aria-valuemin','0');
    track.setAttribute('aria-valuemax','100');
    track.setAttribute('aria-valuetext','확인 불가');
    track.classList.add('noe-bar-unknown');
    track.append(fill);
    return {track,fill};
  };
  const drawMeter=(m,value)=>{
    const valid=typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;
    m.track.classList.toggle('noe-bar-unknown',!valid);
    m.track.toggleAttribute('data-known',valid);
    if(valid){
      const pct=Math.max(0,Math.min(100,value));
      m.fill.style.width=pct.toFixed(2)+'%';
      m.track.setAttribute('aria-valuenow',String(Math.round(pct)));
      m.track.setAttribute('aria-valuetext',pct.toFixed(1)+'%');
    }else{
      m.fill.style.width='0%';
      m.track.removeAttribute('aria-valuenow');
      m.track.setAttribute('aria-valuetext','확인 불가');
    }
  };
  const art = name => {
    const a = el('span', 'noe-art noe-art--' + name);
    a.setAttribute('aria-hidden','true');
    return a;
  };
  const titleRow = (name, symbol, subtitle) => {
    const h = el('header','noe-page-heading');
    const info=el('div');
    info.append(el('h1','',name),el('p','noe-muted',subtitle));
    h.append(info,art(symbol));
    return h;
  };
  const makePage = (name, symbol, subtitle, key) => {
    const p = el('section','noe-page');
    p.id = 'noe-page-' + key;
    p.append(titleRow(name,symbol,subtitle));
    protection.appendChild(p);
    return p;
  };

  // Preserve ALL original provided DOM and event IDs, but keep it behind a
  // disclosure on the PC status page rather than dumping every section at Home.
  const original = document.createElement('div');
  original.id = 'noe-original-protection';
  while(protection.firstChild) original.appendChild(protection.firstChild);
  const home = makePage('홈','glasses','보안 기록과 PC 점검을 한 곳에서 확인해요.','home');
  const pc = makePage('내 PC 상태','hachi-glasses','Windows CPU·메모리·디스크·방화벽·이벤트를 읽기 전용으로 조회합니다.','pc');
  const alerts = makePage('위험 알림','rakko','SDP·XDR·Windows 경고와 조회 실패는 서로 다르게 표시합니다.','alerts');
  const checks = makePage('오늘의 점검','kuri','직접 확인한 항목만 기록합니다. 보안 점수나 검사 성공을 뜻하지 않아요.','checks');
  const ai = makePage('AI 연결','usagi','계정 확인 · AI 앱 승인 · 모델 연결 점검','ai');
  const settings = makePage('설정','blackstar','개인용 테마 설정 및 사용 안내','settings');
  const originalDisclosure = document.createElement('details');
  originalDisclosure.id = 'noe-provided-disclosure';
  originalDisclosure.className = 'noe-disclosure';
  originalDisclosure.append(el('summary','','기존 보안 Agent 상세 정보 · 계정/기기/AI/취약점 펼쳐보기'), original);
  pc.appendChild(originalDisclosure);

  // Move the original trusted controls without cloning any nodes or adding auth APIs.
  // Their IDs and existing event handlers remain unchanged.
  const aiIntro=el('section','noe-panel');
  aiIntro.append(
    el('h2','','AI 연결 순서'),
    el('p','noe-muted','① 계정 연결 → ② AI 앱 승인 → ③ API 연결 점검 → ④ 보안 기록에서 사건 선택 후 AI 설명'),
    el('p','noe-footnote','PC 사용량과 Windows 오류 확인에는 AI 연결이 필요하지 않습니다. AI 연결 성공과 사건 설명 성공도 서로 다릅니다.'),
    el('p','noe-footnote','비밀번호와 API 키를 이 화면에 직접 입력하지 않습니다. 예제 모드에서는 실제 AI 이용 권한이 확인되지 않습니다.')
  );
  ai.append(aiIntro);
  for(const titleId of ['ai-connect-title','ai-connection-title','student-ai-connection-title']){
    const card=$(titleId)?.closest('.card');
    if(card)ai.append(card);
  }
  const goToRecords=el('button','btn','AI 사건 설명: 보안 기록으로 이동');
  goToRecords.type='button';goToRecords.addEventListener('click',()=>showPage('records'));
  ai.append(goToRecords);

  // Keep the actual original student state renderer prominently visible in PC view.
  const status = $('student-status');
  const statusCard = status && status.closest('.card.student');
  if (statusCard) pc.insertBefore(statusCard, originalDisclosure);

  const welcome = el('section','noe-welcome');
  welcome.append(
    el('p','noe-eyebrow','나만의 보안 일기장'),
    el('h2','','오늘의 보안도\n차근차근 살펴볼까?'),
    el('p','','보안 기록과 내 PC 상태를 한눈에 확인하는 공간'),
    el('span','noe-preview-label','실제 조회와 예제 자료는 분리해서 표시해요'),
    art('glasses')
  );
  home.appendChild(welcome);

  const soundKey='noe-personal-click-sound-v1';
  let audioCtx;
  function chime(frequency) {
    try {
      if (localStorage.getItem(soundKey) === 'off') return;
      const A=window.AudioContext||window.webkitAudioContext;
      if(!A)return;
      audioCtx=audioCtx||new A();
      const t=audioCtx.currentTime;
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.type='sine';o.frequency.setValueAtTime(frequency,t);
      g.gain.setValueAtTime(.012,t);g.gain.exponentialRampToValueAtTime(.001,t+.10);
      o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.10);
    }catch { /* Optional sound may be unavailable. */ }
  }

  const subpages = { home,pc,alerts,checks,ai,settings };
  const sideColumn=nav.closest('.sidebar');
  if(!sideColumn)return;
  const extraNav=el('div','noe-extra-nav');
  extraNav.id='noe-extra-nav';
  extraNav.setAttribute('aria-label','개인 기능 메뉴');
  extraNav.setAttribute('role','group');
  nav.insertBefore(recordTab,appTab);
  nav.insertBefore(extraNav,appTab);
  const settingsFooter=el('div','noe-sidebar-footer');
  settingsFooter.id='noe-sidebar-footer';
  settingsFooter.setAttribute('role','group');
  settingsFooter.setAttribute('aria-label','개인 설정');
  sideColumn.appendChild(settingsFooter);
  const navExtras=[];
  let navigating=false;
  function showPage(page) {
    if (!['home','records','pc','alerts','checks','ai','settings','apps'].includes(page))return;
    // The provided frontend owns its three top-level panels. We only invoke
    // the existing button handlers; never change its auth/network lifecycle.
    navigating=true;
    try {
      const target=(page==='records')?recordTab:(page==='apps')?appTab:homeTab;
      if(target.getAttribute('aria-selected')!=='true')target.click();
    } finally {navigating=false;}
    for(const [name,node] of Object.entries(subpages))node.hidden=(name!==page);
    for(const [name,node] of navExtras){
      if(name===page)node.setAttribute('aria-current','page');
      else node.removeAttribute('aria-current');
    }
    homeTab.classList.toggle('noe-current',page==='home');
    recordTab.classList.toggle('noe-current',page==='records');
    appTab.classList.toggle('noe-current',page==='apps');
    if((page==='pc'||page==='alerts')&&!pcLoaded&&!pcLoading)readLocalPc();
    if(page==='checks')synchronizeCheckDay();
    window.scrollTo({top:0,behavior:'auto'});
  }
  const addNav=(id,name,symbol,page)=>{
    const b=el('button','noe-nav-extra');b.id=id;b.type='button';
    b.append(art(symbol),el('span','',name));
    b.addEventListener('click',()=>{chime(560);showPage(page);});
    (page==='settings'?settingsFooter:extraNav).appendChild(b);
    navExtras.push([page,b]);
  };
  addNav('noe-nav-pc','내 PC 상태','hachi-glasses','pc');
  addNav('noe-nav-alerts','위험 알림','rakko','alerts');
  addNav('noe-nav-checks','오늘의 점검','kuri','checks');
  addNav('noe-nav-ai','AI 연결','usagi','ai');
  addNav('noe-nav-settings','설정','blackstar','settings');
  homeTab.textContent='홈';
  const brand=document.querySelector('.brand-name');
  if(brand){brand.textContent='노예';brand.append(el('small','','보안 Agent · 개인용'));}
  document.title='노예 · 보안 일기장';
  const brandIcon=document.querySelector('.brand-icon');
  if(brandIcon)brandIcon.setAttribute('alt','');
  // Direct clicks on provided tabs (including keyboard) return to proper pages.
  homeTab.addEventListener('click',()=>{if(!navigating)showPage('home');});
  recordTab.addEventListener('click',()=>{if(!navigating)showPage('records');});
  appTab.addEventListener('click',()=>{if(!navigating)showPage('apps');});
  nav.addEventListener('keydown',(e)=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      setTimeout(()=>{
        const selected=nav.querySelector('[role="tab"][aria-selected="true"]');
        if(selected===homeTab)showPage('home');
        else if(selected===recordTab)showPage('records');
        else if(selected===appTab)showPage('apps');
      },0);
    }
  });
  const cards=el('div','noe-card-grid');
  const items=[
    ['보안 기록','접속 기록·XDR·종류별 필터','notebook','records',523],
    ['내 PC 상태','CPU·메모리·디스크 상태','hachi-glasses','pc',587],
    ['위험 알림','SDP·XDR·Windows 경고 구분','rakko','alerts',649],
    ['오늘의 점검','확인한 항목 직접 기록','kuri','checks',719]
  ];
  for (const [name,detail,character,page,tone] of items) {
    const b=el('button','noe-feature');b.type='button';
    b.append(el('strong','noe-feature-title',name),art(character),el('span','noe-feature-desc',detail));
    b.addEventListener('click',()=>{chime(tone);showPage(page);});
    cards.appendChild(b);
  }
  home.appendChild(cards);
  const quick=el('div','noe-summary-grid');
  const quickCards=[
    ['최근 보안 기록','기록은 보안 기록 메뉴에서 확인하세요. 수집되지 않았다면 확인 불가입니다.','blackstar'],
    ['내 PC 상태','Windows 로컬 사용량과 디스크 조회','shisa'],
    ['연결 상태','Agent 연결 확인 중 · SDP는 별도 확인','yellowstar']
  ];
  const homeSummary={};
  for(const [name,desc,character] of quickCards){
    const card=el('section','noe-mini'),message=el('p','',desc);
    card.append(art(character),el('h3','',name),message);quick.append(card);
    homeSummary[name]=message;
  }
  home.append(quick,el('p','noe-footnote','Windows 자원과 이벤트는 이 PC에서 별도 조회합니다. 실패를 정상이나 0건으로 표시하지 않습니다.'));

  // Existing records and Apps panels remain authentic and receive only headers.
  const recordsBanner=titleRow('보안 기록','notebook','기록 발생 시각 최신순 · 종류별 필터 · 실제 조회와 예제 자료 구분');
  recordsBanner.classList.add('noe-native-heading');
  const recordsH=records.querySelector('h1');
  if(recordsH){recordsH.hidden=true;recordsH.insertAdjacentElement('afterend',recordsBanner);}
  else records.prepend(recordsBanner);
  const appsBanner=titleRow('업무 앱','kani','접속 판정과 오류는 구분합니다. 실제 요청은 버튼으로만 실행합니다.');
  appsBanner.classList.add('noe-native-heading');
  const appsH=apps.querySelector('h1');
  if(appsH){appsH.hidden=true;appsH.insertAdjacentElement('afterend',appsBanner);}
  else apps.prepend(appsBanner);

  // Windows local readings are separate from ALEPH engine/demo resources.
  let pcLoaded=false,pcLoading=false;
  const pcData=el('div','noe-metric-grid'),metricRefs={};
  for(const [key,name,unit,color,hint] of [
    ['cpu','CPU 사용률','%','rose','측정된 사용률'],
    ['memory','메모리 사용량','MiB','blue','전체 메모리 대비 사용량'],
    ['disk','시스템 디스크 남은 공간','GiB','mint','전체 공간 대비 남은 비율']
  ]){
    const block=el('section','noe-metric');
    block.dataset.tone=color;
    const value=el('p','noe-value','확인 불가');
    const detail=el('p','noe-footnote','단위: '+unit+' · 조회 전');
    const explanation=el('p','noe-meter-hint',hint+' · 확인 불가');
    const bar=meter(name+' 비율','noe-bar-'+color);
    block.append(el('h2','',name),value,bar.track,explanation,detail);
    pcData.append(block);metricRefs[key]={value,detail,bar,explanation,hint};
  }
  pc.insertBefore(pcData,statusCard||originalDisclosure);
  const pcOther=el('section','noe-panel');
  const networkLine=el('p','noe-alert-line','활성 네트워크 어댑터: 조회 전');
  const firewallLine=el('p','noe-alert-line','Windows 방화벽 프로필: 조회 전');
  const systemLine=el('p','noe-alert-line','System 오류·경고: 조회 전');
  const appLine=el('p','noe-alert-line','Application 오류·경고: 조회 전');
  pcOther.append(el('h2','','네트워크·방화벽·Windows 이벤트'),
    networkLine,firewallLine,systemLine,appLine,
    el('p','noe-footnote','Windows 최근 24시간의 오류·경고는 침해 탐지 건수가 아닙니다. 이벤트 원문과 IP·어댑터 이름을 수집하지 않으며 방화벽을 변경하지 않습니다.'));
  pc.insertBefore(pcOther,statusCard||originalDisclosure);
  const logChart=el('section','noe-panel noe-log-chart');
  const logHeading=el('div','noe-chart-head');
  logHeading.append(el('h2','','Windows 이벤트 비교'),
    el('p','noe-muted','최근 24시간 · 가장 많은 항목 대비 상대 길이'));
  logChart.append(logHeading);
  const eventBars=[];
  for(const [log,kind,label,tone] of [
    ['System','error','시스템 · 오류','coral'],
    ['System','warning','시스템 · 경고','amber'],
    ['Application','error','응용 프로그램 · 오류','coral'],
    ['Application','warning','응용 프로그램 · 경고','amber']
  ]){
    const line=el('div','noe-event-line');
    const rowLabel=el('span','noe-event-name',label);
    const bar=el('div','noe-event-track noe-event-'+tone);
    bar.setAttribute('role','img');bar.setAttribute('aria-label',label+': 확인 불가');
    const fill=el('span','noe-event-fill');
    bar.append(fill);
    const number=el('strong','noe-event-count','확인 불가');
    line.append(rowLabel,bar,number);
    logChart.append(line);
    eventBars.push({log,kind,label,bar,fill,number});
  }
  logChart.append(el('p','noe-footnote','오류·경고 기록은 악성코드나 침해의 증거로 단정할 수 없습니다. 로그별 수치만 비교하며, 시간 흐름 그래프는 아닙니다.'));
  pc.insertBefore(logChart,statusCard||originalDisclosure);
  const renderEventBars=(events)=>{
    const numbers=eventBars.map(r=>events?.[r.log]?.[r.kind]);
    const valid=v=>Number.isSafeInteger(v)&&v>=0;
    const max=Math.max(1,...numbers.filter(valid));
    eventBars.forEach((row,i)=>{
      const n=numbers[i],ok=valid(n);
      row.number.textContent=ok?n+'건':'확인 불가';
      row.fill.style.width=ok?(100*n/max).toFixed(2)+'%':'0%';
      row.bar.classList.toggle('noe-bar-unknown',!ok);
      row.bar.setAttribute('aria-label',row.label+': '+(ok?n+'건':'확인 불가'));
    });
  };
  const pcRefresh=el('button','btn','로컬 PC 다시 조회');pcRefresh.type='button';
  const pcResult=el('p','noe-footnote','Windows 로컬 상태 조회는 SDP/XDR 정보와 별개입니다.');
  pcResult.setAttribute('role','status');pcResult.setAttribute('aria-live','polite');
  const eventText=(label,value)=>{
    const e=value?.error,w=value?.warning;
    return Number.isInteger(e)&&e>=0&&Number.isInteger(w)&&w>=0
      ?label+': 최근 24시간 오류 '+e+'건 · 경고 '+w+'건'
      :label+': 확인 불가 · 접근 제한 또는 조회 실패';
  };
  async function readLocalPc(){
    if(pcLoading)return;
    pcLoading=true;pcRefresh.disabled=true;pcResult.textContent='Windows 로컬 상태를 조회하는 중…';
    try{
      const response=await fetch('/api/local/pc-health',{method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
      if(!response.ok)throw Error('http');
      const result=await response.json();
      if(result?.ok!==true||!result?.data)throw Error('invalid');
      const d=result.data;
      if(!d.supported){
        for(const ref of Object.values(metricRefs)){
          ref.value.textContent='확인 불가';ref.detail.textContent='Windows에서만 조회할 수 있어요';
          ref.explanation.textContent=ref.hint+' · 확인 불가';drawMeter(ref.bar,null);
        }
        renderEventBars(null);updateWindowsSummary(null);
        pcResult.textContent='지원하지 않는 실행 환경입니다. Windows PC에서 실행해 주세요.';return;
      }
      const time=new Date(d.checkedAt),at=Number.isNaN(time.getTime())?'조회 시각 미확인':time.toLocaleString('ko-KR');
      for(const [key,value,unit,percent,capacity] of [
        ['cpu',d.cpu?.usagePercent,'%',d.cpu?.usagePercent,null],
        ['memory',d.memory?.usedMiB,'MiB',d.memory?.usagePercent,d.memory?.totalMiB],
        ['disk',d.disk?.freeGiB,'GiB',
          typeof d.disk?.freeGiB==='number'&&typeof d.disk?.totalGiB==='number'&&d.disk.totalGiB>0
            ?100*d.disk.freeGiB/d.disk.totalGiB:null,d.disk?.totalGiB]
      ]){
        const ref=metricRefs[key],valid=typeof value==='number'&&Number.isFinite(value)&&value>=0;
        ref.value.textContent=valid?String(value)+' '+unit:'확인 불가';
        const pctValid=typeof percent==='number'&&Number.isFinite(percent)&&percent>=0&&percent<=100;
        drawMeter(ref.bar,pctValid?percent:null);
        ref.explanation.textContent=pctValid
          ?ref.hint+' '+percent.toFixed(1)+'%'+(typeof capacity==='number'?' · 전체 '+capacity+' '+unit:'')
          :ref.hint+' · 비율 확인 불가';
        ref.detail.textContent=valid?'Windows 로컬 실측 · '+at:'접근 제한 또는 조회 실패 · '+at;
      }
      networkLine.textContent=Number.isInteger(d.network?.upAdapterCount)
        ?'활성 네트워크 어댑터: '+d.network.upAdapterCount+'개 · IP와 이름 미수집'
        :'활성 네트워크 어댑터: 확인 불가 · 접근 제한 또는 조회 실패';
      const profiles=d.firewall?.profiles;
      firewallLine.textContent=Array.isArray(profiles)&&profiles.length
        ?'Windows 방화벽 프로필: '+profiles.map(p=>({Domain:'도메인',Private:'개인',Public:'공용'})[p.name]+' '+(p.enabled?'켜짐':'꺼짐')).join(' · ')
        :'Windows 방화벽 프로필: 확인 불가 · 접근 제한 또는 조회 실패';
      systemLine.textContent=eventText('System',d.events?.System);
      appLine.textContent=eventText('Application',d.events?.Application);
      renderEventBars(d.events);
      updateWindowsSummary(d.events);
      pcResult.textContent='Windows 로컬 상태 조회 완료 · '+at+' · 위협 여부 판정과 무관';
      pcLoaded=true;
    }catch{
      for(const ref of Object.values(metricRefs)){
        ref.value.textContent='확인 불가';ref.detail.textContent='이번 조회 실패 · 이전 값은 현재 수치로 표시하지 않음';
        ref.explanation.textContent=ref.hint+' · 확인 불가';drawMeter(ref.bar,null);
      }
      networkLine.textContent='활성 네트워크 어댑터: 확인 불가 · 이번 조회 실패';
      firewallLine.textContent='Windows 방화벽 프로필: 확인 불가 · 이번 조회 실패';
      systemLine.textContent='System 오류·경고: 확인 불가 · 이번 조회 실패';
      appLine.textContent='Application 오류·경고: 확인 불가 · 이번 조회 실패';
      renderEventBars(null);updateWindowsSummary(null);pcLoaded=false;
      pcResult.textContent='로컬 조회 실패 · 서버의 Windows 조회 기능을 확인하세요.';
    }
    finally{pcLoading=false;pcRefresh.disabled=false;}
  }
  pcRefresh.addEventListener('click',()=>readLocalPc());
  pc.insertBefore(pcRefresh,originalDisclosure);pc.insertBefore(pcResult,originalDisclosure);


  // These are evidence-availability cards, NOT a computed cyber risk score.
  const alertVisual=el('section','noe-alert-visual');
  alertVisual.append(el('h2','','확인 상태 한눈에 보기'),
    el('p','noe-muted','연결 확인과 Windows 로컬 기록을 구분해요. 이것은 위협 위험도 점수가 아닙니다.'));
  const alertGrid=el('div','noe-alert-grid'),alertRefs={};
  for(const [key,title,initial,desc,tone] of [
    ['sdp','Agent / SDP 연결','상태 확인 전','Agent와 SDP의 운영 연결은 구분해서 확인해야 합니다','neutral'],
    ['xdr','XDR 원천 기록','기록 조회 전','검증된 최근 기록 조회 결과를 사용합니다','neutral'],
    ['windows','Windows 오류·경고','아직 조회 전','최근 24시간 OS 기록 · 침해 탐지와 별개','unknown']
  ]){
    const card=el('article','noe-alert-summary');
    card.dataset.tone=tone;
    const chip=el('strong','noe-alert-chip',initial);
    const explain=el('p','noe-muted',desc);
    card.append(el('h3','',title),chip,explain);
    alertGrid.append(card);alertRefs[key]={card,chip,explain};
  }
  alertVisual.append(alertGrid);
  const factGrid=el('div','noe-fact-grid');
  for(const [title,description] of [
    ['확인된 사실','Windows 실측 결과가 있으면 수치로 표시'],
    ['확인 불가','SDP 연결 및 XDR 원천 기록은 별도로 확인'],
    ['종합 판정','자동 안전·침해 판정을 하지 않음']
  ]){
    const tile=el('div','noe-fact');
    tile.append(el('h3','',title),el('p','',description));
    factGrid.append(tile);
  }
  alertVisual.append(factGrid);
  alerts.append(alertVisual);
  // Updates are driven by the same validated resources already used by the
  // official event/status renderers. Do not infer a cyber risk score.
  noeUpdateEvents=({status,mode,data})=>{
    const {card,chip,explain}=alertRefs.xdr;
    if(status==='loading'){
      card.dataset.tone='unknown';chip.textContent='조회 중';
      explain.textContent='본인 보안 기록을 불러오는 중입니다.';
      homeSummary['최근 보안 기록'].textContent='보안 기록 조회 중';return;
    }
    if(status!=='ok'||!Array.isArray(data)){
      card.dataset.tone='unknown';chip.textContent='확인 불가';
      explain.textContent='기록 원천 조회 실패 또는 검증 불가 · 기록 0건으로 판단하지 않습니다.';
      homeSummary['최근 보안 기록'].textContent='기록을 확인할 수 없습니다.';return;
    }
    const count=data.filter(event=>event?.kind==='xdr').length;
    if(mode==='demo'){
      card.dataset.tone='demo';chip.textContent='XDR 예제 '+count+'건';
      explain.textContent='예제 보안 기록 중 XDR '+count+'건 · 실제 탐지가 아닙니다.';
      homeSummary['최근 보안 기록'].textContent='예제 기록 '+data.length+'건 · 실제 탐지 아님';
    }else if(mode==='connected'){
      card.dataset.tone='observed';chip.textContent='조회된 XDR '+count+'건';
      explain.textContent='이번 조회에서 받은 본인 기록 중 XDR '+count+'건 · 전체 과거 기록이 아닙니다.';
      homeSummary['최근 보안 기록'].textContent='조회된 최근 본인 기록 '+data.length+'건';
    }else{
      card.dataset.tone='unknown';chip.textContent='연결 모드 미확인';
      explain.textContent='보안 기록이 전달됐지만 원천 연결 상태를 확인하지 못했습니다.';
      homeSummary['최근 보안 기록'].textContent='원천 연결 상태 확인 불가';
    }
  };
  noeUpdateStatus=({mode})=>{
    const {card,chip,explain}=alertRefs.sdp;
    if(mode==='demo'){
      card.dataset.tone='demo';chip.textContent='예제 모드';
      explain.textContent='Agent가 예제 자료를 사용합니다. 실제 SDP 연결 성공은 아닙니다.';
      homeSummary['연결 상태'].textContent='예제 모드 · SDP 미확인';
    }else if(mode==='disconnected'){
      card.dataset.tone='unknown';chip.textContent='Agent 미연결';
      explain.textContent='Agent와 운영 원천 연결을 확인할 수 없습니다.';
      homeSummary['연결 상태'].textContent='Agent 연결 없음';
    }else if(mode==='connected'){
      card.dataset.tone='observed';chip.textContent='Agent 연결 모드';
      explain.textContent='Agent 연결 모드만 확인됐습니다. SDP 운영 연결은 별도 확인이 필요합니다.';
      homeSummary['연결 상태'].textContent='Agent 연결 · SDP 별도 확인';
    }else{
      card.dataset.tone='unknown';chip.textContent='확인 불가';
      explain.textContent='현재 Agent 연결 모드를 확인하지 못했습니다.';
      homeSummary['연결 상태'].textContent='Agent 연결 확인 불가';
    }
  };
  const updateWindowsSummary=(events)=>{
    const values=['System','Application'].flatMap(log=>['error','warning'].map(kind=>events?.[log]?.[kind]));
    const ok=values.every(v=>Number.isSafeInteger(v)&&v>=0);
    const {card,chip,explain}=alertRefs.windows;
    chip.textContent=ok?values.reduce((a,b)=>a+b,0)+'건 (최근 24시간)':'확인 불가';
    card.dataset.tone=ok?'observed':'unknown';
    explain.textContent=ok?'OS 오류·경고 건수입니다. 공격 탐지 여부는 별도 확인해야 합니다.':'Windows 이벤트 접근 제한 또는 조회 실패 · 정상 0건을 뜻하지 않음';
  };
  const alertRows=[
    ['SDP 연결','실제 서버 연결 결과 미확인. 연결 확인이 안 되면 SDP 미연결로 구분해 표시합니다.'],
    ['XDR 경보','보안 기록 원천 응답 미확인. 예제 데이터는 공격 탐지 결과가 아닙니다.'],
    ['Windows 이벤트','최근 24시간 System/Application 경고·오류 건수는 내 PC 상태에서 조회합니다. 경고 수는 공격 탐지가 아닙니다.']
  ];
  for(const [title,desc] of alertRows){const p=el('section','noe-alert');p.append(el('h2','',title),el('p','',desc));alerts.append(p);}
  const openRecords=el('button','btn','보안 기록에서 근거 확인');openRecords.type='button';
  openRecords.addEventListener('click',()=>showPage('records'));alerts.append(openRecords);
  const inspectWindows=el('button','btn','Windows 기록 수치 확인');
  inspectWindows.type='button';inspectWindows.addEventListener('click',()=>showPage('pc'));
  alerts.append(inspectWindows);
  const alertsRefresh=el('button','btn','알림 정보 다시 조회');
  alertsRefresh.type='button';
  alertsRefresh.addEventListener('click',()=>{
    const refresh=$('refresh');
    if(refresh && !refresh.disabled)refresh.click();
    if(!pcLoading)readLocalPc();
  });
  alerts.append(alertsRefresh);

  const tasks=['보안 기록 필터 확인','SDP 연결 상태 확인','PC 사용량 측정 지원 여부 확인','방화벽·Windows 로그 조회 가능 여부 확인','확인 불가 항목과 이유 확인'];
  // Browser-local calendar date, not a security scan result.
  const localDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  let storageKey='noe-personal-checks-v2-'+localDay();
  let saved={};try{const s=JSON.parse(localStorage.getItem(storageKey)||'{}');if(s&&typeof s==='object'&&!Array.isArray(s))saved=s;}catch{}
  const wrap=el('div','noe-checks'),progress=el('p','noe-footnote');
  progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
  const inputs=[],checkChips=[],checkTimes=[];
  const checkVisual=el('section','noe-check-visual');
  const checkTop=el('div','noe-check-top');
  const checkPercent=el('strong','noe-check-percent','0%');
  const checkCount=el('span','noe-muted','0 / 5개 직접 확인');
  const checkMeter=meter('사용자가 직접 체크한 점검 항목 비율','noe-bar-mint');
  checkTop.append(checkPercent,checkCount);
  checkVisual.append(checkTop,checkMeter.track,
    el('p','noe-footnote','직접 체크한 진행률이에요. 보안 검사 통과율이나 PC 안전 점수가 아닙니다.'));
  const redraw=()=>{
    const n=inputs.filter(x=>x.checked).length;
    const pct=inputs.length?100*n/inputs.length:0;
    drawMeter(checkMeter,pct);
    checkPercent.textContent=Math.round(pct)+'%';
    checkCount.textContent=n+' / '+inputs.length+'개 직접 확인';
    checkChips.forEach((chip,i)=>{
      chip.textContent=inputs[i].checked?'확인 표시':'미확인';
      chip.dataset.state=inputs[i].checked?'marked':'unmarked';
    });
    progress.textContent='직접 확인 표시: '+n+' / '+inputs.length+'개 · 보안 판정과 무관';
  };
  tasks.forEach((label,index)=>{
    const row=el('label','noe-check-row'),box=document.createElement('input'),description=el('span','',label),time=el('small','noe-checked-time');
    box.type='checkbox';box.checked=Boolean(saved[index]);
    if(box.checked&&typeof saved[index]==='string')time.textContent='사용자 체크 시각: '+new Date(saved[index]).toLocaleString('ko-KR');
    const chip=el('span','noe-check-chip');checkChips.push(chip);
    row.append(box,description,chip,time);wrap.appendChild(row);inputs.push(box);
    checkTimes.push(time);
    box.addEventListener('change',()=>{
      synchronizeCheckDay();
      const state={};inputs.forEach((x,i)=>{if(x.checked)state[i]=(i===index&&x.checked)?new Date().toISOString():(saved[i]||new Date().toISOString());});
      saved=state;try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}
      time.textContent=box.checked?'사용자 체크 시각: '+new Date(saved[index]).toLocaleString('ko-KR'):'';
      redraw();
    });
  });
  checks.append(checkVisual,wrap,progress);
  function synchronizeCheckDay(){
    const today='noe-personal-checks-v2-'+localDay();
    if(storageKey===today)return;
    storageKey=today;
    saved={};
    try{const old=JSON.parse(localStorage.getItem(storageKey)||'{}');
      if(old&&typeof old==='object'&&!Array.isArray(old))saved=old;
    }catch{}
    inputs.forEach((x,i)=>{
      x.checked=Boolean(saved[i]);
      const date=typeof saved[i]==='string'?new Date(saved[i]):null;
      checkTimes[i].textContent=date&&!Number.isNaN(date.getTime())
        ?'사용자 체크 시각: '+date.toLocaleString('ko-KR'):'';
    });
    redraw();
  }
  const reset=el('button','btn','오늘 체크 초기화');reset.type='button';
  reset.addEventListener('click',()=>{
    synchronizeCheckDay();
    inputs.forEach(input=>input.checked=false);
    saved={};try{localStorage.removeItem(storageKey);}catch{}
    wrap.querySelectorAll('.noe-checked-time').forEach(t=>t.textContent='');redraw();
  });checks.append(reset,el('p','noe-footnote','직접 확인한 내용은 날짜별로 저장되고 다음 날짜에는 별도 목록으로 시작합니다.'));redraw();

  const settingsRow=el('label','noe-setting-row'),sound=document.createElement('input');sound.type='checkbox';
  try{sound.checked=localStorage.getItem(soundKey)!=='off';}catch{sound.checked=true;}
  sound.addEventListener('change',()=>{try{localStorage.setItem(soundKey,sound.checked?'on':'off');}catch{}});
  settingsRow.append(sound,el('span','','클릭 효과음 사용'));settings.append(settingsRow);
  settings.append(el('p','noe-footnote','이 설정은 이 브라우저에만 저장돼요. 보안 기록·연결 상태·실제 PC 측정 결과에는 영향을 주지 않습니다.'),
    el('p','noe-footnote','원작 캐릭터 이미지와 업로드 글꼴은 개인 PC에서만 사용하며 공개 저장소에는 포함하지 않습니다.'));

  // Enter with only the Home page visible. No long scroll of other pages.
  showPage('home');
}
// NOE_PRIVATE_SHELL_END


export function createStudentView() {
  try { installNoePrivatePages(); } catch { /* theme must not break security UI */ }
  return {
    renderIdentity({ me, devices, sessions }) {
      // 제공 UI는 반환한 DOM으로 학생 칸을 통째로 교체한다.
      const root = document.createElement('div');
      addFinalWeekCharacter(root, 'identity');
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
      addFinalWeekCharacter(root, 'decision');
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
      if(typeof noeUpdateEvents==='function')noeUpdateEvents({status,mode,data});
      // 제공 UI는 호출 때마다 반환한 DOM으로 학생 영역을 교체한다.
      const root = document.createElement('section');
      addFinalWeekCharacter(root, 'events');
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
      list.setAttribute('aria-label', '기록 발생 시각(at) 최신순 보안 기록 타임라인');
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
        row.className = 'card';
        row.setAttribute('data-student-event-id', record.id);
        addText(row, `${record.kind === 'xdr' ? '🐰 우사기 · XDR 경보' : '🐱 하치와레 · 접속 기록'} · 기록 타임라인`, 'h4');
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
      if(typeof noeUpdateStatus==='function')noeUpdateStatus({mode});
      // 매 호출마다 새 DOM을 만든다. 갱신 후 이전 실패·목록을 남기지 않는다.
      const root = document.createElement('section');
      addFinalWeekCharacter(root, 'status');
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
      addPcReadOnlyAvailability(root, mode);
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
      addFinalWeekCharacter(root, 'vulnerabilities');
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
      addFinalWeekCharacter(root, 'ai');
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
      addFinalWeekCharacter(root, 'explanation');
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
      addFinalWeekCharacter(root, 'action');
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
