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

    // Hämta dynamiska modeller från Groq och kombinera med säkra standarder
    let candidateModels = [
      'llama-3.3-70b-versatile', 
      'llama-3.1-8b-instant', 
      'llama3-8b-8192', 
      'llama3-70b-8192',
      'mixtral-8x7b-32768'
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
    } catch (e) {
      // Ignorera fel vid modellhämtning och kör på standardlistan
    }

    let response;
    let data;

    // Testa modellerna i tur och ordning tills en fungerar
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
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      data = await response.json();
      if (response.ok) {
        break; // Hoppa ur loppen direkt när vi hittar en fungerande modell
      }

      // Om felet är att modellen saknas, testa nästa i listan
      if (data.error && (data.error.message?.includes('does not exist') || data.error.message?.includes('not have access'))) {
        continue;
      }
      
      break; // Vid andra typer av fel (t.ex. ogiltig nyckel), bryt loopen
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
