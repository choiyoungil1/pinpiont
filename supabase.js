// Supabase 설정
const SUPABASE_URL = 'https://fnbwwfwigxdvwxsavbss.supabase.co';
const SUPABASE_KEY = 'sb_publishable_96QP6wN2bW1Ck8HS-FjTnw_Fjpwn1MY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 로그인 상태 확인 (login.html 제외한 모든 페이지에서 사용)
async function requireAuth() {
  const isDemo = localStorage.getItem('pinpoint_demo') === 'true';
  if (isDemo) return null; // 데모 모드

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

// 로그아웃
async function logout() {
  localStorage.removeItem('pinpoint_demo');
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

// 회사 정보 저장 (DB 또는 localStorage)
const CompanyDB = {
  async get() {
    const isDemo = localStorage.getItem('pinpoint_demo') === 'true';
    if (isDemo) return Storage.get('company');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return Storage.get('company');

    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      // DB 데이터를 기존 형식으로 변환
      return {
        name: data.name,
        businessNumber: data.business_number,
        type: data.type,
        fiscalMonth: data.fiscal_month,
        industry: data.industry,
        employeeCount: data.employee_count,
        directors: data.directors || []
      };
    }
    return null;
  },

  async set(companyData) {
    const isDemo = localStorage.getItem('pinpoint_demo') === 'true';
    if (isDemo) {
      Storage.set('company', companyData);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Storage.set('company', companyData);
      return;
    }

    const dbData = {
      user_id: session.user.id,
      name: companyData.name,
      business_number: companyData.businessNumber,
      type: companyData.type,
      fiscal_month: companyData.fiscalMonth ? parseInt(companyData.fiscalMonth) : null,
      industry: companyData.industry,
      employee_count: companyData.employeeCount,
      directors: companyData.directors || [],
      updated_at: new Date().toISOString()
    };

    // upsert (있으면 업데이트, 없으면 삽입)
    const { error } = await supabase
      .from('companies')
      .upsert(dbData, { onConflict: 'user_id' });

    if (!error) {
      Storage.set('company', companyData); // 로컬 캐시도 업데이트
    }
  }
};
