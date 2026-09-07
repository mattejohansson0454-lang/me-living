import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import styles from '../styles/appStyles';
import { getAllTenants } from '../services/tenantMock';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const tenants = getAllTenants();

  const handleSelectTenant = async (tenant) => {
    setLoading(true);
    try {
      const tokenKey = 'vidingehem_user_token';
      const tokenValue = `active session token ${tenant.id}`;

      // SecureStore finns inte på webben -> Använd localStorage på webb och SecureStore på iOS/Android
      if (Platform.OS === 'web') {
        try {
          localStorage.setItem(tokenKey, tokenValue);
        } catch (e) {
          console.log('Kunde inte spara i localStorage', e);
        }
      } else {
        await SecureStore.setItemAsync(tokenKey, tokenValue);
      }

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
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#121212' }}
      contentContainerStyle={{ padding: 24, flexGrow: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={{ marginBottom: 32, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            Välkommen till Vidingehem
          </Text>
          <Text style={{ color: '#AAAAAA', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            Välj profil för att simulera BankID-inloggning i me-living:
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00E5FF" style={{ marginVertical: 48 }} />
        ) : (
          <View style={{ width: '100%' }}>
            {tenants.map((tenant) => (
              <Pressable
                key={tenant.id}
                accessible={true}
                accessibilityRole="button"
                style={({ pressed }) => [
                  {
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
                    elevation: 3,
                    opacity: pressed ? 0.8 : 1,
                  },
                  { cursor: 'pointer' }
                ]}
                onPress={() => handleSelectTenant(tenant)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                  {tenant.name} {tenant.role === 'admin' ? '👑 (Admin)' : ''}
                </Text>
                <Text style={{ color: tenant.role === 'admin' ? '#00E5FF' : '#AAAAAA', fontSize: 13 }}>
                  {tenant.role === 'admin' ? 'Fullständig åtkomst till fastigheter och ärenden via Momentum' : tenant.address}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
