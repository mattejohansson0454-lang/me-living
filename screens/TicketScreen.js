import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from '../styles/appStyles';

export default function TicketScreen({ myTickets }) {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>📋 Mina Ärenden (Momentum)</Text>
      {myTickets.map(item => (
        <View key={item.id} style={styles.ticketCardFull}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 14 }}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.category} ({item.room})</Text>
          <Text style={{ color: '#AAA', fontSize: 12, marginTop: 2 }}>Åtgärdskod: <Text style={{ color: '#FFF' }}>{item.actionCode}</Text></Text>
          {item.prioText && <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{item.prioText}</Text>}
          <Text style={styles.cardSub}>{item.description}</Text>

          <View style={{ borderTopWidth: 1, borderColor: '#333', marginTop: 12, paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Handläggare: <Text style={{ color: '#FFF' }}>{item.handler}</Text></Text>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Registrerad: <Text style={{ color: '#FFF' }}>{item.registeredDate}</Text></Text>
            </View>
          </View>
        </View>
      ))}
      <View style={styles.meLivingFooterSection}>
        <View style={styles.meLivingContainer}>
          <View style={styles.roofShape} />
          <Text style={styles.meText}>ME</Text>
          <Text style={styles.livingText}>LIVING</Text>
        </View>
      </View>
    </ScrollView>
  );
}