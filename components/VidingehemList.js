import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Linking } from 'react-native';

// Exempeldata (Här kan du senare koppla på riktig data eller API)
const initialApartments = [
  { id: '1', address: 'Teleborgsvägen 12', rooms: '2 rum', size: '54 m²', rent: '6200 kr/mån', url: 'https://www.boplatsvaxjo.se' },
  { id: '2', address: 'Hovshagavägen 45', rooms: '3 rum', size: '72 m²', rent: '7800 kr/mån', url: 'https://www.boplatsvaxjo.se' },
  { id: '3', address: 'Österleden 8', rooms: '1 rum', size: '38 m²', rent: '4300 kr/mån', url: 'https://www.boplatsvaxjo.se' },
];

export default function VidingehemList() {
  const [search, setSearch] = useState('');
  const [apartments] = useState(initialApartments);

  const filteredApartments = apartments.filter(item => 
    item.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lediga Vidingehem-lägenheter</Text>
      
      {/* Sökfält */}
      <TextInput
        style={styles.input}
        placeholder="Sök på adress..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* Lista med lägenheter */}
      <FlatList
        data={filteredApartments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.info}>{item.rooms} • {item.size} • {item.rent}</Text>
              <Text style={styles.tag}>Vidingehem</Text>
            </View>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => Linking.openURL(item.url)}
            >
              <Text style={styles.buttonText}>Till Boplats</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  address: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 3,
  },
  tag: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#00E5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});