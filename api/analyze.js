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
    return res.status(500).json({
      error: 'OpenAI API Key is missing in Vercel settings.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert career counselor and resume analyzer. Analyze the provided CV, identify strengths, address any career gaps constructively, suggest transferable skills, and recommend 3-5 suitable career paths or job roles. Return clear and actionable feedback.'
          },
          {
            role: 'user',
            content: `Please analyze this CV / Career background:\n\n${cvText}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to analyze CV with OpenAI'
      });
    }

    const analysis = data.choices?.[0]?.message?.content;

    return res.status(200).json({ result: analysis });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message
    });
  }
}
