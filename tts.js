// Vercel Serverless Function — ElevenLabs TTS
// ELEVENLABS_API_KEY set in Vercel environment variables

// ElevenLabs voice IDs — multilingual v2 model
const VOICES = {
  female: 'EXAVITQu4vr4xnSDxMaL',  // Bella — clear, warm
  male:   'VR6AewLTigWG4xSOukaG',    // Arnold — natural
};

// Map language codes to ElevenLabs language hints
// The multilingual_v2 model auto-detects, but hints help
const LANG_HINTS = {
  'en-us':'en','es-mx':'es','es-es':'es','zh-cn':'zh','vi-vn':'vi',
  'fr-fr':'fr','de-de':'de','it-it':'it','pt-br':'pt','ja-jp':'ja',
  'ko-kr':'ko','th-th':'th','hi-in':'hi','ar-sa':'ar','ru-ru':'ru',
  'nl-nl':'nl','uk-ua':'uk',
};

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const params = req.method === 'GET' ? req.query : { ...req.query, ...req.body };
  const { text, lang, gender } = params;

  if (!text || !lang) {
    return res.status(400).json({ error: 'Missing required params: text, lang' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }

  const safeText = text.slice(0, 5000);
  const voiceId = VOICES[gender] || VOICES.female;
  const modelId = 'eleven_multilingual_v2';

  try {
    const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: safeText,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elRes.ok) {
      const errText = await elRes.text();
      console.error('ElevenLabs error:', elRes.status, errText);
      return res.status(elRes.status).json({ error: errText });
    }

    const arrayBuffer = await elRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(audioBuffer);

  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message });
  }
};
