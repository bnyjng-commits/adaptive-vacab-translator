// 교사가 학생 계정을 생성하는 서버리스 함수 (Supabase Admin API 사용)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 메서드만 허용됩니다.' });
    return;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    res.status(500).json({ error: '서버 환경변수가 설정되지 않았습니다.' });
    return;
  }

  const { name, email, password, student_number, grade, class_number, lang } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email, password는 필수입니다.' });
    return;
  }

  // 1단계: Supabase Admin Auth API로 사용자 생성
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({ email, password, email_confirm: true })
  });

  if (!authRes.ok) {
    const err = await authRes.json();
    res.status(400).json({ error: err.message || '계정 생성에 실패했습니다.' });
    return;
  }

  const authData = await authRes.json();
  const userId = authData.id;

  // 2단계: students 테이블에 행 삽입
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      id: userId,
      name,
      role: 'student',
      student_number: student_number || null,
      grade: grade || null,
      class_number: class_number || null,
      current_lang: lang || 'de',
      current_stage: 1,
      session_count: 0,
      stage_session_count: 0
    })
  });

  if (!insertRes.ok) {
    const err = await insertRes.json().catch(() => ({}));
    res.status(200).json({
      success: false,
      error: err.message || '계정은 생성됐으나 학생 정보 저장에 실패했습니다.',
      code: err.code,
      detail: err.details,
      hint: err.hint
    });
    return;
  }

  res.status(200).json({ success: true, userId });
}
