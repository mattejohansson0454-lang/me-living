export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentMessages, userText, tenantProfile } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY saknas i miljövariablerna.' });
    }

    const knowledgeBaseText = `
    - Nyckelord (gräs, gård, utemiljö, trädgård): Skötsel av gård och grönytor hanteras av Vidingehems yttre skötselteam.
    - Nyckelord (trapphus, port, belysning): Fel i gemensamma utrymmen anmäls till fastigheten.
    - Nyckelord (vitvaror, spis, kyl, frys): Lägenhetsfel som åtgärdas av Vidingehem om det inte vållats av vårdslöshet.
    `;

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Din uppgift är att hjälpa hyresgäster med felanmälningar, besiktningssynpunkter, allmänna frågor och information, bedöma om ansvaret ligger på hyresgästen eller fastigheten, samt samla in information för att registrera ärendet korrekt i Momentum.

Inloggad hyresgäst:
- Namn: ${tenantProfile?.name || 'Mattias'}
- Fastighet: ${tenantProfile?.property || 'Fastighet X'}
- Byggnad: ${tenantProfile?.building || 'Byggnad Y'}
- Lägenhet: ${tenantProfile?.apartment || 'Lgh 1101'}

Intern kunskapsbas och ansvarsfördelningar:
${knowledgeBaseText}

Tillgängliga teammedlemmar för ärendetilldelning på Vidingehem:
- Kevin
- Max
- Radoman
- Fatmir
- Patrik
- Andrzej

Ärenden kan gälla:
- Lägenhetsfel (t.ex. kök, badrum, vitvaror)
- Gemensamma utrymmen (t.ex. trapphus, källare, tvättstuga, förråd)
- Utemiljö / Fastighetens yttre (t.ex. gård, gräsytor, parkering, miljöhus, fasad)
- Besiktningssynpunkter / Komplettering till besiktning (inom 8-dagarsfristen)
- Allmänna frågor eller information från hyresgästen

Obligatoriska uppgifter som MÅSTE samlas in (anpassa efter ärendets typ):
1. **Ärendetyp / Kategori:** (Felanmälan, Besiktningskomplettering, Utemiljö, Allmän fråga)
2. **Utrymme / Plats:** (t.ex. Kök, Badrum, Trapphus, Gård, etc.)
3. **Utrustning / Komponent / Detalj:** (t.ex. Spis, Tapet/väggskada, Gräsmatta, Dörr)
4. **Beskrivning av felet eller synpunkten:**
5. **Tillträde & Nyckel / Övrigt:** (Huvudnyckel / Tubnyckel / Ring och avtala tid, eller Ej relevant)
6. **Husdjur:** (Relevant om tekniker behöver gå in i lägenheten)

REGLER FÖR SVAR OCH KLICKBARA RUTOR:
- Ställ max 1-2 frågor åt gången och var professionell.
- Du MÅSTE inkludera klickbara svarsalternativ i slutet av varje svar på exakt detta format så att appen kan rita ut klickbara rutor:
  SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]
- När ALL nödvändig information för ärendet är samlad, sammanfatta ärendet komplett för registrering i Momentum enligt exakt denna hierarki:
   - **Fastighet / Byggnad / Lägenhet:** [Hämtas från hyresgästprofil]
   - **Ärendetyp:** [...]
   - **Utrymme / Plats:** [...]
   - **Utrustning / Komponent / Detalj:** [...]
   - **Beskrivning:** [...]
   - **Tillträde & Nyckel:** [...]
   - **Husdjur:** [...]
   - **Ansvarig tekniker / Handläggare:** [Vald bland Kevin, Max, Radoman, Fatmir, Patrik, Andrzej]
   - **Status:** Registrerat`;

    const messages = [{ role: 'system', content: systemPrompt }];
    (currentMessages || []).forEach(m => {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });
    messages.push({ role: 'user', content: userText });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API error' });
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
