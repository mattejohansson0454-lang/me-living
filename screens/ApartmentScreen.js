import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Image, Linking, Alert, ActivityIndicator } from 'react-native';
import styles from '../styles/appStyles';
import { getAvailableApartments } from '../services/boplatsService';

export default function ApartmentScreen() {
  const [availableApartments, setAvailableApartments] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('Alla');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Alla');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAvailableApartments();
      setAvailableApartments(data || []);
    } catch (error) {
      console.log('Kunde inte hämta lägenheter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kombinera standardområden med dynamiska områden från datan så alla finns tillgängliga
  const areas = useMemo(() => {
    const defaultAreas = ['Alla', 'Öster', 'Braås', 'Teleborg / Campus', 'Teleborg', 'Centrum', 'Hov', 'Växjö'];
    const set = new Set(defaultAreas);
    availableApartments.forEach(apt => {
      if (apt.area) set.add(apt.area);
    });
    return Array.from(set);
  }, [availableApartments]);

  // Kombinera standardtyper med dynamiska typer från datan
  const types = useMemo(() => {
    const defaultTypes = ['Alla', '1 rum och kök', '2 rum och kök', '3 rum och kök', 'Studentetta med kokvrå'];
    const set = new Set(defaultTypes);
    availableApartments.forEach(apt => {
      if (apt.type) set.add(apt.type);
    });
    return Array.from(set);
  }, [availableApartments]);

  const filteredApartments = useMemo(() => {
    return availableApartments.filter(apt => {
      const matchesSearch = 
        (apt.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.area || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesArea = 
        selectedAreaFilter === 'Alla' || 
        (apt.area && apt.area.toLowerCase() === selectedAreaFilter.toLowerCase()) ||
        (!apt.area && selectedAreaFilter === 'Växjö');

      const matchesType = selectedTypeFilter === 'Alla' || (() => {
        const typeStr = (apt.type || '').toLowerCase();
        const filterStr = selectedTypeFilter.toLowerCase();
        
        if (typeStr.includes(filterStr)) return true;

        if (filterStr.includes('1 rum') && (typeStr.includes('1 rok') || typeStr.includes('1 rum') || typeStr === '1')) return true;
        if (filterStr.includes('2 rum') && (typeStr.includes('2 rok') || typeStr.includes('2 rum') || typeStr === '2')) return true;
        if (filterStr.includes('3 rum') && (typeStr.includes('3 rok') || typeStr.includes('3 rum') || typeStr === '3')) return true;
        if (filterStr.includes('student') && (typeStr.includes('student') || typeStr.includes('kokvrå'))) return true;

        return false;
      })();

      return matchesSearch && matchesArea && matchesType;
    });
  }, [availableApartments, searchQuery, selectedAreaFilter, selectedTypeFilter]);

  const openBoplatsExternal = (url, address) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Kunde inte öppna länk', `Besök boplats.vaxjo.se direkt för att ansöka om ${address}.`);
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={{ color: '#AAA', marginTop: 10 }}>Hämtar lediga lägenheter...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>🔍 Lediga Lägenheter (Boplats)</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Sök område, gata eller beskrivning..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingRight: 16 }}>
          {areas.map(area => (
            <TouchableOpacity
              key={area}
              style={[styles.filterChip, selectedAreaFilter === area && styles.activeFilterChip]}
              onPress={() => setSelectedAreaFilter(area)}
            >
              <Text style={[styles.filterChipText, selectedAreaFilter === area && styles.activeFilterChipText]}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingRight: 16 }}>
          {types.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedTypeFilter === type && styles.activeFilterChip]}
              onPress={() => setSelectedTypeFilter(type)}
            >
              <Text style={[styles.filterChipText, selectedTypeFilter === type && styles.activeFilterChipText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filteredApartments.length === 0 ? (
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>Inga lägenheter matchade din sökning.</Text>
      ) : (
        filteredApartments.map((apt, index) => {
          const imageSource = apt.imageUrl && apt.imageUrl.trim() !== '' 
            ? { uri: apt.imageUrl } 
            : { uri: 'https://images.unsplash.com/photo-1502672260266-1clef2d93688?w=600&auto=format&fit=crop&q=80' };

          return (
            <View key={apt.id || index} style={styles.aptCard}>
              {/* Explicit höjd och bredd tillagd direkt så att bilden inte kollapsar */}
              <Image source={imageSource} style={[styles.aptImage, { height: 160, width: '100%' }]} />
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 13 }}>{apt.area || 'Växjö'}</Text>
                  <Text style={{ color: '#AAA', fontSize: 12 }}>Sista anmälan: {apt.sistaAnmalan || 'Ej angivet'}</Text>
                </View>
                <Text style={styles.aptAddress}>{apt.address || 'Adress saknas'}</Text>
                <Text style={{ color: '#FFF', fontSize: 13, marginTop: 2 }}>
                  {apt.type || 'Boende'} • {apt.size || '72 kvm'} • <Text style={{ fontWeight: 'bold', color: '#4CD964' }}>{apt.rent || '7 420 kr'}</Text>
                </Text>
                <Text style={{ color: '#BBB', fontSize: 12, marginTop: 4 }} numberOfLines={2}>{apt.description || 'Ingen beskrivning tillgänglig.'}</Text>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => openBoplatsExternal(apt.boplatsUrl, apt.address)}
                >
                  <Text style={styles.applyButtonText}>Ansök via Boplats Växjö ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}