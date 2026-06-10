// math_vocab_geometry.json 수학_용어[].ko 목록 (하드코딩 — Vercel fs 경로 문제 방지)
const MATH_TERMS = [
  '교점', '교선', '직선', '반직선', '선분', '두 점 사이의 거리', '수선의 발',
  '각', '예각', '직각', '둔각', '평각', '평행', '꼬인 위치', '동위각', '엇각',
  '내각', '외각', '부채꼴', '호', '현', '중심각', '활꼴', '반지름', '원주율',
  '다각형', '다면체', '정다면체', '각뿔대', '회전체', '회전축', '겉넓이', '부피',
  '구', '전개도', '밑넓이', '높이', '꼭짓점', '모서리', '넓이',
  '점', '선', '면', '평면', '공간', '중점', '수직', '수선',
  '수직이등분선', '직교', '맞꼭지각', '교각', '평행선', '위치 관계',
  '작도', '합동', '대응점', '대응변', '대응각', '대변', '대각', '삼각형', '끼인각'
];

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

  const { texts, lang, stage } = req.body || {};
  if (!texts || !Array.isArray(texts) || texts.length === 0 || !lang) {
    res.status(400).json({ error: 'texts(배열), lang 파라미터가 필요합니다.' });
    return;
  }

  const langName = lang === 'en' ? '영어' : '독일어';

  let systemPrompt = `너는 중학교 수학 교과서 번역 전문가야. 중1 수학 기본도형 단원이야.\n아래 JSON 배열의 한국어 텍스트를 ${langName}로 번역해서 동일한 순서의 JSON 배열로만 반환해.\n배열 길이는 입력과 반드시 같아야 해. 다른 말은 절대 하지 마.\n형식 예시: ["번역1", "번역2"]\n\n번역 시 한자를 사용하지 마. 예를 들어 선분을 線分으로 쓰지 말고 해당 언어의 단어로만 써.`;

  // 단계 2: 수학 핵심용어는 번역하지 않고 한국어 원문 유지
  if (stage === 2) {
    systemPrompt += `\n\n단, 다음 수학 핵심용어는 번역하지 말고 한국어 원문 그대로 유지해:\n${MATH_TERMS.join(', ')}\n용어 뒤에 알파벳(AB, CD, BC 등)이 붙어 있어도 동일하게 한국어 유지해.\n예: 선분 AB → 선분 AB, 직선 AB → 직선 AB, 반직선 BC → 반직선 BC\n절대 한자나 다른 언어로 변환하지 마.`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: JSON.stringify(texts) }
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
    const translations = JSON.parse(text);

    res.setHeader('Cache-Control', 'no-store');
    res.json({ translations: Array.isArray(translations) ? translations : [] });
  } catch {
    res.status(500).json({ error: '번역을 불러올 수 없습니다.' });
  }
}
