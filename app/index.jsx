import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  List,
  Plus,
  ArrowLeft,
  Trash2,
  Check,
  X, // Using X for the close button
} from 'lucide-react-native';

// --- COMPONENT PRINCIPAL DA APLICAÇÃO ---
export default function App() {
  // --- ESTADO DA APLICAÇÃO ---
  const [lists, setLists] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentListId, setCurrentListId] = useState(null);
  const [isCreateListModalVisible, setCreateListModalVisible] = useState(false);
  const [isAddItemModalVisible, setAddItemModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  // --- PERSISTÊNCIA DE DADOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@GeoRemindData');
        if (savedData !== null) {
          setLists(JSON.parse(savedData));
        }
      } catch (e) {
        console.error('Failed to load data.', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@GeoRemindData', JSON.stringify(lists));
      } catch (e) {
        console.error('Failed to save data.', e);
      }
    };
    saveData();
  }, [lists]);

  // --- FUNÇÕES DE LÓGICA ---
  const handleCreateList = () => {
    if (!newListName.trim()) {
      Alert.alert('Erro', 'O título da lista não pode ser vazio.');
      return;
    }
    const newList = {
      id: `list-${Date.now()}`,
      title: newListName,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      items: [],
    };
    setLists((prevLists) => [...prevLists, newList]);
    setNewListName('');
    setCreateListModalVisible(false);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Erro', 'O nome do item não pode ser vazio.');
      return;
    }
    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      quantity: 1,
      completed: false,
    };
    const updatedLists = lists.map((list) =>
      list.id === currentListId
        ? { ...list, items: [...list.items, newItem] }
        : list
    );
    setLists(updatedLists);
    setNewItemName('');
    setAddItemModalVisible(false);
  };

  const handleToggleItem = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const handleDeleteList = (listId) => {
    Alert.alert(
      'Apagar Lista',
      'Tem certeza que quer apagar esta lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () =>
            setLists((prevLists) => prevLists.filter((list) => list.id !== listId)),
        },
      ]
    );
  };

  const handleDeleteItem = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        return { ...list, items: list.items.filter((item) => item.id !== itemId) };
      }
      return list;
    });
    setLists(updatedLists);
  };
  
  const navigateToList = (listId) => {
    setCurrentListId(listId);
    setCurrentScreen('list');
  };

  const navigateToHome = () => {
    setCurrentListId(null);
    setCurrentScreen('home');
  };

  // --- RENDERIZAÇÃO DOS COMPONENTES ---

  const renderHomeScreen = () => (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {lists.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <List size={40} color="white" />
            </View>
            <Text style={styles.emptyStateTitle}>Bem-vindo ao GeoRemind!</Text>
            <Text style={styles.emptyStateSubtitle}>
              Crie sua primeira lista clicando no botão '+' abaixo.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
                <Text style={styles.summaryValue}>{lists.length}</Text>
                <Text style={styles.summaryLabel}>Listas criadas</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: '#2c3e50' }]}>{lists.reduce((acc, list) => acc + list.items.length, 0)}</Text>
                <Text style={styles.summaryLabel}>Total de itens</Text>
              </View>
            </View>
            {lists.map(list => {
              const completedCount = list.items.filter(i => i.completed).length;
              const progress = list.items.length > 0 ? (completedCount / list.items.length) * 100 : 0;
              return (
                <Pressable key={list.id} onPress={() => navigateToList(list.id)} style={({ pressed }) => [styles.listCard, pressed && { opacity: 0.7 }]}>
                  <View style={styles.listCardHeader}>
                    <Text style={styles.listCardTitle}>{list.title}</Text>
                    <Pressable onPress={() => handleDeleteList(list.id)}><Trash2 size={20} color="#e74c3c" /></Pressable>
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>{completedCount} de {list.items.length} itens</Text>
                    <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${progress}%` }]}></View></View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
      <Pressable onPress={() => setCreateListModalVisible(true)} style={({ pressed }) => [styles.fab, pressed && { backgroundColor: '#5a43a1' }]}>
        <Plus size={32} color="white" />
      </Pressable>
    </View>
  );

  const renderListScreen = () => {
    const list = lists.find(l => l.id === currentListId);
    if (!list) return null;

    const completedItems = list.items.filter(i => i.completed);
    const pendingItems = list.items.filter(i => !i.completed);
    
    return(
      <View style={styles.screenContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {list.items.length === 0 ? (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyListIconContainer}><Plus size={28} color="#7f8c8d"/></View>
                <Text style={styles.emptyStateTitle}>Lista Vazia</Text>
                <Text style={styles.emptyStateSubtitle}>Adicione itens para começar</Text>
            </View>
          ) : (
            <>
              {pendingItems.length > 0 && <Text style={styles.itemListHeader}>Pendentes ({pendingItems.length})</Text>}
              {pendingItems.map(item => renderItem(item))}
              {completedItems.length > 0 && <Text style={styles.itemListHeader}>Concluídos ({completedItems.length})</Text>}
              {completedItems.map(item => renderItem(item))}
            </>
          )}
        </ScrollView>
        <Pressable onPress={() => setAddItemModalVisible(true)} style={({ pressed }) => [styles.fab, pressed && { backgroundColor: '#5a43a1' }]}>
          <Plus size={32} color="white" />
        </Pressable>
      </View>
    );
  };
  
  const renderItem = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <Pressable onPress={() => handleToggleItem(item.id)} style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
        {item.completed && <Check size={16} color="white" />}
      </Pressable>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>{item.name}</Text>
      </View>
      <Pressable onPress={() => handleDeleteItem(item.id)}><Trash2 size={20} color="#e74c3c" /></Pressable>
    </View>
  );

  const currentList = lists.find(l => l.id === currentListId);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appHeader}>
        {currentScreen === 'list' && (
          <Pressable onPress={navigateToHome} style={styles.backButton}>
            <ArrowLeft size={24} color="#2c3e50" />
          </Pressable>
        )}
        <Text style={styles.appHeaderTitle}>
          {currentScreen === 'home' ? 'Minhas Listas' : currentList?.title}
        </Text>
      </View>
      
      {currentScreen === 'home' ? renderHomeScreen() : renderListScreen()}

      {/* MODAL DE CRIAR LISTA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateListModalVisible}
        onRequestClose={() => setCreateListModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Nova Lista</Text>
              <Pressable onPress={() => setCreateListModalVisible(false)}><X size={24} color="#7f8c8d" /></Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.formLabel}>Título</Text>
              <TextInput value={newListName} onChangeText={setNewListName} placeholder="Ex: Supermercado da semana" style={styles.formInput} />
            </View>
            <View style={styles.modalFooter}>
              <Pressable onPress={() => setCreateListModalVisible(false)} style={[styles.button, styles.buttonSecondary]}><Text style={styles.buttonSecondaryText}>Cancelar</Text></Pressable>
              <Pressable onPress={handleCreateList} style={styles.button}><Text style={styles.buttonText}>Criar Lista</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE ADICIONAR ITEM */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddItemModalVisible}
        onRequestClose={() => setAddItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar Item</Text>
                <Pressable onPress={() => setAddItemModalVisible(false)}><X size={24} color="#7f8c8d" /></Pressable>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.formLabel}>Nome do Item</Text>
                <TextInput value={newItemName} onChangeText={setNewItemName} placeholder="Ex: Leite" style={styles.formInput} />
              </View>
              <View style={styles.modalFooter}>
                <Pressable onPress={() => setAddItemModalVisible(false)} style={[styles.button, styles.buttonSecondary]}><Text style={styles.buttonSecondaryText}>Cancelar</Text></Pressable>
                <Pressable onPress={handleAddItem} style={styles.button}><Text style={styles.buttonText}>Adicionar</Text></Pressable>
              </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- FOLHA DE ESTILOS ---
const styles = StyleSheet.create({
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
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, backgroundColor: '#7159c1', borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 20 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  
  // Form
  formLabel: { fontWeight: '500', marginBottom: 10, fontSize: 16 },
  formInput: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#7159c1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  buttonSecondary: { backgroundColor: '#ecf0f1' },
  buttonSecondaryText: { color: '#2c3e50', fontWeight: '500' }
});