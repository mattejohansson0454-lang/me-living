export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentMessages, userText, tenantProfile } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // Om nyckeln inte finns alls, skriv ut det direkt i chatten
    if (!GROQ_API_KEY) {
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: "⚠️ DEBUG: GROQ_API_KEY är helt tom i Vercel-miljön! Nyckeln saknas eller har inte plockats upp." }] } }] 
      });
    }

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Svara professionellt. SVARSALTERNATIV: ["Felanmälan", "Allmän fråga"]`;

    const messages = [{ role: 'system', content: systemPrompt }];
    (currentMessages || []).forEach(m => {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });
    messages.push({ role: 'user', content: userText || 'hej' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.3
      })
    });

    const data = await response.json();

    // Om Groq klagar, visa hela felmeddelandet direkt i chatten i stället för att dölja det
    if (!response.ok) {
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: `⚠️ GROQ API-FEL (${response.status}): ${JSON.stringify(data)}` }] } }] 
      });
    }

    const aiText = data.choices?.[0]?.message?.content || 'Inget svar från AI.';
    
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: aiText }]
        }
      }]
    });
  } catch (error) {
    return res.status(200).json({ 
      candidates: [{ content: { parts: [{ text: `⚠️ KODFEL: ${error.message}` }] } }] 
    });
  }
}
