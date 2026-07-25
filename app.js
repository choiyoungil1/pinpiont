// PinPoint - 공통 앱 로직

// ===== 로컬스토리지 유틸 =====
const Storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem('pinpoint_' + key)); } catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem('pinpoint_' + key, JSON.stringify(value));
  },
  remove: (key) => localStorage.removeItem('pinpoint_' + key)
};

// ===== 회사 정보 =====
const CompanyStore = {
  get: () => Storage.get('company') || null,
  set: (data) => Storage.set('company', data),
  isRegistered: () => !!Storage.get('company'),
  isSole: () => {
    const c = Storage.get('company');
    return c && c.type === '개인';
  }
};

// ===== 개인사업자 안내 배너 =====
// 페이지별 맞춤 안내 메시지로 호출
// messages: 배열 or null (null이면 기본 메시지)
function renderSoleBanner(messages) {
  if (!CompanyStore.isSole()) return;
  const defaults = ['이 페이지의 일부 항목은 법인사업자에 해당하는 내용입니다. 개인사업자에게 해당되지 않는 항목이 있을 수 있습니다.'];
  const lines = messages || defaults;
  const banner = document.createElement('div');
  banner.style.cssText = 'background:rgba(232,164,74,0.08);border:1px solid rgba(232,164,74,0.3);border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start;';
  banner.innerHTML = `
    <span style="font-size:20px;flex-shrink:0;">⚠️</span>
    <div>
      <div style="font-size:13px;font-weight:700;color:#e8a44a;margin-bottom:4px;">개인사업자로 등록되어 있습니다</div>
      ${lines.map(l => `<div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">· ${l}</div>`).join('')}
    </div>`;
  // .page 첫 번째 자식 앞에 삽입
  const page = document.querySelector('.page');
  if (page) page.insertBefore(banner, page.firstChild);
}

// ===== 토스트 알림 =====
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '📌' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '📌'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== 모달 =====
function openModal(content, title = '') {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${content}</div>
    </div>
  `;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

function closeModal() {
  const m = document.getElementById('active-modal');
  if (m) m.remove();
}

// ===== 날짜 유틸 =====
const DateUtil = {
  today: () => new Date(),
  format: (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  },
  daysUntil: (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
  monthName: (month) => `${month}월`,
  currentMonth: () => new Date().getMonth() + 1,
  currentYear: () => new Date().getFullYear()
};

// ===== 퀴즈 데이터 =====
const quizData = [
  {
    id: 1, category: '법인법무', level: '초급',
    question: '주식회사 이사의 기본 임기는 최대 몇 년인가요?',
    options: ['1년', '2년', '3년', '5년'],
    answer: 2,
    explanation: '상법상 이사의 임기는 최대 3년입니다. 임기 만료 전 중임등기를 하지 않으면 퇴임 처리됩니다.'
  },
  {
    id: 2, category: '세무', level: '초급',
    question: '법인의 부가가치세 신고는 1년에 몇 번인가요?',
    options: ['1번', '2번', '4번', '12번'],
    answer: 2,
    explanation: '법인은 1기 예정(4월), 1기 확정(7월), 2기 예정(10월), 2기 확정(다음해 1월) 총 4번 신고합니다.'
  },
  {
    id: 3, category: '노무', level: '초급',
    question: '2025년 최저임금은 시간당 얼마인가요?',
    options: ['9,860원', '10,030원', '10,120원', '10,280원'],
    answer: 1,
    explanation: '2025년 최저임금은 시간당 10,030원으로, 전년 대비 1.7% 인상되었습니다.'
  },
  {
    id: 4, category: '고용지원금', level: '초급',
    question: '두루누리 사회보험료 지원의 대상 사업장 규모는?',
    options: ['5인 미만', '10인 미만', '30인 미만', '50인 미만'],
    answer: 1,
    explanation: '두루누리 지원은 근로자 수 10인 미만 사업장이 대상입니다. 월 평균 보수 270만원 미만 근로자에게 지원됩니다.'
  },
  {
    id: 5, category: '법인법무', level: '중급',
    question: '정기주주총회는 결산일로부터 몇 개월 이내에 열어야 하나요?',
    options: ['1개월', '2개월', '3개월', '6개월'],
    answer: 2,
    explanation: '상법상 정기주주총회는 매 결산기 종료 후 3개월 이내에 개최해야 합니다.'
  },
  {
    id: 6, category: '주식자본', level: '중급',
    question: '비상장주식 증여 시 증여세 신고 기한은?',
    options: ['증여일로부터 1개월', '증여일로부터 3개월', '증여일로부터 6개월', '증여일이 속한 달의 말일'],
    answer: 1,
    explanation: '증여세 신고는 증여일이 속하는 달의 말일로부터 3개월 이내에 신고·납부해야 합니다.'
  }
];

// ===== 고용지원금 사다리타기 데이터 =====
const supportFundTree = {
  start: {
    question: '어떤 상황에 해당하나요?',
    options: [
      { label: '💼 새로 직원을 채용했어요', next: 'hired' },
      { label: '👶 육아·출산 관련 이슈가 생겼어요', next: 'parental' },
      { label: '⚠️ 경영이 어려워 휴업을 고려 중이에요', next: 'crisis' },
      { label: '🏢 사업장 운영 관련 지원이 필요해요', next: 'operation' }
    ]
  },
  hired: {
    question: '채용한 직원의 나이는?',
    options: [
      { label: '15세 ~ 29세 (청년)', next: 'hired_young' },
      { label: '30세 ~ 59세', next: 'hired_mid' },
      { label: '60세 이상', next: 'hired_senior' }
    ]
  },
  hired_young: {
    question: '해당 청년이 아래 중 해당되나요?',
    options: [
      { label: '장기실업자 (6개월 이상 미취업)', next: 'result_youth_leap' },
      { label: '고졸 이하 학력', next: 'result_youth_leap' },
      { label: '국민취업지원제도 참여자', next: 'result_youth_leap' },
      { label: '해당 없음', next: 'result_youth_basic' }
    ]
  },
  hired_mid: {
    question: '해당 직원이 아래 중 해당되나요?',
    options: [
      { label: '장애인', next: 'result_disabled' },
      { label: '장기실업자 (6개월 이상)', next: 'result_employment' },
      { label: '해당 없음', next: 'result_none' }
    ]
  },
  hired_senior: {
    question: '60세 이상 고령자를 채용하셨나요?',
    options: [
      { label: '네', next: 'result_senior' },
      { label: '아니요', next: 'result_none' }
    ]
  },
  parental: {
    question: '어떤 상황인가요?',
    options: [
      { label: '육아휴직 사용 직원이 있어요', next: 'result_parental_leave' },
      { label: '출산전후휴가 사용 직원이 있어요', next: 'result_maternity' },
      { label: '유연근무제 도입을 고려 중이에요', next: 'result_flexible' }
    ]
  },
  crisis: {
    question: '구체적인 상황은?',
    options: [
      { label: '일시적 경영난으로 휴업 예정', next: 'result_furlough' },
      { label: '근로시간 단축 시행 중', next: 'result_furlough' }
    ]
  },
  operation: {
    question: '사업장 근로자 수는?',
    options: [
      { label: '10인 미만', next: 'result_dururi' },
      { label: '10인 이상', next: 'result_none_operation' }
    ]
  },
  result_youth_leap: {
    type: 'result', success: true,
    title: '청년일자리도약장려금',
    amount: '월 최대 60만원 × 최대 24개월',
    deadline: '채용일로부터 6개월 이내 신청',
    link: 'https://www.work24.go.kr',
    note: '우선지원대상기업 해당 여부 사전 확인 필요'
  },
  result_youth_basic: {
    type: 'result', success: false,
    title: '청년일자리도약장려금 해당 어려움',
    message: '장기실업자, 고졸이하, 국민취업지원제도 참여자 요건이 필요합니다. 다른 지원금을 확인해보세요.',
  },
  result_disabled: {
    type: 'result', success: true,
    title: '장애인 고용장려금',
    amount: '장애 정도에 따라 월 30~80만원',
    deadline: '반기별 신청 (한국장애인고용공단)',
    link: 'https://www.kead.or.kr',
    note: '장애인 고용의무 이행 여부와 별개로 신청 가능'
  },
  result_employment: {
    type: 'result', success: true,
    title: '고용촉진장려금',
    amount: '최대 월 60만원 × 12개월',
    deadline: '채용 후 3개월 이내 신청',
    link: 'https://www.work24.go.kr',
    note: '취업취약계층 여부 고용센터 사전 확인 필요'
  },
  result_senior: {
    type: 'result', success: true,
    title: '고령자 고용지원금',
    amount: '근로자 1인당 분기 30만원',
    deadline: '분기별 신청',
    link: 'https://www.work24.go.kr',
    note: '기준 고용률 초과 고용 시 지원'
  },
  result_parental_leave: {
    type: 'result', success: true,
    title: '육아휴직 사업주 지원금',
    amount: '월 30만원 (대체인력 채용 시 추가 지원)',
    deadline: '육아휴직 개시 후 신청',
    link: 'https://www.work24.go.kr',
    note: '우선지원대상기업 해당 여부 확인 필요'
  },
  result_maternity: {
    type: 'result', success: true,
    title: '출산전후휴가 급여 지원',
    amount: '통상임금 기준 (상한액 적용)',
    deadline: '휴가 시작 후 30일 경과 후 신청',
    link: 'https://www.work24.go.kr',
    note: '우선지원대상기업은 전 기간 고용보험에서 지원'
  },
  result_flexible: {
    type: 'result', success: true,
    title: '일·가정양립 환경개선 지원',
    amount: '유연근무 1인당 월 최대 30만원',
    deadline: '연간 공고 확인 후 신청',
    link: 'https://www.work24.go.kr',
    note: '재택·시차출퇴근·선택근무 등 해당'
  },
  result_furlough: {
    type: 'result', success: true,
    title: '고용유지지원금',
    amount: '휴업수당의 최대 90% 지원',
    deadline: '휴업 실시 전 고용센터 신고 필수',
    link: 'https://www.work24.go.kr',
    note: '사전 계획서 제출 필수 — 실시 후 신청 불가'
  },
  result_dururi: {
    type: 'result', success: true,
    title: '두루누리 사회보험료 지원',
    amount: '4대보험료 최대 80% 지원',
    deadline: '신규 입사자 발생 시 상시 신청',
    link: 'https://www.insurancesupport.or.kr',
    note: '월 보수 270만원 미만 신규 입사자 해당'
  },
  result_none: {
    type: 'result', success: false,
    title: '현재 조건으로는 해당 지원금 없음',
    message: '입력하신 조건으로는 바로 해당되는 지원금이 없습니다. 고용센터(1350)에 문의하시면 더 자세한 안내를 받으실 수 있습니다.'
  },
  result_none_operation: {
    type: 'result', success: false,
    title: '두루누리 지원 미해당',
    message: '두루누리 지원은 10인 미만 사업장 대상입니다. 다른 지원사업을 알아보시려면 기업마당(www.bizinfo.go.kr)을 확인해보세요.'
  }
};

// ===== 기업 인증 데이터 =====
const certificationData = [
  {
    id: 'venture',
    icon: '🚀',
    name: '벤처기업 인증',
    benefits: ['법인세 50% 감면 (최대 5년)', '취득세·재산세 감면', '정책자금 우대', '정부조달 입찰 가점', '코스닥 상장 요건 완화'],
    validity: '2년 (갱신 가능)',
    govFee: '없음 (무료)',
    agencyFee: '50~120만원',
    difficulty: 2,
    note: '기술성·성장성 평가 또는 연구개발비 요건 충족 필요'
  },
  {
    id: 'lab',
    icon: '🔬',
    name: '기업부설연구소 인정',
    benefits: ['연구원 인건비 세액공제 최대 25%', '연구·시험용 기자재 관세 감면', '벤처기업 인증 요건 충족 가능', '정책자금 우대'],
    validity: '계속 유지 (요건 충족 시)',
    govFee: '없음 (무료)',
    agencyFee: '30~80만원',
    difficulty: 2,
    note: '연구전담인력 2명 이상, 전용 연구공간 필수'
  },
  {
    id: 'innobiz',
    icon: '💡',
    name: '이노비즈 인증',
    benefits: ['기술혁신형 중소기업 인정', '정책자금 금리 우대', '정부조달 가점', '수출 지원 우대'],
    validity: '3년',
    govFee: '없음 (무료)',
    agencyFee: '70~150만원',
    difficulty: 3,
    note: '기술혁신시스템 평가 1000점 만점 중 700점 이상'
  },
  {
    id: 'mainbiz',
    icon: '📊',
    name: '메인비즈 인증',
    benefits: ['경영혁신형 중소기업 인정', '정책자금 우대', '세금 감면 혜택', '교육 지원'],
    validity: '3년',
    govFee: '없음 (무료)',
    agencyFee: '50~100만원',
    difficulty: 2,
    note: '경영혁신활동 계획 수립 및 이행 평가'
  },
  {
    id: 'women',
    icon: '👩‍💼',
    name: '여성기업 확인',
    benefits: ['공공조달 여성기업 우선구매 혜택', '여성기업 전용 지원사업 참여 가능', '창업 지원 우대'],
    validity: '3년',
    govFee: '없음 (무료)',
    agencyFee: '없음 (직접 신청)',
    difficulty: 1,
    note: '대표자가 여성이고 실질적 경영 참여 요건'
  },
  {
    id: 'rnd_dept',
    icon: '🧪',
    name: '연구개발전담부서 인정',
    benefits: ['연구인력 인건비 세액공제', '연구소보다 완화된 요건으로 취득 가능', '벤처 인증 요건 활용'],
    validity: '계속 유지 (요건 충족 시)',
    govFee: '없음 (무료)',
    agencyFee: '20~50만원',
    difficulty: 1,
    note: '연구전담인력 1명 이상, 연구개발 활동 증빙 필요'
  }
];

// ===== 역량강화 카드 데이터 =====
const knowledgeCards = [
  {
    id: 1,
    week: '2025년 1주차',
    category: '법인법무',
    title: '이사 임기, 언제 체크해야 할까?',
    content: `
      <p>주식회사 이사의 임기는 <strong>최대 3년</strong>입니다. 임기가 만료되면 자동으로 퇴임 처리되어 등기부에 변경 사항이 생깁니다.</p>
      <br>
      <p><strong>중임등기 안 하면?</strong></p>
      <ul style="margin-left:16px; margin-top:8px;">
        <li>임원이 퇴임 처리되어 법적 권한 상실</li>
        <li>등기 해태 시 과태료 최대 500만원</li>
        <li>금융거래, 계약 체결 시 문제 발생</li>
      </ul>
      <br>
      <p><strong>체크 방법</strong>: 법인등기부등본에서 이사 취임일 확인 → 3년 전후로 알림 설정</p>
    `,
    keyPoint: '임기 만료 최소 2개월 전에 중임 여부 결정 후 등기 신청!'
  },
  {
    id: 2,
    week: '2025년 2주차',
    category: '세무',
    title: '중소기업 특별세액감면, 우리 회사 해당될까?',
    content: `
      <p>중소기업 특별세액감면은 <strong>법인세 신고 시 자동으로 챙겨야</strong> 하는 절세 항목입니다.</p>
      <br>
      <p><strong>감면율</strong></p>
      <ul style="margin-left:16px; margin-top:8px;">
        <li>수도권 내 소기업: 10%</li>
        <li>수도권 외 소기업: 20~30%</li>
        <li>중기업: 업종·지역별 5~15%</li>
      </ul>
      <br>
      <p><strong>주의사항</strong>: 감면 신청을 빠뜨리면 해당 연도에 소급 적용 어려움. 법인세 신고 시 반드시 확인!</p>
    `,
    keyPoint: '법인세 신고 전 세무사에게 "특별세액감면 해당 여부" 꼭 물어보세요!'
  },
  {
    id: 3,
    week: '2025년 3주차',
    category: '고용지원금',
    title: '두루누리, 신규 입사자마다 챙겨야 하는 이유',
    content: `
      <p>두루누리 사회보험료 지원은 <strong>10인 미만 사업장</strong>에서 월 270만원 미만 신규 입사자를 고용할 때 4대보험료를 최대 80% 지원받는 제도입니다.</p>
      <br>
      <p><strong>지원 금액 예시</strong> (월 230만원 직원 기준)</p>
      <ul style="margin-left:16px; margin-top:8px;">
        <li>사업주 부담 4대보험료 약 22만원</li>
        <li>80% 지원 시 → 약 17만원 절감</li>
        <li>연간 약 200만원 절감!</li>
      </ul>
      <br>
      <p><strong>신청 방법</strong>: 4대보험 취득 신고 시 함께 신청 가능 (국민건강보험공단)</p>
    `,
    keyPoint: '입사 처리할 때 두루누리 신청을 함께 진행하는 습관을 만드세요!'
  }
];

// ===== 앱 상태 =====
const AppState = {
  currentQuizIndex: Storage.get('quiz_index') || 0,
  earnedBadges: Storage.get('badges') || [],
  quizScores: Storage.get('quiz_scores') || []
};

// ===== 퀴즈 저장 =====
function saveQuizResult(quizId, correct) {
  const scores = Storage.get('quiz_scores') || [];
  scores.push({ quizId, correct, date: new Date().toISOString() });
  Storage.set('quiz_scores', scores);

  if (correct) {
    const quiz = quizData.find(q => q.id === quizId);
    if (quiz) checkBadge(quiz.category);
  }
}

function checkBadge(category) {
  const scores = Storage.get('quiz_scores') || [];
  const categoryCorrect = scores.filter(s => {
    const q = quizData.find(qd => qd.id === s.quizId);
    return q && q.category === category && s.correct;
  }).length;

  const badges = Storage.get('badges') || [];
  const badgeMap = {
    '법인법무': { id: 'badge_legal', name: '법무 입문', icon: '🏢', threshold: 2 },
    '세무': { id: 'badge_tax', name: '세무 기초', icon: '🧾', threshold: 2 },
    '고용지원금': { id: 'badge_subsidy', name: '지원금 헌터', icon: '💰', threshold: 1 },
    '노무': { id: 'badge_labor', name: '노무 마스터', icon: '⚖️', threshold: 2 },
    '주식자본': { id: 'badge_stock', name: '주식 전문가', icon: '📈', threshold: 1 }
  };

  const badge = badgeMap[category];
  if (badge && categoryCorrect >= badge.threshold && !badges.find(b => b.id === badge.id)) {
    badges.push({ ...badge, earnedAt: new Date().toISOString() });
    Storage.set('badges', badges);
    showToast(`🏅 새 뱃지 획득! "${badge.name}"`, 'success', 4000);
  }
}

// ===== 난이도 별 표시 =====
function renderDifficulty(level) {
  return '⭐'.repeat(level) + '☆'.repeat(3 - level);
}

console.log('PinPoint App initialized');
