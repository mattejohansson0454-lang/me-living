import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import styles from '../styles/appStyles';

export default function HousingScreen() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  const getDayKey = (day) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const [bookings, setBookings] = useState({
    '2026-09-08': ['14:00 - 17:00'],
    '2026-09-09': ['07:00 - 10:00'],
    '2026-09-12': ['16:00 - 19:00']
  });

  const [myBookedSlots, setMyBookedSlots] = useState([
    { dateKey: '2026-09-08', dayStr: 'Tis 8 Sep', time: '14:00 - 17:00', room: 'Tvättstuga B' }
  ]);

  const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const timeSlots = ['07:00 - 10:00', '10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00', '19:00 - 22:00'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToggleSlot = (slot) => {
    const dateKey = getDayKey(selectedDay);
    const dayStr = `${selectedDay} ${monthNames[currentMonth].substring(0, 3)}`;
    const isMySlot = myBookedSlots.some(b => b.dateKey === dateKey && b.time === slot);
    const isOccupied = (bookings[dateKey] || []).includes(slot) && !isMySlot;

    if (isOccupied) {
      Alert.alert('Upptaget', 'Detta pass är redan bokat av en annan boende.');
      return;
    }

    if (isMySlot) {
      setMyBookedSlots(myBookedSlots.filter(b => !(b.dateKey === dateKey && b.time === slot)));
      setBookings({
        ...bookings,
        [dateKey]: (bookings[dateKey] || []).filter(s => s !== slot)
      });
      Alert.alert('Avbokad', `Bokningen för ${dayStr} kl ${slot} har avbokats.`);
    } else {
      if (myBookedSlots.length >= 3) {
        Alert.alert('Bokningsgräns', 'Du kan max ha 3 aktiva tvättstugebokningar samtidigt.');
        return;
      }
      setMyBookedSlots([...myBookedSlots, { dateKey, dayStr, time: slot, room: 'Tvättstuga B' }]);
      setBookings({
        ...bookings,
        [dateKey]: [...(bookings[dateKey] || []), slot]
      });
      Alert.alert('Bekräftelse', `Du har bokat Tvättstuga B den ${selectedDay} ${monthNames[currentMonth]} kl ${slot}.`);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>🏠 Mitt Boende</Text>
      <Text style={{ color: '#AAA', marginBottom: 12 }}>PG Vejdes väg 7, lgh 1011 (3 ROK, 72 kvm)</Text>
       
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxHeader}>🧺 Mina Tvättbokningar</Text>
        {myBookedSlots.length === 0 ? (
          <Text style={{ color: '#888', marginTop: 6, fontStyle: 'italic' }}>Inga aktiva bokningar.</Text>
        ) : (
          myBookedSlots.map((b, idx) => (
            <View key={idx} style={styles.myBookingItem}>
              <View>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{b.dayStr} ({b.room})</Text>
                <Text style={{ color: '#00E5FF', fontSize: 12 }}>Kl {b.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setSelectedDay(parseInt(b.dateKey.split('-')[2]));
                  handleToggleSlot(b.time);
                }}
              >
                <Text style={styles.cancelBtnText}>Avboka</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxHeader}>📅 Boka tid i Tvättstuga B</Text>
         
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
            <Text style={styles.monthNavText}>◄</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
            <Text style={styles.monthNavText}>►</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateKey = getDayKey(day);
              const isSelected = day === selectedDay;
              const hasMyBooking = myBookedSlots.some(b => b.dateKey === dateKey);
              const hasAnyBooking = (bookings[dateKey] || []).length > 0;

              return (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayBox, isSelected && styles.selectedDayBox, hasMyBooking && styles.myBookingDayBox]} 
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayNumber, isSelected && styles.selectedDayText]}>{day}</Text>
                  <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
                    {['Sön','Mån','Tis','Ons','Tor','Fre','Lör'][(new Date(currentYear, currentMonth, day)).getDay()]}
                  </Text>
                  {hasAnyBooking && <View style={[styles.dotIndicator, hasMyBooking && { backgroundColor: '#00E5FF' }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <Text style={{ color: '#FFF', fontWeight: 'bold', marginTop: 6, marginBottom: 8 }}>
          Pass för {selectedDay} {monthNames[currentMonth]}:
        </Text>

        <View style={{ gap: 6 }}>
          {timeSlots.map(slot => {
            const dateKey = getDayKey(selectedDay);
            const isMySlot = myBookedSlots.some(b => b.dateKey === dateKey && b.time === slot);
            const isOccupied = (bookings[dateKey] || []).includes(slot) && !isMySlot;

            return (
              <TouchableOpacity 
                key={slot} 
                style={[styles.slotCard, isMySlot && styles.slotCardMyBooking, isOccupied && styles.slotCardOccupied]}
                onPress={() => handleToggleSlot(slot)}
              >
                <Text style={[styles.slotTimeText, isMySlot && { color: '#121212', fontWeight: 'bold' }]}>{slot}</Text>
                <Text style={[styles.slotStatusText, isMySlot && { color: '#121212', fontWeight: 'bold' }]}>
                  {isMySlot ? '✓ Din bokning' : isOccupied ? '❌ Upptaget' : '➕ Ledigt'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}