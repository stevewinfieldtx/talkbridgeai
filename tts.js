// Vercel Serverless Function — ElevenLabs TTS
// ELEVENLABS_API_KEY set in Vercel environment variables

// Language-specific voice selection
// English gets a native English voice; other languages use multilingual Bella
const VOICE_BY_LANG = {
  'en-us': '21m00Tcm4TlvDq8ikWAM',  // Rachel — native American English, clear & natural
  'en-gb': '21m00Tcm4TlvDq8ikWAM',  // Rachel for British too
};
const DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Bella — great multilingual voice

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const params = req.method === 'GET' ? req.query : { ...req.query, ...req.body };
  const { text, lang } = params;

  if (!text || !lang) {
    return res.status(400).json({ error: 'Missing required params: text, lang' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }

  const safeText = text.slice(0, 5000);
  // Pick voice based on target language — English gets a native English speaker
  const voiceId = VOICE_BY_LANG[lang] || DEFAULT_VOICE;
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
