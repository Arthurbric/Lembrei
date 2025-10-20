import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { List, Plus, ArrowLeft, Trash2, Check, Calendar as CalendarIcon,
         BellOff, Clock, MapPin, } from 'lucide-react-native';


import { styles } from '../styles/AppStyles';
import DeleteConfirmModal from '../components/ConfirmModal';
import CreateListModal from '../components/CreateListModal';
import AddItemModal from '../components/AddItemModal';

import { loadLists, saveLists } from '../helpers/storage';
import {
  createList,
  addItemToList,
  toggleItem as toggleItemHelper,
  removeList as removeListHelper,
  removeItem as removeItemHelper,
} from '../helpers/lists';

// --- COMPONENT PRINCIPAL DA APLICAÇÃO ---
export default function App() {
  const insets = useSafeAreaInsets();

  // --- ESTADO DA APLICAÇÃO ---
  const [lists, setLists] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentListId, setCurrentListId] = useState(null);

  // Modais
  const [isCreateListModalVisible, setCreateListModalVisible] = useState(false);
  const [isAddItemModalVisible, setAddItemModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  // Form states
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newItemName, setNewItemName] = useState('');

  // Aux
  const [listToDelete, setListToDelete] = useState(null);

  // --- PERSISTÊNCIA DE DADOS ---
  useEffect(() => {
    loadLists().then(setLists);
  }, []);

  useEffect(() => {
    saveLists(lists);
  }, [lists]);

  // --- FUNÇÕES DE LÓGICA ---
  const handleCreateList = (newList) => {
    console.log('📥 Recebendo lista pronta do modal:', newList);
    setLists((prev) => [...prev, newList]);
    setCreateListModalVisible(false);
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !currentListId) return;
    setLists((prev) => addItemToList(prev, currentListId, newItemName));
    setNewItemName('');
    setAddItemModalVisible(false);
  };

  const handleToggleItem = (itemId) => {
    if (!currentListId) return;
    setLists((prev) => toggleItemHelper(prev, currentListId, itemId));
  };

  const handleDeleteList = (listId) => {
    setListToDelete(listId);
    setDeleteModalVisible(true);
  };

  const confirmDeleteList = () => {
    setLists((prev) => removeListHelper(prev, listToDelete));
    setDeleteModalVisible(false);
  };

  const handleDeleteItem = (itemId) => {
    if (!currentListId) return;
    setLists((prev) => removeItemHelper(prev, currentListId, itemId));
  };

  const navigateToList = (listId) => {
    setCurrentListId(listId);
    setCurrentScreen('list');
  };

  const navigateToHome = () => {
    setCurrentListId(null);
    setCurrentScreen('home');
  };

  const handleCloseCreateListModal = () => {
    setNewListName('');
    setNewListDescription('');
    setCreateListModalVisible(false);
  };

  const getNotificationMeta = (notification) => {
    const type = notification?.type || 'none';
    switch (type) {
      case 'time':
        return { icon: Clock, label: 'Notificação por horário' };
      case 'location':
        return { icon: MapPin, label: 'Notificação por localização' };
      default:
        return { icon: BellOff, label: 'Sem notificação' };
    }
  };
  

  // --- RENDERIZAÇÃO DOS COMPONENTES ---
  const renderHomeScreen = () => (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator
      >
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
                <Text style={[styles.summaryValue, { color: '#2c3e50' }]}>
                  {lists.reduce((acc, list) => acc + list.items.length, 0)}
                </Text>
                <Text style={[styles.summaryLabel, { color: '#AAAAAA' }]}>
                  Total de itens
                </Text>
              </View>
            </View>

            {lists.map((list) => {
              const completedCount = list.items.filter((i) => i.completed).length;
              const progress =
                list.items.length > 0
                  ? (completedCount / list.items.length) * 100
                  : 0;

              return (
                <Pressable
                  key={list.id}
                  onPress={() => navigateToList(list.id)}
                  style={({ pressed }) => [styles.listCard, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.listCardHeader}>
                    <Text style={styles.listCardTitle}>{list.title}</Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id);
                      }}
                    >
                      <Trash2 size={20} color="#e74c3c" />
                    </Pressable>
                  </View>

                  {list.description ? (
                    <Text style={styles.listCardDescription}>{list.description}</Text>
                  ) : null}

                  {(() => {
                    const { icon: Icon, label } = getNotificationMeta(list.notification);
                    return (
                      <View
                        style={[
                          styles.dateContainer,
                          { backgroundColor: '#f5f3ff', marginTop: 4, alignSelf: 'flex-start' }
                        ]}
                      >
                        <Icon size={14} color="#7159c1" />
                        <Text style={[styles.dateText, { color: '#4c3ebf', fontWeight: '600' }]}>
                          {label}
                        </Text>
                      </View>
                    );
                  })()}

                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {completedCount} de {list.items.length} itens
                    </Text>
                    <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                  </View>

                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>

                  <View style={styles.dateContainer}>
                    <CalendarIcon size={14} color="#7f8c8d" />
                    <Text style={styles.dateText}>{list.createdAt}</Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setCreateListModalVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 24 },
          pressed && { backgroundColor: '#5a43a1' },
        ]}
      >
        <Plus size={32} color="white" />
      </Pressable>
    </View>
  );

  const renderListScreen = () => {
    const list = lists.find((l) => l.id === currentListId);
    if (!list) return null;

    const completedItems = list.items.filter((i) => i.completed);
    const pendingItems = list.items.filter((i) => !i.completed);

    return (
      <View style={styles.screenContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {list.items.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyListIconContainer}>
                <Plus size={28} color="#7f8c8d" />
              </View>
              <Text style={styles.emptyStateTitle}>Lista Vazia</Text>
              <Text style={styles.emptyStateSubtitle}>Adicione itens para começar</Text>
            </View>
          ) : (
            <>
              {pendingItems.length > 0 && (
                <Text style={styles.itemListHeader}>Pendentes ({pendingItems.length})</Text>
              )}
              {pendingItems.map((item) => renderItem(item))}

              {completedItems.length > 0 && (
                <Text style={styles.itemListHeader}>Concluídos ({completedItems.length})</Text>
              )}
              {completedItems.map((item) => renderItem(item))}
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={() => setAddItemModalVisible(true)}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 24 },
            pressed && { backgroundColor: '#5a43a1' },
          ]}
        >
          <Plus size={32} color="white" />
        </Pressable>
      </View>
    );
  };

  const renderItem = (item) => (
    <View key={item.id} style={styles.itemCard}>
      <Pressable
        onPress={() => handleToggleItem(item.id)}
        style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
      >
        {item.completed && <Check size={16} color="white" />}
      </Pressable>

      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>
          {item.name}
        </Text>
      </View>

      <Pressable onPress={() => handleDeleteItem(item.id)}>
        <Trash2 size={20} color="#e74c3c" />
      </Pressable>
    </View>
  );

  const currentList = lists.find((l) => l.id === currentListId);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

      {/* MODAL: Criar Lista */}
      <CreateListModal
        visible={isCreateListModalVisible}
        onCancel={handleCloseCreateListModal}
        onConfirm={handleCreateList}
        newListName={newListName}
        setNewListName={setNewListName}
        newListDescription={newListDescription}
        setNewListDescription={setNewListDescription}
      />


      {/* MODAL: Adicionar Item */}
      <AddItemModal
        visible={isAddItemModalVisible}
        onCancel={() => setAddItemModalVisible(false)}
        onConfirm={handleAddItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
      />

      {/* MODAL: Confirmar Exclusão */}
      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeleteList}
      />
    </SafeAreaView>
  );
}