import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, Alert } from 'react-native';
import { X, Clock, MapPin, BellOff, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { startGeofence } from '../helpers/geofencing';
import { createList } from '../helpers/lists';
import { loadLists, saveLists } from '../helpers/storage';
import MapPickerModal from './MapPickerModal';


export default function CreateListModal({
  visible,
  onCancel,
  onConfirm,
  newListName,
  setNewListName,
  newListDescription,
  setNewListDescription,
}) {
  const [notificationType, setNotificationType] = useState('none');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('500');


  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [coords, setCoords] = useState(null); // latitude/longitude escolhidas

  // --- Handlers ---
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  };

  const handleConfirm = async () => {
    if (!newListName.trim()) {
      Alert.alert('Atenção', 'Digite um nome para a lista.');
      return;
    }

    let notification = { type: 'none' };

    try {
      // ⏰ Notificação por horário
      if (notificationType === 'time' && selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const dateObj = new Date(selectedDate);
        dateObj.setHours(hours || 0, minutes || 0, 0, 0);

        notification = {
          type: 'time',
          dateISO: dateObj.toISOString(),
        };

        await Notifications.requestPermissionsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Lembrete 🧠',
            body: `Está na hora de "${newListName}"`,
          },
          trigger: { date: dateObj },
        });
      }

      // 📍 Notificação por localização (geofencing)
      else if (notificationType === 'location') {
        if (!coords && !location.trim()) {
          Alert.alert('Erro', 'Escolha um local ou selecione no mapa.');
          return;
        }

        notification = {
          type: 'location',
          place: location || 'Local selecionado no mapa',
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
          radius: parseInt(radius, 10) || 500,
        };

        await Notifications.requestPermissionsAsync();

        await startGeofence({
          identifier: location,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          radius: notification.radius,
        });

        Alert.alert(
          'Geofencing Ativado',
          `Você será notificado ao se aproximar de "${notification.place}".`
        );
      }

      // 🗂️ Criação da lista + salvamento
      const newList = createList(newListName, newListDescription, notification);
      const lists = await loadLists();
      const updated = [...lists, newList];
      await saveLists(updated);

      console.log('✅ Nova lista criada:', newList);
      onConfirm && onConfirm(newList);

      // resetar campos
      setNewListName('');
      setNewListDescription('');
      setNotificationType('none');
    } catch (err) {
      console.error('❌ Erro ao criar lista:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível criar a lista.');
    }
  };


  // --- Render ---
  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* --- Cabeçalho --- */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Nova Lista</Text>
              <Pressable onPress={onCancel}>
                <X size={24} color="#7f8c8d" />
              </Pressable>
            </View>

            {/* --- Corpo --- */}
            <View style={styles.modalBody}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                value={newListName}
                onChangeText={setNewListName}
                placeholder="Ex: Supermercado da semana"
                placeholderTextColor="#7f8c8d"
                style={styles.input}
              />

              <Text style={styles.label}>Descrição (opcional)</Text>
              <TextInput
                value={newListDescription}
                onChangeText={setNewListDescription}
                placeholder="Adicione uma descrição..."
                placeholderTextColor="#7f8c8d"
                style={[styles.input, { height: 80 }]}
                multiline
              />

              <Text style={[styles.label, { marginTop: 10 }]}>Notificações</Text>

              {/* --- Opções de notificação --- */}
              <View style={styles.notificationOptions}>
                <Pressable
                  style={[styles.option, notificationType === 'none' && styles.optionSelected]}
                  onPress={() => setNotificationType('none')}
                >
                  <BellOff size={20} color="#7159c1" />
                  <View>
                    <Text style={styles.optionTitle}>Sem notificação</Text>
                    <Text style={styles.optionSubtitle}>Lista sem lembretes</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[styles.option, notificationType === 'time' && styles.optionSelected]}
                  onPress={() => setNotificationType('time')}
                >
                  <Clock size={20} color="#7159c1" />
                  <View>
                    <Text style={styles.optionTitle}>Notificação por horário</Text>
                    <Text style={styles.optionSubtitle}>
                      Lembrete em data e hora específicas
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[styles.option, notificationType === 'location' && styles.optionSelected]}
                  onPress={() => setNotificationType('location')}
                >
                  <MapPin size={20} color="#7159c1" />
                  <View>
                    <Text style={styles.optionTitle}>Notificação por localização</Text>
                    <Text style={styles.optionSubtitle}>
                      Lembrete quando próximo ao local
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* --- Campos adicionais --- */}
              {notificationType === 'time' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.label}>Data</Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={18} color="#7159c1" />
                    <Text>
                      {selectedDate
                        ? selectedDate.toLocaleDateString('pt-BR')
                        : 'Escolher data'}
                    </Text>
                  </Pressable>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}

                  <Text style={[styles.label, { marginTop: 8 }]}>Horário</Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Clock size={18} color="#7159c1" />
                    <Text>{selectedTime ? selectedTime : 'Escolher horário'}</Text>
                  </Pressable>

                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                </View>
              )}

              {notificationType === 'location' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.label}>Local</Text>

                  {/* Botão que abre o mapa */}
                  <Pressable
                    style={[
                      styles.input,
                      { justifyContent: 'center', alignItems: 'center' },
                    ]}
                    onPress={() => setIsMapVisible(true)}
                  >
                    <Text style={{ color: coords ? '#2c3e50' : '#7f8c8d' }}>
                      {coords
                        ? `📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                        : 'Selecionar no mapa'}
                    </Text>
                  </Pressable>

                  <Text style={[styles.label, { marginTop: 8 }]}>
                    Distância para notificação (m)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={radius}
                    onChangeText={setRadius}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* --- Rodapé --- */}
            <View style={styles.modalFooter}>
              <Pressable
                onPress={onCancel}
                style={[styles.button, styles.cancel]}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleConfirm} style={styles.button}>
                <Text style={styles.buttonText}>Criar Lista</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Modal de seleção de mapa --- */}
      <MapPickerModal
        visible={isMapVisible}
        onCancel={() => setIsMapVisible(false)}
        onConfirm={(selected) => {
          setCoords(selected);
          setIsMapVisible(false);
        }}
      />
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, color: '#2c3e50' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, fontSize: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  optionSelected: { borderColor: '#7159c1', backgroundColor: '#f3ecff' },
  optionTitle: { fontWeight: '600', fontSize: 16 },
  optionSubtitle: { color: '#7f8c8d', fontSize: 13 },
  datePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  button: { backgroundColor: '#7159c1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
  cancel: { backgroundColor: '#ecf0f1' },
  cancelText: { color: '#2c3e50' },
});
