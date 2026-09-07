// services/tenantMock.js

export const mockTenants = [
  {
    id: 'user_mattias',
    name: 'Mattias',
    role: 'admin',
    property: '8832701',
    building: '50A',
    apartment: '1201',
    fullObject: '8832701-50A-1201',
    address: 'PG Vejdes väg 7, lgh 1201',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum 1', 'Sovrum 2', 'Förråd', 'Hall'],
    permissions: ['all_tickets', 'manage_properties', 'staff_overview']
  },
  {
    id: 'user_fatmir',
    name: 'Fatmir',
    role: 'tenant',
    property: '8832702',
    building: '12B',
    apartment: '1101',
    fullObject: '8832702-12B-1101',
    address: 'Österleden 12 B, lgh 1101',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum', 'Balkong']
  },
  {
    id: 'user_azra',
    name: 'Azra',
    role: 'tenant',
    property: '8832703',
    building: '4C',
    apartment: '1003',
    fullObject: '8832703-4C-1003',
    address: 'Storgatan 4 C, lgh 1003',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum 1', 'Sovrum 2', 'Uteplats']
  },
  {
    id: 'user_jonas',
    name: 'Jonas',
    role: 'tenant',
    property: '8832704',
    building: '18A',
    apartment: '1302',
    fullObject: '8832704-18A-1302',
    address: 'Teleborgsvägen 18 A, lgh 1302',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum', 'Fransk balkong']
  },
  {
    id: 'user_morgan',
    name: 'Morgan',
    role: 'tenant',
    property: '8832705',
    building: '9D',
    apartment: '1401',
    fullObject: '8832705-9D-1401',
    address: 'Hejargatan 9 D, lgh 1401',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum 1', 'Sovrum 2', 'Balkong']
  },
  {
    id: 'user_nina',
    name: 'Nina',
    role: 'tenant',
    property: '8832706',
    building: '22E',
    apartment: '1104',
    fullObject: '8832706-22E-1104',
    address: 'Sandgärdsgatan 22 E, lgh 1104',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum']
  }
];

export const getTenantProfile = (userId = 'user_mattias') => {
  const tenant = mockTenants.find(t => t.id === userId);
  return tenant || mockTenants[0];
};

export const getAllTenants = () => {
  return mockTenants;
};