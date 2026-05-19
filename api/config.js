// Vercel 환경변수를 클라이언트에 안전하게 전달하는 엔드포인트
export default function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: '환경변수가 설정되지 않았습니다.' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({ supabaseUrl, supabaseAnonKey });
}
