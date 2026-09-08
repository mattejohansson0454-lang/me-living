// ChatScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/appStyles';
import { callAI } from '../services/aiService';

export default function ChatScreen({ myTickets, setMyTickets }) {
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();

  const tenantProfile = {
    name: 'Mattias',
    property: '8832701',
    building: '50A',
    apartment: '1201',
    fullObject: '8832701-50A-1201',
    rooms: ['Kök', 'Badrum', 'Vardagsrum', 'Sovrum 1', 'Sovrum 2', 'Förråd', 'Hall']
  };

  const initialMessages = [
    { 
      role: 'assistant', 
      content: `Objekt\n✓ ${tenantProfile.fullObject}` 
    },
    {
      role: 'assistant',
      content: 'Utrymme',
      options: tenantProfile.rooms
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionCard, setActionCard] = useState(null);

  const parseAIResponse = (rawText) => {
    const match = rawText.match(/SVARSALTERNATIV:\s*(\[.*?\])/s);
    if (match) {
      try {
        const options = JSON.parse(match[1]);
        const cleanText = rawText.replace(/SVARSALTERNATIV:\s*\[.*?\]/s, '').trim();
        return { cleanText, options };
      } catch (e) {
        return { cleanText: rawText, options: [] };
      }
    }
    return { cleanText: rawText, options: [] };
  };

  const checkForTicketCompletion = (replyText, fullConversationText) => {
    if (replyText.includes('Status: Registrerat') || replyText.includes('Registrerat') || replyText.includes('Momentum')) {
      const combinedText = fullConversationText + '\n' + replyText;
      
      const newTicket = {
        id: 'R-' + Math.floor(1000 + Math.random() * 9000),
        object: tenantProfile.fullObject,
        room: extractField(combinedText, 'Utrymme') || 'Kök',
        component: extractField(combinedText, 'Utrustning / Komponent') || extractField(combinedText, 'Komponent') || extractField(combinedText, 'Feltyp') || 'Fastighet',
        description: extractField(combinedText, 'Beskrivning') || 'Inrapporterat fel',
        access: extractField(combinedText, 'Tillträde & Nyckel') || extractField(combinedText, 'Tillträde') || 'Enligt överenskommelse',
        pets: extractField(combinedText, 'Husdjur') || 'Inga',
        handler: extractField(combinedText, 'Ansvarig tekniker') || 'Fastighetsteamet Vidingehem',
        status: 'Aktiv',
        latestNote: 'Ärendet har registrerats i Momentum enligt Vidingehems avgränsningslista.'
      };

      if (setMyTickets) {
        setMyTickets(prev => [newTicket, ...(prev || [])]);
      }
      setActionCard(newTicket);
    }
  };

  const extractField = (text, fieldName) => {
    const regex = new RegExp(`(?:\\*\\*)?${fieldName}:(?:\\*\\*)?\\s*(.+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const startNewChat = () => {
    setMessages(initialMessages);
    setActionCard(null);
    setInput('');
    setImages([]);
    setLoading(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Du behöver ge tillgång till kameran för att kunna ta bilder.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (uri) => {
    setImages(images.filter(img => img !== uri));
  };

  const processUserResponse = async (userText) => {
    const cleanedMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const userMsg = { role: 'user', content: userText };
    const updatedMessages = [...cleanedMessages, userMsg];
     
    setMessages(updatedMessages);
    setInput('');
    setImages([]);
    setLoading(true);

    try {
      const aiReplyRaw = await callAI(updatedMessages, userText, tenantProfile);
      const { cleanText, options } = parseAIResponse(aiReplyRaw);
      
      setLoading(false);
      const newAssistantMsg = { 
        role: 'assistant', 
        content: cleanText,
        options: options.length > 0 ? options : null
      };
      setMessages([...updatedMessages, newAssistantMsg]);

      const allConversationText = updatedMessages.map(m => m.content).join('\n');
      checkForTicketCompletion(cleanText, allConversationText);
    } catch (error) {
      console.error('Fel vid AI-anrop:', error);
      setLoading(false);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Ett fel uppstod när jag skulle hämta information. Försök igen.' }]);
    }
  };

  const handleSend = () => {
    if (!input.trim() && images.length === 0) return;
    processUserResponse(input.trim());
  };

  const handleQuickReply = (optionText) => {
    processUserResponse(optionText);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#121212' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatSubHeader}>
        <View>
          <Text style={styles.chatSubHeaderTitle}>Vidingehem Felanmälan</Text>
          <View style={styles.onlineIndicatorRow}>
            <Text style={styles.onlineDot}>●</Text>
            <Text style={styles.onlineText}>Momentum Kopplad</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.newChatBtn} onPress={startNewChat}>
          <Text style={styles.newChatBtnText}>➕ Nytt ärende</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer} 
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => (
          <View key={idx}>
            <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={msg.role === 'user' ? styles.userText : styles.aiText}>{msg.content}</Text>
            </View>

            {msg.role === 'assistant' && msg.options && msg.options.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginVertical: 6 }}>
                {msg.options.map((opt, optIdx) => (
                  <TouchableOpacity 
                    key={optIdx} 
                    style={{ backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#00E5FF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, margin: 4 }}
                    onPress={() => handleQuickReply(opt)}
                  >
                    <Text style={{ color: '#00E5FF', fontSize: 13, fontWeight: '600' }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {actionCard && (
          <View style={styles.ticketCard}>
            <Text style={styles.ticketTitle}>📋 Registrerat ärende i Momentum:</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Objekt:</Text> {actionCard.object}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Ärende-ID:</Text> {actionCard.id}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Utrymme:</Text> {actionCard.room}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Feltyp:</Text> {actionCard.component}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Tillträde:</Text> {actionCard.access}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Husdjur:</Text> {actionCard.pets}</Text>
            <Text style={styles.ticketText}>• <Text style={{fontWeight:'bold'}}>Status:</Text> Skickat till {actionCard.handler}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="small" color="#00E5FF" style={{ marginVertical: 10 }} />}
      </ScrollView>

      {images.length > 0 && (
        <ScrollView horizontal style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1A1A1A' }}>
          {images.map((uri, i) => (
            <View key={i} style={{ marginRight: 8, position: 'relative' }}>
              <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8 }} />
              <TouchableOpacity 
                onPress={() => removeImage(uri)} 
                style={{ position: 'absolute', top: -6, right: -6, zIndex: 1, backgroundColor: '#FF5252', borderRadius: 10, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom + 8, 12), backgroundColor: '#121212' }]}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
            <Text style={{fontSize:20}}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]} onPress={pickImage}>
            <Text style={{fontSize:20}}>📁</Text>
          </TouchableOpacity>
          <TextInput 
            style={styles.textInput} 
            placeholder="Skriv svar eller beskriv problem..." 
            placeholderTextColor="#AAAAAA"
            value={input} 
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={{color:'#121212', fontWeight:'bold'}}>Skicka</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.meLivingFooter}>
          <View style={styles.meLivingContainer}>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.roofShape} />
              <Text style={styles.meText}>ME</Text>
            </View>
            <Text style={styles.livingText}>LIVING</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
