import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import styles from '../styles/appStyles';

export default function TicketScreen({ myTickets = [], onUpdateTicket }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedTimeline = [
      ...(selectedTicket.timeline || []),
      {
        id: Date.now(),
        sender: 'Hyresgäst',
        text: newComment,
        date: new Date().toLocaleDateString('sv-SE')
      }
    ];

    const updatedTicket = { ...selectedTicket, timeline: updatedTimeline };
    setSelectedTicket(updatedTicket);
    if (onUpdateTicket) onUpdateTicket(updatedTicket);
    setNewComment('');
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Mina Ärenden (Momentum)</Text>
      
      {myTickets.map(item => (
        <TouchableOpacity 
          key={item.id} 
          onPress={() => setSelectedTicket(item)}
          style={{ backgroundColor: '#1e1e1e', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 14 }}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.category} ({item.room})</Text>
          <Text style={{ color: '#AAA', fontSize: 12, margin: 2 }}>Åtgärdskod: <Text style={{ color: '#FFF' }}>{item.actionCode}</Text></Text>
          {item.prioText && <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{item.prioText}</Text>}
          <Text style={styles.cardSub}>{item.description}</Text>

          <View style={{ borderTopWidth: 1, borderColor: '#333', marginTop: 12, paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Handläggare: <Text style={{ color: '#FFF' }}>{item.handler}</Text></Text>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Registrerad: <Text style={{ color: '#FFF' }}>{item.registeredDate}</Text></Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Detalj- och kommentarsvy i en Modal */}
      <Modal visible={!!selectedTicket} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: '#1e1e1e', borderRadius: 16, padding: 16, maxHeight: '85%', borderWidth: 1, borderColor: '#333' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 16 }}>Ärende #{selectedTicket?.id}</Text>
              <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginBottom: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{selectedTicket?.category} - {selectedTicket?.room}</Text>
              <Text style={{ color: '#AAA', fontSize: 13, marginTop: 4 }}>{selectedTicket?.description}</Text>

              {/* Tidslinje för kompletteringar */}
              {selectedTicket?.timeline?.map((t, idx) => (
                <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ color: '#00E5FF', fontSize: 11 }}>{t.sender} ({t.date})</Text>
                  <Text style={{ color: '#FFF', fontSize: 13, marginTop: 2 }}>{t.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Inmatning för ny kommentar */}
            <TextInput
              style={{ backgroundColor: '#111', color: '#FFF', padding: 10, borderRadius: 8, height: 60, marginBottom: 8, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333' }}
              placeholder="Skriv komplettering eller kommentar..."
              placeholderTextColor="#666"
              multiline={true}
              value={newComment}
              onChangeText={setNewComment}
            />

            <TouchableOpacity 
              onPress={handleAddComment}
              style={{ backgroundColor: '#00E5FF', padding: 12, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#000', fontWeight: 'bold' }}>Skicka komplettering</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
