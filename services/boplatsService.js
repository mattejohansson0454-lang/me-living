const API_URL = 'https://raw.githubusercontent.com/mattejohansson0454-lang/boplats-scraper/refs/heads/main/apartments.json';

export const getAvailableApartments = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP-fel: ${response.status} (${response.statusText})`);
    }
    const data = await response.json();
    const aptList = Array.isArray(data) ? data : (data.apartments || data.results || []);

    return aptList.map((apt, index) => {
      let imageUrl = apt.imageUrl && typeof apt.imageUrl === 'string' && apt.imageUrl.trim() !== '' 
        ? apt.imageUrl.trim() 
        : 'https://images.unsplash.com/photo-1502672260266-1clef2d93688?w=600&auto=format&fit=crop&q=80';

      if (imageUrl.startsWith('/')) {
        imageUrl = `https://minasidor.vidingehem.se${imageUrl}`;
      }

      // Extrahera direkt från beskrivningens textdelar där allt finns uppdelat med |
      const descParts = (apt.description || '').split('|').map(p => p.trim());

      // Hitta storlek (t.ex. "63.8" som ligger före "Kvm")
      let size = apt.sqm;
      if (!size || size.toLowerCase() === 'kvm' || size === '') {
        const kvmIndex = descParts.findIndex(p => /kvm/i.test(p));
        if (kvmIndex > 0) {
          size = `${descParts[kvmIndex - 1]} kvm`;
        } else {
          size = '65 kvm';
        }
      }

      // Hitta hyra (t.ex. "7510" som ligger före "Kr/mån")
      let rent = apt.rent;
      if (!rent || rent.toLowerCase().includes('kr/mån') === false && rent.toLowerCase().includes('kr') === false || rent === '') {
        const krIndex = descParts.findIndex(p => /kr\/mån/i.test(p) || /^kr$/i.test(p));
        if (krIndex > 0) {
          rent = `${descParts[krIndex - 1]} kr/mån`;
        } else {
          rent = '7 500 kr/mån';
        }
      }

      const roomType = apt.rooms || descParts.find(p => /rum|rok/i.test(p)) || '2 rum och kök';
      const cleanAddress = apt.address && apt.address !== 'Storlek' ? apt.address : (descParts[0] || 'Vidingehem');
      const cleanArea = apt.area && apt.area !== '' ? apt.area : (descParts[1] || 'Växjö');

      return {
        ...apt,
        id: `BOP-${index + 1}`,
        address: cleanAddress,
        area: cleanArea,
        type: roomType,
        size: size.replace(/storlek/i, '').trim(),
        rent: rent,
        numericSize: parseFloat(size.replace(/[^\d.]/g, '')) || 65,
        numericRent: parseInt(rent.replace(/\D/g, '')) || 7500,
        inflytt: apt.availableDate || 'Snarast',
        sistaAnmalan: apt.sistaAnmalan || '2026-09-30',
        imageUrl: imageUrl,
        boplatsUrl: apt.boplatsUrl || 'https://minasidor.vidingehem.se'
      };
    });
  } catch (error) {
    console.log('FEL vid hämtning:', error.message);
    return [];
  }
};