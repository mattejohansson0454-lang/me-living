import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/appStyles';

export default function InvoiceScreen({ invoices, payInvoice }) {
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>💳 Mina Fakturor</Text>
      {invoices.map(inv => (
        <View key={inv.id} style={styles.invoiceCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>{inv.period}</Text>
            <View style={[styles.statusBadge, { backgroundColor: inv.isPaid ? '#4CD964' : '#FF9500' }]}>
              <Text style={styles.statusBadgeText}>{inv.status}</Text>
            </View>
          </View>
          
          <Text style={{ color: '#00E5FF', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>{inv.amount}</Text>
          <Text style={{ color: '#AAA', fontSize: 12, marginTop: 2 }}>Förfallodag: {inv.dueDate}</Text>
          <Text style={{ color: '#AAA', fontSize: 12 }}>OCR-nummer: <Text style={{ color: '#FFF' }}>{inv.ocr}</Text></Text>

          {!inv.isPaid && (
            <TouchableOpacity style={styles.payButton} onPress={() => payInvoice(inv.id)}>
              <Text style={styles.payButtonText}>Betala direkt med BankID</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}