import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/appStyles';

export default function AddonScreen({ addons, toggleAddon }) {
  const renderItem = ({ item: addon }) => (
    <View style={styles.addonCard}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{addon.title}</Text>
        <Text style={{ color: '#00E5FF', fontSize: 13, marginTop: 2 }}>{addon.price}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.addonToggleBtn, addon.ordered && styles.addonToggleBtnActive]}
        onPress={() => toggleAddon(addon.id)}
        accessibilityRole="button"
        accessibilityState={{ checked: addon.ordered }}
        accessibilityLabel={`${addon.title}, pris ${addon.price}, ${addon.ordered ? 'Beställd' : 'Ej beställd'}`}
      >
        <Text style={[styles.addonToggleText, addon.ordered && styles.addonToggleTextActive]}>
          {addon.ordered ? '✓ Beställd' : 'Beställ'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={addons}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle}>🚪 Lägenhetstillval</Text>
          <Text style={{ color: '#AAA', fontSize: 13, marginBottom: 12 }}>
            Förbättra din standard med Vidingehems godkända tillval.
          </Text>
        </>
      }
    />
  );
}