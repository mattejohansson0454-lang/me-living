import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from '../styles/appStyles';

export default function NotificationScreen({ notifications }) {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>🔔 Notiser & Meddelanden</Text>
      {notifications.map(notif => (
        <View key={notif.id} style={styles.notificationCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#00E5FF', fontWeight: 'bold' }}>{notif.title}</Text>
            <Text style={{ color: '#777', fontSize: 11 }}>{notif.date}</Text>
          </View>
          <Text style={{ color: '#DDD', fontSize: 13, marginTop: 4 }}>{notif.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}