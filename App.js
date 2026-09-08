import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import styles from './styles/appStyles';
import LoginScreen from './screens/LoginScreen';

// Importera skärmar
import ChatScreen from './screens/ChatScreen';
import TicketScreen from './screens/TicketScreen';
import HousingScreen from './screens/HousingScreen';
import ApartmentScreen from './screens/ApartmentScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import AddonScreen from './screens/AddonScreen';
import NotificationScreen from './screens/NotificationScreen';

// Importera services
import { loginWithBankId } from './services/bankIdService';
import { getTenantProfile } from './services/tenantMock';

export default function App() {
  const [tenantProfile, setTenantProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('kundservice');
  const [activeSubTab, setActiveSubTab] = useState(null);

  // Kontrollera om det finns en sparad session när appen startar
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      let savedToken = null;
      if (Platform.OS === 'web') {
        savedToken = localStorage.getItem('vidingehem_user_token');
      } else {
        savedToken = await SecureStore.getItemAsync('vidingehem_user_token');
      }

      if (savedToken) {
        // Extrahera rätt användar-ID från token (t.ex. "active session token user_fatmir")
        const tenantId = savedToken.replace('active session token ', '');
        const tenant = getTenantProfile(tenantId) || getTenantProfile('user_mattias');
        setTenantProfile(tenant);
      }
    } catch (error) {
      console.log('Kunde inte läsa sparad session', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('vidingehem_user_token');
      } else {
        await SecureStore.deleteItemAsync('vidingehem_user_token');
      }
      setTenantProfile(null);
    } catch (error) {
      console.log('Kunde inte radera session', error);
    }
  };

  // Delad state som skickas ner till skärmarna
  const [myTickets, setMyTickets] = useState([
    {
      id: 'R-2608-9341',
      actionCode: 'KÖK-LUCK-01',
      object: 'PG Vejdes väg 7, lgh 1011',
      room: 'Kök',
      category: 'Köksinredning / Luckor',
      description: 'Skada på lådskena i köket.',
      prioText: null,
      registeredDate: '2026-08-19',
      status: 'Aktiv',
      statusColor: '#00E5FF',
      handler: 'Mattias Eskilzen'
    }
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2026-09',
      period: 'Hyra September 2026',
      amount: '6 850 kr',
      dueDate: '2026-08-31',
      ocr: '38291048291',
      status: 'Obetald',
      isPaid: false
    },
    {
      id: 'INV-2026-08',
      period: 'Hyra Augusti 2026',
      amount: '6 850 kr',
      dueDate: '2026-07-31',
      ocr: '38291048290',
      status: 'Betald',
      isPaid: true
    }
  ]);

  const [availableApartments] = useState([
    {
      id: 'BOP-8801',
      address: 'Österleden 14 A',
      area: 'Öster',
      type: '3 rum och kök',
      size: '74 kvm',
      numericSize: 74,
      rent: '7 420 kr/mån',
      numericRent: 7420,
      inflytt: '2026-11-01',
      sistaAnmalan: '2026-09-15',
      category: 'Ordinärt boende',
      floor: '2 tr (utan hiss)',
      description: 'Ljus och välplanerad trea med balkong i söderläge. Stambytt badrum 2021 med förberett för tvättmaskin.',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
      boplatsUrl: 'https://www.vaxjo.se/boplats/se/boplats-vaxjo.html'
    }
  ]);

  const [addons, setAddons] = useState([
    { id: 'a1', title: 'Diskmaskin (Inkl. installation)', price: '115 kr/mån', ordered: false },
    { id: 'a2', title: 'Säkerhetsdörr (Klass 3)', price: '140 kr/mån', ordered: true },
    { id: 'a3', title: 'Parkettgolv i vardagsrum', price: '185 kr/mån', ordered: false }
  ]);

  const [notifications] = useState([
    { id: 'n1', title: 'Planerat vattenavbrott', text: 'Onsdag 10 Sep kl 08:00 - 12:00 pga underhållsarbeten.', date: 'Idag' },
    { id: 'n2', title: 'Bokning bekräftad', text: 'Du har bokat tvättstuga B Tisdag 8 Sep kl 14:00.', date: 'Igår' }
  ]);

  const payInvoice = (id) => {
    loginWithBankId().then(() => {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, isPaid: true, status: 'Betald' } : inv));
      Alert.alert('Betalning genomförd', 'Tack! Din hyresfaktura är nu markerad som betald via BankID.');
    });
  };

  const toggleAddon = (id) => {
    setAddons(addons.map(a => a.id === id ? { ...a, ordered: !a.ordered } : a));
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  // Om användaren inte är inloggad -> Visa BankID-inloggning (tar emot vald tenant från LoginScreen)
  if (!tenantProfile) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#121212' }]}>
          <LoginScreen onLoginSuccess={(selectedTenant) => setTenantProfile(selectedTenant)} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        
        {/* Header */}
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }]}>
          <Image source={require('./logga.png')} style={styles.vidingehemLogoImage} resizeMode="contain" />
          <TouchableOpacity onPress={handleLogout} style={[{ padding: 6 }, { cursor: 'pointer' }]}>
            <Text style={{ color: '#AAAAAA', fontSize: 12 }}>Logga ut ({tenantProfile.name})</Text>
          </TouchableOpacity>
        </View>

        {/* Huvudmenyknappar */}
        <View style={styles.tabGridContainer}>
          <TouchableOpacity 
            style={[styles.gridTab, activeTab === 'kundservice' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
            onPress={() => { setActiveTab('kundservice'); setActiveSubTab(null); }}
          >
            <Text style={[styles.gridTabText, activeTab === 'kundservice' && styles.activeGridTabText]}>💬 Chatt/Felanmälan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridTab, activeTab === 'boende' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
            onPress={() => { setActiveTab('boende'); setActiveSubTab(null); }}
          >
            <Text style={[styles.gridTabText, activeTab === 'boende' && styles.activeGridTabText]}>🏠 Mitt boende</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridTab, activeTab === 'boplats' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
            onPress={() => { setActiveTab('boplats'); setActiveSubTab(null); }}
          >
            <Text style={[styles.gridTabText, activeTab === 'boplats' && styles.activeGridTabText]}>🔍 Boplats</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridTab, activeTab === 'notiser' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
            onPress={() => { setActiveTab('notiser'); setActiveSubTab(null); }}
          >
            <Text style={[styles.gridTabText, activeTab === 'notiser' && styles.activeGridTabText]}>🔔 Notiser</Text>
          </TouchableOpacity>
        </View>

        {/* Undermappar för "Mitt boende" */}
        {activeTab === 'boende' && (
          <View style={styles.subTabContainer}>
            <TouchableOpacity 
              style={[styles.subGridTab, activeSubTab === 'arenden' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
              onPress={() => setActiveSubTab('arenden')}
            >
              <Text style={[styles.gridTabText, activeSubTab === 'arenden' && styles.activeGridTabText]}>📋 Ärenden</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.subGridTab, activeSubTab === 'fakturor' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
              onPress={() => setActiveSubTab('fakturor')}
            >
              <Text style={[styles.gridTabText, activeSubTab === 'fakturor' && styles.activeGridTabText]}>💳 Fakturor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.subGridTab, activeSubTab === 'tillval' ? styles.activeGridTab : styles.inactiveGridTab, { cursor: 'pointer' }]} 
              onPress={() => setActiveSubTab('tillval')}
            >
              <Text style={[styles.gridTabText, activeSubTab === 'tillval' && styles.activeGridTabText]}>🚪 Tillval</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {activeTab === 'kundservice' && <ChatScreen myTickets={myTickets} setMyTickets={myTickets} tenantProfile={tenantProfile} />}
          {activeTab === 'boplats' && <ApartmentScreen availableApartments={availableApartments} />}
          {activeTab === 'notiser' && <NotificationScreen notifications={notifications} tenantProfile={tenantProfile} />}
          
          {activeTab === 'boende' && (
            <>
              {activeSubTab === 'arenden' && <TicketScreen myTickets={myTickets} />}
              {activeSubTab === 'fakturor' && <InvoiceScreen invoices={invoices} payInvoice={payInvoice} />}
              {activeSubTab === 'tillval' && <AddonScreen addons={addons} toggleAddon={toggleAddon} />}
              {!activeSubTab && <HousingScreen tenantProfile={tenantProfile} />}
            </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
