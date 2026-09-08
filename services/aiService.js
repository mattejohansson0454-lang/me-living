// services/aiService.js
import { tenantResponsibilities } from './knowledgeBase';

const GEMINI_API_KEY = 'AQ.Ab8RN6LAYUP3AH9MiDibfOkRgR-vCSm1RK1NCeGQmOGZ_sZK_A';

export const callAI = async (currentMessages, userText, tenantProfile = {}) => {
  try {
    const knowledgeBaseText = tenantResponsibilities
      .map(r => `- Nyckelord (${r.keywords.join(', ')}): ${r.guide}`)
      .join('\n');

    const systemPrompt = `Du är Vidingehems officiella boendeassistent. Din uppgift är att hjälpa hyresgäster med felanmälningar, bedöma om ansvaret ligger på hyresgästen eller fastigheten, och samla in information för att registrera ärendet korrekt i Momentum.

Inloggad hyresgäst (används automatiskt för Fastighet, Byggnad och Lägenhet):
- Namn: ${tenantProfile.name || 'Mattias'}
- Fastighet: ${tenantProfile.property || 'Fastighet X'}
- Byggnad: ${tenantProfile.building || 'Byggnad Y'}
- Lägenhet: ${tenantProfile.apartment || 'Lgh 1101'}

Intern kunskapsbas och ansvarsfördelningar:
${knowledgeBaseText}

Tillgängliga teammedlemmar för ärendetilldelning på Vidingehem:
- Kevin
- Max
- Radoman
- Fatmir
- Patrik
- Andrzej

Obligatoriska uppgifter som MÅSTE samlas in:
1. **Utrymme:** (t.ex. Kök, Badrum, Hall, Vardagsrum, Sovrum, Balkong, Förråd)
2. **Utrustning / Komponent:** (t.ex. Spis, Kyl/frys, Duschblandare, Wc-stol, Element, Dörr, Fönster)
3. **Beskrivning av felet:**
4. **Tillträde & Nyckel:** (Huvudnyckel / Tubnyckel / Ring och avtala tid)
5. **Husdjur:** (Hund, katt, inga husdjur)

REGLER FÖR SVAR OCH KLICKBARA RUTOR:
- Ställ max 1-2 frågor åt gången och var professionell.
- Du MÅSTE inkludera klickbara svarsalternativ i slutet av varje svar på exakt detta format så att appen kan rita ut klickbara rutor:
  SVARSALTERNATIV: ["Alternativ 1", "Alternativ 2", "Alternativ 3"]
- När ALL information (Utrymme, Utrustning, Beskrivning, Tillträde, Husdjur) är samlad, sammanfatta ärendet komplett för registrering i Momentum enligt exakt denna hierarki:
   - **Fastighet / Byggnad / Lägenhet:** [Hämtas från hyresgästprofil]
   - **Utrymme:** [...]
   - **Utrustning / Komponent:** [...]
   - **Beskrivning:** [...]
   - **Tillträde & Nyckel:** [...]
   - **Husdjur:** [...]
   - **Ansvarig tekniker:** [Vald bland Kevin, Max, Radoman, Fatmir, Patrik, Andrzej]
   - **Status:** Registrerat`;

    const contents = currentMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: userText }] });

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.3,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Felmeddelande:', data);
      return `⚠️ API-fel från Google: ${data.error?.message || 'Kontrollera att din autentisering är korrekt.'}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    return 'Kunde inte tolka svaret från Google AI.';
  } catch (error) {
    console.error('Nätverksfel:', error);
    return `Ett nätverksfel uppstod: ${error.message}`;
  }
};
