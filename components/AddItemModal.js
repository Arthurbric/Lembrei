import React from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export default function AddItemModal({
  visible,
  onCancel,
  onConfirm,
  newItemName,
  setNewItemName,
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Item</Text>
            <Pressable onPress={onCancel}>
              <X size={24} color="#7f8c8d" />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.formLabel}>Nome do Item</Text>
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Ex: Leite"
              placeholderTextColor="#7f8c8d"
              style={styles.formInput}
            />
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.button}>
              <Text style={styles.buttonText}>Adicionar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 20 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  formLabel: {
    fontWeight: '500',
    marginBottom: 10,
    fontSize: 16,
    color: '#34495e',
  },
  formInput: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7159c1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  buttonSecondary: { backgroundColor: '#ecf0f1' },
  buttonSecondaryText: { color: '#2c3e50', fontWeight: '500' },
});
