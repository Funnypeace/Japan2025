export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { transcript } = req.body || {};
    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    const prompt = `Fasse den folgenden Text in maximal 5 Stichpunkten zusammen:\n${transcript}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI error', data);
      throw new Error('OpenAI API request failed');
    }
    const summary = data.choices?.[0]?.message?.content?.trim() || '';
    return res.status(200).json({ summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}

