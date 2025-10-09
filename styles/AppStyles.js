import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screenContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  appHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: { position: 'absolute', left: 16 },
  appHeaderTitle: { fontSize: 18, fontWeight: '500' },
  scrollContent: { padding: 24, paddingBottom: 100 },

  // Empty State
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyStateIconContainer: { width: 96, height: 96, backgroundColor: '#7159c1', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyListIconContainer: { width: 64, height: 64, borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyStateTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  emptyStateSubtitle: { color: '#7f8c8d', textAlign: 'center', marginTop: 8 },

  // Summary
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  summaryCardPrimary: { backgroundColor: '#7159c1', borderColor: '#7159c1' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  summaryLabel: { fontSize: 14, color: 'white', opacity: 0.9 },

  // List Card
  listCard: { backgroundColor: '#fafafa', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#efefef', marginBottom: 16 },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  listCardTitle: { fontSize: 18, fontWeight: 'bold' },
  listCardDescription: { fontSize: 14, color: '#7f8c8d', marginTop: 4, marginBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#f0f0f0', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  dateText: { fontSize: 12, color: '#2c3e50', fontWeight: '500' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, color: '#7f8c8d' },
  progressPercentage: { fontSize: 12, color: '#2ecc71', fontWeight: 'bold' },
  progressBarBackground: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#2ecc71' },

  // List Screen
  itemListHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#2c3e50', marginTop: 16 },
  itemCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#efefef' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#e0e0e0', marginRight: 16, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: '#7159c1', borderColor: '#7159c1' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, color: '#2c3e50' },
  itemTitleCompleted: { textDecorationLine: 'line-through', color: '#7f8c8d' },

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, backgroundColor: '#7159c1', borderRadius: 32, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)' },
});