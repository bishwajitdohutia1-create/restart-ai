export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cvText } = req.body;

  if (!cvText) {
    return res.status(400).json({ error: 'CV text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API Key is missing in Vercel settings.'
    });
  }

  try {
    const prompt = `You are an expert career counselor and resume analyzer. Analyze the provided CV, identify strengths, address any career gaps constructively, suggest transferable skills, and recommend 3-5 suitable career paths or job roles. Return clear and actionable feedback.\n\nCV Content:\n${cvText}`;

    const cleanKey = apiKey.trim();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${cleanKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to analyze CV with Gemini'
      });
    }

    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({ result: analysis });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message
    });
  }
}
