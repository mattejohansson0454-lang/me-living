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
    - LÄGENHETSÄRENDEN (Bygg, enklare El, VS, Vitvaror): Går ALLTID i första hand till lokal Fastighetsvärd (Kevin, Max, Radoman, Fatmir, Patrik, Andrzej) för kontroll/åtgärd. Vid behov eskaleras det till specialist (elektriker, VVS-entreprenör).
    - YTTRE MILJÖ (YM) / Vinterväghållning: Ansvarig är Avtalsamordnare / Fastighetsskötare eller Entreprenör.
    `;

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Din uppgift är att med hög logisk förmåga hjälpa hyresgästen att göra en fullständig felanmälan.

ABSOLUTA REGLER:
1. **inga kontaktuppgifter:** Efterfråga ALDRIG telefonnummer, e-post eller namn. Detta finns redan registrerat i systemet via hyresgästprofilen.
2. **Kategori-specifik logik (Ställ rätt frågor direkt):** 
   - Rör det **värme/kyla**: Fråga om hyresgästen har mätt temperaturen och vilken temperatur termometern visar.
   - Rör det **avlopp/VVS**: Fråga exakt var det är stopp (kökssvask, handfat, golvbrunn, toalett) och om det är totalt stopp eller rinner undan långsamt.
   - Rör det **el**: Fråga vilket rum/uttag och om proppen/säkringen har gått.
   - Fläta alltid in/fråga vid behov: Om vi får gå in med huvudnyckel / nyckel i tub, samt om det finns husdjur i lägenheten som tekniker behöver känna till.
3. **Arbetsflöde för lägenhet:** Lägenhetsfel går i första hand till fastighetsvärd (Kevin, Max, Radoman, Fatmir, Patrik, Andrzej). Yttre miljö går till Avtalsamordnare/Fastighetsskötare eller Entreprenör.
4. **Klickbara svarsalternativ (KRÄVS ALLTID):** Du MÅSTE ALLTID avsluta ditt svar med klickbara svarsalternativ på exakt detta format för att generera knappar i gränssnittet:
   SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]

Inloggad hyresgäst:
- Namn: ${tenantProfile?.name || 'Mattias'}
- Fastighet: ${tenantProfile?.property || '8832701'}
- Byggnad: ${tenantProfile?.building || '50A'}
- Lägenhet: ${tenantProfile?.apartment || '1201'}

Gränsdragningskunskap:
${gransdragningKnowledge}

Ställ korta, relevanta följdfrågor baserat på ärendet. När all info är samlad, sammanfatta och registrera ärendet i Momentum.`;

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
