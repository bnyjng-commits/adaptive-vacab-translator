// Claude API를 통해 수학 용어 번역을 반환하는 Vercel 서버리스 함수
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

  const { word, lang } = req.body || {};
  if (!word || !lang) {
    res.status(400).json({ error: 'word, lang 파라미터가 필요합니다.' });
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
        max_tokens: 200,
        system: `너는 중학교 수학 교과서 번역 전문가야.\n지금 텍스트는 중1 수학 기본도형 단원이야.\n요청받은 한국어 단어의 번역어와 한 줄 정의를 아래 JSON 형식으로만 반환해.\n다른 말은 절대 하지 마.\n{"translation": "번역어", "definition": "정의 한 줄"}`,
        messages: [
          { role: 'user', content: `한국어 단어 "${word}"를 ${langName}로 번역해줘.` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: `Claude API 오류 (${response.status})`, detail: errText });
      return;
    }

    const data = await response.json();
    const text = (data.content?.[0]?.text || '').trim();
    const parsed = JSON.parse(text);

    res.setHeader('Cache-Control', 'no-store');
    res.json({ translation: parsed.translation || '—', definition: parsed.definition || '' });
  } catch {
    res.status(500).json({ error: '번역을 불러올 수 없습니다.' });
  }
}
