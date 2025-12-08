import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Appearance,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { List, Plus, ArrowLeft, Trash2, Check, Calendar as CalendarIcon,
         BellOff, Clock, MapPin, Edit3, Sun, Moon, Map } from 'lucide-react-native';

import { styles } from '../styles/AppStyles';
import DeleteConfirmModal from '../components/ConfirmModal';
import CreateListModal from '../components/CreateListModal';
import AddItemModal from '../components/AddItemModal';
import AllLocationsMapModal from '../components/AllLocationsMapModal';


import { loadLists, saveLists } from '../helpers/storage';
import {
  createList,
  addItemToList,
  toggleItem as toggleItemHelper,
  removeList as removeListHelper,
  removeItem as removeItemHelper,
  updateList,
} from '../helpers/lists';

import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  const [isEditItemModalVisible, setEditItemModalVisible] = useState(false);
  const [isEditListModalVisible, setEditListModalVisible] = useState(false);
  const [isMapAllVisible, setMapAllVisible] = useState(false);

  // Form states
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [itemToEdit, setItemToEdit] = useState(null);
  const [listToEdit, setListToEdit] = useState(null);
  const [editedListName, setEditedListName] = useState('');
  const [editedListDescription, setEditedListDescription] = useState('');

  // Aux
  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    async function setupChannel() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7159c1',
        });
      }
    }

    setupChannel();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Permissão de notificações:", status);
    })();
  }, []);

  // --- PERSISTÊNCIA DE DADOS ---
  useEffect(() => {
    loadLists().then(setLists);
  }, []);

  useEffect(() => {
    saveLists(lists);
  }, [lists]);

  // tema: persistência e respeito ao sistema
  const THEME_KEY = '@LimbreiThemePref'; // 'auto' | 'light' | 'dark'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  const [themePref, setThemePref] = useState('auto');
  // derived
  const isDarkMode = themePref === 'auto' ? systemScheme === 'dark' : themePref === 'dark';

  // não usamos LayoutAnimation para evitar flick; usamos Animated para transições de cor
  useEffect(() => {
    // placeholder para possíveis necessidades futuras
  }, []);

  // carrega preferência salva
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) {
          setThemePref(saved);
        }
      } catch (e) {
        /* silent */
      }
    })();
  }, []);

  // observa mudanças do esquema do sistema quando em 'auto' (atualiza apenas o estado do sistema)
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const changeThemePref = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemePref(mode);
    } catch (e) {
      console.error(e);
    }
  };

  // Não usamos LayoutAnimation para layout, apenas Animated para cores

  const toggleDarkMode = () => {
    const next = (themePref === 'dark') ? 'light' : 'dark';
    changeThemePref(next);
  };

  const setAutoMode = () => {
    changeThemePref('auto');
  };

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

  const handleEditItem = (item) => {
    setItemToEdit(item);
    setEditItemModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!itemToEdit || !newItemName.trim() || !currentListId) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === currentListId
          ? {
              ...list,
              items: list.items.map((it) =>
                it.id === itemToEdit.id ? { ...it, name: newItemName } : it
              ),
            }
          : list
      )
    );
    setEditItemModalVisible(false);
    setItemToEdit(null);
    setNewItemName('');
  };

  const handleEditList = (list) => {
    setListToEdit(list);
    setEditedListName(list.title);
    setEditedListDescription(list.description);
    setEditListModalVisible(true);
  };

  const handleSaveList = () => {
    if (!listToEdit || !editedListName.trim()) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === listToEdit.id
          ? { ...list, title: editedListName, description: editedListDescription }
          : list
      )
    );
    setEditListModalVisible(false);
    setListToEdit(null);
    setEditedListName('');
    setEditedListDescription('');
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

  // Tema dinâmico usado pela UI (target colors)
  const targetTheme = isDarkMode
    ? {
        background: '#0b0b0c',
        surface: '#121212',
        card: '#1b1b1b',
        text: '#ffffff',
        muted: '#9aa0a6',
        border: '#2b2b2b',
        primary: '#9b7cff',
        fabBg: '#7159c1',
      }
    : {
        background: '#f5f5f5',
        surface: '#ffffff',
        card: '#fafafa',
        text: '#2c3e50',
        muted: '#7f8c8d',
        border: '#e0e0e0',
        primary: '#7159c1',
        fabBg: '#7159c1',
      };

  // Tema aplicado (usado por componentes não-animados). Atualiza apenas após a animação terminar para evitar 'flick'.
  const [appliedTheme, setAppliedTheme] = useState(targetTheme);

  // Aplicamos o tema imediatamente (sem animação) para evitar flick
  useEffect(() => {
    setAppliedTheme(targetTheme);
  }, [isDarkMode]);

  // --- RENDERIZAÇÃO DOS COMPONENTES ---
  const renderHomeScreen = () => (
    <View style={[styles.screenContainer, { backgroundColor: appliedTheme.background }]}> 
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator
      >
        {lists.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <List size={40} color="white" />
            </View>
            <Text style={[styles.emptyStateTitle, { color: appliedTheme.text }]}>Bem-vindo ao Lembrei!</Text>
            <Text style={[styles.emptyStateSubtitle, { color: appliedTheme.muted }]}>
              Crie sua primeira lista clicando no botão '+' abaixo.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.summaryCardPrimary, { backgroundColor: appliedTheme.primary, borderColor: appliedTheme.primary }] }>
                <Text style={[styles.summaryValue, { color: '#fff' }]}>{lists.length}</Text>
                <Text style={[styles.summaryLabel, { color: '#fff' }]}>Listas criadas</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: appliedTheme.surface, borderColor: appliedTheme.border }] }>
                <Text style={[styles.summaryValue, { color: appliedTheme.text }]}>
                  {lists.reduce((acc, list) => acc + list.items.length, 0)}
                </Text>
                <Text style={[styles.summaryLabel, { color: appliedTheme.muted }]}>Total de itens</Text>
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
                  style={({ pressed }) => [
                    styles.listCard,
                    { backgroundColor: appliedTheme.card, borderColor: appliedTheme.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.listCardHeader}>
                    <Text style={[styles.listCardTitle, { color: appliedTheme.text }]}>{list.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEditList(list);
                        }}
                      >
                        <Edit3 size={20} color="#3498db" style={{ marginRight: 8 }} />
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                      >
                        <Trash2 size={20} color="#e74c3c" />
                      </Pressable>
                    </View>
                  </View>

                  {list.description ? (
                    <Text style={[styles.listCardDescription, { color: appliedTheme.muted }]}>{list.description}</Text>
                  ) : null}

                  {(() => {
                    const { icon: Icon, label } = getNotificationMeta(list.notification);
                    return (
                      <View
                        style={[
                          styles.dateContainer,
                          { backgroundColor: isDarkMode ? '#151521' : '#f5f3ff', marginTop: 4, alignSelf: 'flex-start', borderColor: appliedTheme.border }
                        ]}
                      >
                        <Icon size={14} color="#7159c1" />
                        <Text style={[styles.dateText, { color: appliedTheme.primary, fontWeight: '600' }]}>
                          {label}
                        </Text>
                      </View>
                    );
                  })()}

                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressText, { color: appliedTheme.muted }]}>
                      {completedCount} de {list.items.length} itens
                    </Text>
                    <Text style={[styles.progressPercentage, { color: appliedTheme.primary }]}>{Math.round(progress)}%</Text>
                  </View>

                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: appliedTheme.primary }]} />
                  </View>

                  <View style={styles.dateContainer}>
                    <CalendarIcon size={14} color="#7f8c8d" />
                    <Text style={[styles.dateText, { color: appliedTheme.muted }]}>{list.createdAt}</Text>
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
          { bottom: insets.bottom + 24, backgroundColor: appliedTheme.fabBg },
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
      <View style={[styles.screenContainer, { backgroundColor: appliedTheme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {list.items.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Pressable onPress={() => { setNewItemName(''); setAddItemModalVisible(true); }} style={{ alignItems: 'center' }}>
                <View style={styles.emptyListIconContainer}>
                  <Plus size={28} color="#7f8c8d" />
                </View>
              </Pressable>
              <Text style={[styles.emptyStateTitle, { color: appliedTheme.text }]}>Lista Vazia</Text>
              <Text style={[styles.emptyStateSubtitle, { color: appliedTheme.muted }]}>Adicione itens para começar</Text>
            </View>
          ) : (
            <>
              {pendingItems.length > 0 && (
                <Text style={[styles.itemListHeader, { color: appliedTheme.text }]}>Pendentes ({pendingItems.length})</Text>
              )}
              {pendingItems.map((item) => renderItem(item))}

              {completedItems.length > 0 && (
                <Text style={[styles.itemListHeader, { color: appliedTheme.text }]}>Concluídos ({completedItems.length})</Text>
              )}
              {completedItems.map((item) => renderItem(item))}
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={() => setAddItemModalVisible(true)}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 24, backgroundColor: appliedTheme.fabBg },
            pressed && { backgroundColor: '#5a43a1' },
          ]}
        >
          <Plus size={32} color="white" />
        </Pressable>
      </View>
    );
  };

  const renderItem = (item) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: appliedTheme.card, borderColor: appliedTheme.border }]}>
      <Pressable
        onPress={() => handleToggleItem(item.id)}
        style={[styles.checkbox, item.completed && styles.checkboxCompleted, { borderColor: appliedTheme.border }]}
      >
        {item.completed && <Check size={16} color="white" />}
      </Pressable>

      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted, { color: item.completed ? appliedTheme.muted : appliedTheme.text }]}>
          {item.name}
        </Text>
      </View>

      <Pressable onPress={() => handleEditItem(item)}>
        <Edit3 size={20} color="#3498db" style={{ marginRight: 8 }} />
      </Pressable>

      <Pressable onPress={() => handleDeleteItem(item.id)}>
        <Trash2 size={20} color="#e74c3c" />
      </Pressable>
    </View>
  );

  const currentList = lists.find((l) => l.id === currentListId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appliedTheme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[styles.appHeader, { backgroundColor: appliedTheme.surface }]}> 
        {currentScreen === 'list' && (
          <Pressable onPress={navigateToHome} style={styles.backButton}>
            <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#2c3e50'} />
          </Pressable>
        )}
        <Text style={[styles.appHeaderTitle, { color: appliedTheme.text }]}> 
          {currentScreen === 'home' ? 'Minhas Listas' : currentList?.title}
        </Text>
        <Pressable
          onPress={() => setMapAllVisible(true)}
          style={{ padding: 8, borderRadius: 8, marginRight: 8 }}
        >
          <MapPin size={22} color={appliedTheme.text} />
        </Pressable>
        <Pressable
          onPress={toggleDarkMode}
          onLongPress={setAutoMode}
          style={[styles.darkModeButton, { padding: 8, borderRadius: 8 }]}
          accessibilityLabel="Alternar tema (segure para automático)"
        >
          {isDarkMode ? <Sun size={20} color={isDarkMode ? '#fff' : '#2c3e50'} /> : <Moon size={20} color={isDarkMode ? '#fff' : '#2c3e50'} />}
        </Pressable>
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
        theme={appliedTheme}
        isEditing={false}
      />

      {/* MODAL: Adicionar Item */}
      <AddItemModal
        visible={isAddItemModalVisible}
        onCancel={() => setAddItemModalVisible(false)}
        onConfirm={handleAddItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        theme={appliedTheme}
      />

      {/* MODAL: Editar Item */}
      <AddItemModal
        visible={isEditItemModalVisible}
        onCancel={() => {
          setEditItemModalVisible(false);
          setItemToEdit(null);
          setNewItemName('');
        }}
        onConfirm={handleSaveItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        isEditing={true}
        itemToEdit={itemToEdit}
        theme={appliedTheme}
      />

      {/* MODAL: Editar Lista */}
      <CreateListModal
        visible={isEditListModalVisible}
        onCancel={() => {
          setEditListModalVisible(false);
          setListToEdit(null);
          setEditedListName('');
          setEditedListDescription('');
        }}
        onConfirm={(updatedList) => {
          setLists(prev => 
            prev.map(l => l.id === updatedList.id ? updatedList : l)
          );
          setEditListModalVisible(false);
        }}
        originalList={listToEdit}
        newListName={editedListName}
        setNewListName={setEditedListName}
        newListDescription={editedListDescription}
        setNewListDescription={setEditedListDescription}
        theme={appliedTheme}
        isEditing={true}
      />

      {/* MODAL: Confirmar Exclusão */}
      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeleteList}
        theme={appliedTheme}
      />

      {/* MODAL: Mapa com todas as localizações */}
      <AllLocationsMapModal
        visible={isMapAllVisible}
        onClose={() => setMapAllVisible(false)}
        lists={lists}
        theme={appliedTheme}
      />
    </SafeAreaView>
  );
}