import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 수학_용어 ko 목록 캐시 (프로세스 재시작 전까지 유지)
let mathTermsCache = null;
function getMathTerms() {
  if (!mathTermsCache) {
    const data = JSON.parse(readFileSync(join(__dirname, '..', 'math_vocab_geometry.json'), 'utf-8'));
    mathTermsCache = data['수학_용어'].map(v => v.ko);
  }
  return mathTermsCache;
}

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

  let systemPrompt = `너는 중학교 수학 교과서 번역 전문가야. 중1 수학 기본도형 단원이야.\n아래 JSON 배열의 한국어 텍스트를 ${langName}로 번역해서 동일한 순서의 JSON 배열로만 반환해.\n배열 길이는 입력과 반드시 같아야 해. 다른 말은 절대 하지 마.\n형식 예시: ["번역1", "번역2"]`;

  // 단계 2: 수학 핵심용어는 번역하지 않고 한국어 원문 유지
  if (stage === 2) {
    const mathTerms = getMathTerms();
    systemPrompt += `\n\n단, 다음 수학 핵심용어는 번역하지 말고 한국어 원문 그대로 유지해:\n${mathTerms.join(', ')}`;
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
        model: 'claude-sonnet-4-6',
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
