import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { X, Clock, MapPin, BellOff, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const handleConfirm = () => {
    const newListData = {
      title: newListName,
      description: newListDescription,
      notificationType,
      date: selectedDate,
      time: selectedTime,
      location,
      radius,
    };
    onConfirm(newListData);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Criar Nova Lista</Text>
            <Pressable onPress={onCancel}><X size={24} color="#7f8c8d" /></Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Ex: Supermercado da semana"
              style={styles.input}
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              value={newListDescription}
              onChangeText={setNewListDescription}
              placeholder="Adicione uma descrição..."
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Notificações</Text>

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
                  <Text style={styles.optionSubtitle}>Lembrete em data e hora específicas</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.option, notificationType === 'location' && styles.optionSelected]}
                onPress={() => setNotificationType('location')}
              >
                <MapPin size={20} color="#7159c1" />
                <View>
                  <Text style={styles.optionTitle}>Notificação por localização</Text>
                  <Text style={styles.optionSubtitle}>Lembrete quando próximo ao local</Text>
                </View>
              </Pressable>
            </View>

            {/* Campos adicionais */}
            {notificationType === 'time' && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Data</Text>
                <Pressable style={styles.datePicker}>
                  <Calendar size={18} color="#7159c1" />
                  <Text>{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Escolher data'}</Text>
                </Pressable>

                <Text style={[styles.label, { marginTop: 8 }]}>Horário</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 14:30"
                  value={selectedTime || ''}
                  onChangeText={setSelectedTime}
                />
              </View>
            )}

            {notificationType === 'location' && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Local</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Big Box 405 Sul, Brasília"
                  value={location}
                  onChangeText={setLocation}
                />
                <Text style={[styles.label, { marginTop: 8 }]}>Distância para notificação (m)</Text>
                <TextInput
                  style={styles.input}
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <Pressable onPress={onCancel} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.button}>
              <Text style={styles.buttonText}>Criar Lista</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
