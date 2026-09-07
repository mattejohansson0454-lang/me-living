// services/aiService.js
import { tenantResponsibilities } from './knowledgeBase';

export async function callAI(currentMessages, userText, tenantProfile = {}) {
  // Simulera kort svarstid för naturlig känsla
  await new Promise(resolve => setTimeout(resolve, 600));

  const text = userText.toLowerCase();
  const fullHistoryText = currentMessages.map(m => m.content.toLowerCase()).join(' ') + ' ' + text;

  // Tillgängliga teammedlemmar att fördela ärenden på
  const technicians = ['Kevin', 'Max', 'Radoman', 'Fatmir', 'Patrik', 'Andrzej'];
  const randomTech = technicians[Math.floor(Math.random() * technicians.length)];

  // 1. Om användaren beskriver ett fel men inte valt utrymme ännu
  if (!fullHistoryText.includes('badrum') && !fullHistoryText.includes('kök') && !fullHistoryText.includes('vardagsrum') && !fullHistoryText.includes('hall') && !fullHistoryText.includes('sovrum')) {
    return `Jag förstår. För att kunna registrera felanmälan till Vidingehems fastighetsteam behöver jag veta vilket utrymme det gäller.\n\nSVARSALTERNATIV: ["Badrum", "Kök", "Vardagsrum", "Hall", "Sovrum"]`;
  }

  // 2. Om utrymme är valt men inte komponent/utrustning
  if (!fullHistoryText.includes('spis') && !fullHistoryText.includes('kyl') && !fullHistoryText.includes('blandare') && !fullHistoryText.includes('wc') && !fullHistoryText.includes('element') && !fullHistoryText.includes('stopp')) {
    return `Tack. Vilken typ av utrustning eller komponent rör det sig om i utrymmet?\n\nSVARSALTERNATIV: ["Vatten / Avlopp / Stopp", "El / Belysning", "Vitvaror", "Dörr / Fönster", "Övrigt"]`;
  }

  // 3. Om tillträde saknas
  if (!fullHistoryText.includes('hemma') && !fullHistoryText.includes('tub') && !fullHistoryText.includes('ring')) {
    return `Hur önskar du att tekniker ska få tillträde till lägenheten (${tenantProfile.apartment || 'Lgh 1201'})?\n\nSVARSALTERNATIV: ["Hemma under besöket", "Nyckel i tub", "Ring mig innan besök"]`;
  }

  // 4. Om husdjur saknas
  if (!fullHistoryText.includes('husdjur') && !fullHistoryText.includes('inga') && !fullHistoryText.includes('hund') && !fullHistoryText.includes('katt')) {
    return `Finns det några husdjur i lägenheten som tekniker behöver ta hänsyn till?\n\nSVARSALTERNATIV: ["Inga husdjur", "Hund finns", "Katt finns"]`;
  }

  // 5. Slutsteg: Skapa den kompletta sammanfattningen som triggar Momentum-ärendet
  return `Tack för alla uppgifter! Ärendet har nu kontrollerats mot Vidingehems ansvarsfördelning och registrerats.\n\n- **Fastighet / Byggnad / Lägenhet:** ${tenantProfile.fullObject || '8832701-50A-1201'}\n- **Utrymme:** Enligt angivet\n- **Utrustning / Komponent:** Enligt angivet\n- **Beskrivning:** ${userText}\n- **Tillträde & Nyckel:** Enligt vald metod\n- **Husdjur:** Enligt angivet\n- **Ansvarig tekniker:** ${randomTech}\n- **Status:** Registrerat`;
}
