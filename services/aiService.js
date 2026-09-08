// services/aiService.js
export const callAI = async (currentMessages, userText, tenantProfile = {}) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentMessages, userText, tenantProfile })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Serverfel:', data);
      return `⚠️ API-fel: ${data.error || 'Kunde inte nå servern.'}`;
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
