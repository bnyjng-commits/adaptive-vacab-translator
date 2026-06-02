// PDF 전체 페이지 텍스트 단일 번역용 Vercel 서버리스 함수 (단계 1에서 사용)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST 메서드만 허용됩니다.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.' });
    return;
  }

  const { text, lang } = req.body || {};
  if (!text || typeof text !== 'string' || !lang) {
    res.status(400).json({ error: 'text(문자열), lang 파라미터가 필요합니다.' });
    return;
  }

  const langName = lang === 'en' ? '영어' : '독일어';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: `너는 중학교 수학 교과서 번역 전문가야. 중1 수학 기본도형 단원이야.`,
        messages: [
          {
            role: 'user',
            content: `다음 한국어 교과서 텍스트를 ${langName}로 번역해주세요. 줄바꿈과 문단 구조를 유지하세요. 번역문만 출력하고 다른 설명은 하지 마세요.\n\n${text}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: `Claude API 오류 (${response.status})`, detail: errText });
      return;
    }

    const data = await response.json();
    const translation = (data.content?.[0]?.text || '').trim();

    res.setHeader('Cache-Control', 'no-store');
    res.json({ translation });
  } catch {
    res.status(500).json({ error: '번역을 불러올 수 없습니다.' });
  }
}
