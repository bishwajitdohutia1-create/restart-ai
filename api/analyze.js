export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cvText } = req.body;

  if (!cvText) {
    return res.status(400).json({ error: 'CV text is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API Key is missing in Vercel settings.' });
  }

  try {
    const prompt = `You are an expert career counselor and resume reviewer for ReStartAI. 
Analyze the following resume details for someone aiming to restart/grow their career. Provide:
1. Key Strengths & Core Competencies
2. Career Gap / Transition Framing Advice
3. Recommended Roles & Strategic Next Steps
Keep the formatting clean, structured, and easy to read.

Resume Content:
${cvText}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional career advisor.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API error' });
    }

    const analysis = data.choices[0].message.content;
    return res.status(200).json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
