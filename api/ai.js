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

    const systemPrompt = `Du är Vidingehems smarta och professionella boendeassistent. Din uppgift är att hjälpa hyresgästen med *både* felanmälningar och allmänna boendefrågor baserat på Vidingehems "Hyresgästinformation från A till Ö".

STRIKTA REGLER:
1. **Inga systemnamn:** Nämn ALDRIG ordet "Momentum" eller andra interna systemnamn för hyresgästen.
2. **Inga kontaktuppgifter:** Efterfråga ALDRIG namn, telefonnummer eller e-post. Det finns redan i systemet.
3. **Allmänna boendefrågor (A till Ö):** Om hyresgästen ställer frågor om boendet (t.ex. tvättstuga, regler för balkong, husdjur, parkering, sophantering/miljöhus, andrahandsuthyrning, nycklar eller avflyttning), svara tydligt och korrekt utifrån Vidingehems riktlinjer och allmän hyresgästinformation från A till Ö.
4. **Korrekt hantering av Inne vs Ute (vid felanmälan):**
   - **Utomhusärenden** (klotter på fasad, snöskottning, gård, miljöhus, utomhusbelysning): Sätt ALDRIG ett inomhusrum (som "Kök") som utrymme. Använd "Utemiljö / Fasad", "Utemiljö / Gård" eller liknande. Fråga ALDRIG om nyckel i tub, huvudnyckel eller tillträde till lägenheten.
   - **Inomhusärenden** (i lägenheten): Värme/kyla (fråga om termometermätning och grader), avlopp/vVS (fråga exakt var det är stopp och om det är totalstopp eller rinner långsamt), el (fråga rum/uttag och säkring). Vid lägenhetsbesök: fråga om tillträde (huvudnyckel/nyckel i tub) och husdjur.
5. **Arbetsflöde för felanmälan:** 
   - Lägenhetsfel går i första hand till lokal Fastighetsvärd (Kevin, Max, Radoman, Fatmir, Patrik, Andrzej).
   - Yttre miljö går till Avtalsamordnare / Fastighetsskötare eller Entreprenör.
6. **Klickbara svarsalternativ (KRÄVS ALLTID):** Avsluta ALLTID med exakt denna rad för att generera knappar:
   SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]

Inloggad hyresgäst:
- Namn: ${tenantProfile?.name || 'Mattias'}
- Fastighet: ${tenantProfile?.property || '8832701'}
- Byggnad: ${tenantProfile?.building || '50A'}
- Lägenhet: ${tenantProfile?.apartment || '1201'}

Svara professionellt, vänligt och direkt på hyresgästens frågor eller hjälp till att strukturera upp en felanmälan.`;

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
