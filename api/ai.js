export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentMessages, userText, tenantProfile } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY saknas i miljövariablerna i Vercel.' });
    }

    const gransdragningKnowledge = `
    - LÄGENHETSÄRENDEN (Bygg, enklare El, VS, Vitvaror): Går ALLTID i första hand till en lokal **Fastighetsvärd** (Kevin, Max, Radoman, Fatmir, Patrik eller Andrzej) som gör en första kontroll eller åtgärd på plats. Om felet kräver specialist (t.ex. behörig elektriker eller VVS-entreprenör) skickar eller eskalerar fastighetsvärden ärendet vidare efter sin kontroll.
    - YTTRE MILJÖ (YM) / Vinterväghållning (snöskottning, halkbekämpning): Ansvarig utförare är Avtalsamordnare / Fastighetsskötare eller Entreprenör (aldrig lägenhetens fastighetsvärd som primäransvarig för själva skottningen).
    `;

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Din uppgift är att hjälpa hyresgäster med felanmälningar, besiktningssynpunkter och gränsdragningsbedömningar.

ABSOLUTA REGLER:
1. **Inga förhastade slutsatser:** Ställ ALLTID relevanta följdfrågor till hyresgästen innan du slutför eller registrerar ett ärende. Skapa aldrig ett färdigt ärende direkt i första meddelandet!
2. **Korrekt arbetsflöde för lägenhet:** Ärenden som rör lägenheten ska *alltid* i första hand tilldelas en lokal **Fastighetsvärd** (Kevin, Max, Radoman, Fatmir, Patrik eller Andrzej) för kontroll eller åtgärd. Sätt inte en extern entreprenör direkt om det rör lägenhetsfel – fastighetsvärden bedömer om det behövs eskalering.
3. **Korrekt utrymme/plats:** Om ärendet gäller gård, utemiljö, trapphus eller miljöhus får utrymme ALDRIG vara ett lägenhetsrum (som "Kök"). Använd t.ex. "Utemiljö / Gård", "Trapphus" eller "Miljöhus". För yttre miljö är ansvarig **Avtalsamordnare / Fastighetsskötare** eller **Entreprenör**.
4. **Svarsalternativ:** Avsluta ALLTID med klickbara svarsalternativ på exakt detta format:
   SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]

Inloggad hyresgäst:
- Namn: ${tenantProfile?.name || 'Mattias'}
- Fastighet: ${tenantProfile?.property || '8832701'}
- Byggnad: ${tenantProfile?.building || '50A'}
- Lägenhet: ${tenantProfile?.apartment || '1201'}

Gränsdragningskunskap & Arbetsflöde:
${gransdragningKnowledge}

När hyresgästen har svarat på dina frågor och ALL information är inhämtad, sammanfatta och registrera ärendet i Momentum med rätt kategori, korrekt utrymme och rätt ansvarig enligt ovanstående flöde.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    (currentMessages || []).forEach(m => {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });
    messages.push({ role: 'user', content: userText });

    let candidateModels = [
      'llama-3.3-70b-versatile', 
      'llama-3.1-8b-instant', 
      'llama3-8b-8192', 
      'llama3-70b-8192'
    ];

    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const apiModels = (modelsData.data || [])
          .map(m => m.id)
          .filter(id => !id.includes('whisper') && !id.includes('embed') && !id.includes('guard') && !id.includes('tts') && !id.includes('vision'));
        if (apiModels.length > 0) {
          candidateModels = [...new Set([...apiModels, ...candidateModels])];
        }
      }
    } catch (e) {}

    let response;
    let data;

    for (const modelId of candidateModels) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: 0.2,
          max_tokens: 600
        })
      });

      data = await response.json();
      if (response.ok) {
        break;
      }

      if (data.error && (data.error.message?.includes('does not exist') || data.error.message?.includes('not have access'))) {
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      return res.status(response?.status || 500).json({ error: data?.error?.message || 'Alla modeller misslyckades.' });
    }

    const aiText = data.choices[0]?.message?.content || 'Inget svar från AI.';
    
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: aiText }]
        }
      }]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
