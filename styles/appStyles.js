// styles/appStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center'
  },
  vidingehemLogoImage: {
    width: 160,
    height: 36,
  },
  tabGridContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#161616',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  gridTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40
  },
  subGridTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeGridTab: {
    backgroundColor: '#00E5FF',
  },
  inactiveGridTab: {
    backgroundColor: '#252525',
  },
  gridTabText: {
    color: '#CCC',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center'
  },
  activeGridTabText: {
    color: '#121212',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  chatSubHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatSubHeaderTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold'
  },
  onlineIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  onlineDot: {
    color: '#4CD964',
    fontSize: 10,
    marginRight: 4
  },
  onlineText: {
    color: '#4CD964',
    fontSize: 11,
    fontWeight: '600'
  },
  newChatBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  newChatBtnText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#00E5FF',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#252525',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
  },
  userText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '500'
  },
  aiText: {
    color: '#FFF',
    fontSize: 14,
  },
  ticketCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#00E5FF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  ticketTitle: {
    color: '#00E5FF',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 13
  },
  ticketText: {
    color: '#DDD',
    fontSize: 12,
    marginTop: 2
  },
  inputWrapper: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  meLivingFooter: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 2
  },
  meLivingFooterSection: {
    alignItems: 'center',
    marginVertical: 24
  },
  meLivingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative'
  },
  roofShape: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00E5FF'
  },
  meText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1
  },
  livingText: {
    color: '#00E5FF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
    marginLeft: 3
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  ticketCardFull: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 11
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8
  },
  cardSub: {
    color: '#DDD',
    fontSize: 13,
    marginTop: 6
  },
  infoBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  infoBoxHeader: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  myBookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 10,
    borderRadius: 8,
    marginTop: 6
  },
  cancelBtn: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  cancelBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },
  monthNavBtn: {
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 6
  },
  monthNavText: {
    color: '#00E5FF',
    fontWeight: 'bold',
    fontSize: 14
  },
  monthTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  dayBox: {
    width: 44,
    height: 60,
    backgroundColor: '#252525',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  selectedDayBox: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF'
  },
  myBookingDayBox: {
    borderColor: '#00E5FF',
    borderWidth: 2
  },
  dayNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  dayName: {
    color: '#AAA',
    fontSize: 11,
    marginTop: 2
  },
  selectedDayText: {
    color: '#121212',
  },
  dotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF5252',
    marginTop: 4
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  slotCardMyBooking: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF'
  },
  slotCardOccupied: {
    backgroundColor: '#1C1C1C',
    borderColor: '#2A2A2A',
    opacity: 0.6
  },
  slotTimeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13
  },
  slotStatusText: {
    color: '#AAA',
    fontSize: 12
  },
  searchBar: {
    backgroundColor: '#1A1A1A',
    color: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
    fontSize: 14
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#333'
  },
  activeFilterChip: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF'
  },
  filterChipText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600'
  },
  activeFilterChipText: {
    color: '#121212',
    fontWeight: 'bold'
  },
  aptCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  aptImage: {
    width: '100%',
    height: 140,
  },
  aptAddress: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4
  },
  applyButton: {
    backgroundColor: '#252525',
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444'
  },
  applyButtonText: {
    color: '#00E5FF',
    fontWeight: 'bold',
    fontSize: 13
  },
  invoiceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  payButton: {
    backgroundColor: '#00E5FF',
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  payButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 13
  },
  addonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  addonToggleBtn: {
    backgroundColor: '#252525',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444'
  },
  addonToggleBtnActive: {
    backgroundColor: '#4CD964',
    borderColor: '#4CD964'
  },
  addonToggleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  addonToggleTextActive: {
    color: '#121212'
  },
  notificationCard: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  }
});