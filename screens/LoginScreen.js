import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import styles from '../styles/appStyles';
import { getAllTenants } from '../services/tenantMock';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const tenants = getAllTenants();

  const handleSelectTenant = async (tenant) => {
    setLoading(true);
    try {
      // Sparar en säker sessionstoken i telefonens krypterade minne[cite: 1]
      await SecureStore.setItemAsync('vidingehem_user_token', `active_session_token_${tenant.id}`);
      
      // Simulera en kort BankID-verifiering för vald användare
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(tenant);
      }, 400);
    } catch (error) {
      setLoading(false);
      Alert.alert('Inloggning misslyckades', 'Kunde inte verifiera med BankID. Försök igen.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#121212' }}>
      <View style={{ marginBottom: 30, alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 26, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>Välkommen till Vidingehem</Text>
        <Text style={{ color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          Välj profil för att simulera BankID-inloggning i me-living[cite: 1]:
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00E5FF" style={{ marginVertical: 40 }} />
      ) : (
        <View style={{ width: '100%' }}>
          {tenants.map((tenant) => (
            <TouchableOpacity 
              key={tenant.id}
              style={{ 
                backgroundColor: tenant.role === 'admin' ? '#1a262a' : '#1E1E1E', 
                width: '100%', 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: tenant.role === 'admin' ? '#00E5FF' : '#333333',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }} 
              onPress={() => handleSelectTenant(tenant)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                {tenant.name} {tenant.role === 'admin' ? '👑 (Admin)' : ''}
              </Text>
              <Text style={{ color: tenant.role === 'admin' ? '#00E5FF' : '#AAAAAA', fontSize: 13 }}>
                {tenant.role === 'admin' ? 'Fullständig åtkomst till fastigheter och ärenden via Momentum[cite: 1]' : `🏠 ${tenant.address}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}