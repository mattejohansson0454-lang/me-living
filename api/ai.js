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
    - BYGG / Fastighetsvärd / Snickare: Skötsel av dörrar, lås, cylindrar, tätlister, fönsterjustering, köksluckor, lagningsplugghål, trösklar.
    - EL / Elektriker / Fastighetsvärd: Fastighetsvärden byter säkringar (<35A), ljuskällor och enklare uttag/strömbrytare. Elektriker hanterar fasta elinstallationer, el ej standard, säkringsbyten större än 35A och armaturer.
    - VS / VVS / Fastighetsvärd: Fastighetsvärden rensar enklare avloppstopp (vask, golvbrunn, dusch) och lagar/byter blandare och WC. Större VVS-arbeten och stamstopp går via VVS-entreprenör.
    - VITVAROR (Vitv) / Elektriker / Fastighetsvärd: Kyl, frys, spis, ugn, diskmaskin. Fastighetsvärd gör enklare kontroller och dörrpackningar; reparation/byte av vitvaror görs av elektriker/entreprenör.
    - VENTILATION (Vent): Spisfläktar, filterbyten, kontroll av ventilation och FTX-aggregat.
    - YTTRE MILJÖ (YM): Gräsytor, miljöhus, snöröjning, lekplatser, fastighetsbelysning.
    `;

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Din uppgift är att hjälpa hyresgäster med felanmälningar, besiktningssynpunkter, ansvarsbedömning enligt Vidingehems gränsdragningslista samt samla in information för registrering i Momentum.

VIKTIGA REGLER:
- Prata ENDAST om lägenheter, fastigheter, vitvaror, rum och utemiljö. Inga datorer eller IT-system i lägenheten!
- Följ Vidingehems gränsdragningslista för att avgöra om det är lägenhetsfel, gemensamma utrymmen eller yttre miljö, och vilken yrkesgrupp eller tekniker som ansvarar.
- Ställ max 1-2 korta frågor åt gången för att samla in uppgifter (t.ex. ärendetyp, utrymme, komponent/detalj, beskrivning, tillträde/nyckel, husdjur).
- Du MÅSTE ALLTID avsluta ditt svar med klickbara svarsalternativ på exakt detta format:
  SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]

Inloggad hyresgäst:
- Namn: ${tenantProfile?.name || 'Mattias'}
- Fastighet: ${tenantProfile?.property || '8832701'}
- Byggnad: ${tenantProfile?.building || '50A'}
- Lägenhet: ${tenantProfile?.apartment || '1201'}

Tillgängliga interna tekniker på Vidingehem för tilldelning: Kevin, Max, Radoman, Fatmir, Patrik, Andrzej (samt specialister som VVS, Elektriker, Vent vid behov).

Gränsdragningskunskap & Åtgärdskoder:
${gransdragningKnowledge}

När ALL nödvändig information är samlad, avsluta med en komplett sammanfattning för registrering i Momentum enligt denna exakta hierarki:
- **Fastighet / Byggnad / Lägenhet:** ${tenantProfile?.property || '8832701'} / ${tenantProfile?.building || '50A'} / ${tenantProfile?.apartment || '1201'}
- **Ärendetyp:** [...]
- **Utrymme / Plats:** [...]
- **Utrustning / Komponent / Detalj:** [...]
- **Beskrivning:** [...]
- **Tillträde & Nyckel:** [...]
- **Husdjur:** [...]
- **Ansvarig tekniker / Yrkesgrupp:** [Vald bland Kevin, Max, Radoman, Fatmir, Patrik, Andrzej, Elektriker, VVS, Vent etc.]
- **Status:** Registrerat i Momentum`;

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
