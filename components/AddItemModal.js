import React, { useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export default function AddItemModal({
  visible,
  onCancel,
  onConfirm,
  newItemName,
  setNewItemName,
  isEditing = false,
  itemToEdit = null,
  theme,
}) {
  useEffect(() => {
    if (isEditing && itemToEdit) {
      setNewItemName(itemToEdit.name);
    } else {
      setNewItemName('');
    }
  }, [isEditing, itemToEdit, setNewItemName]);

  const t = theme || { surface: 'white', text: '#2c3e50', muted: '#7f8c8d', border: '#e0e0e0', primary: '#7159c1', card: '#fafafa' };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
        <View style={[styles.modalContent, { backgroundColor: t.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: t.text }]}>{isEditing ? 'Editar Item' : 'Adicionar Item'}</Text>
            <Pressable onPress={onCancel}>
              <X size={24} color={t.muted} />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.formLabel, { color: t.text }]}>Nome do Item</Text>
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Ex: Leite"
              placeholderTextColor={t.muted}
              style={[styles.formInput, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
            />
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.buttonSecondary, { backgroundColor: isEditing ? '#2b2b2b' : '#ecf0f1' }]}
            >
              <Text style={[styles.buttonSecondaryText, { color: t.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.button, { backgroundColor: t.primary }]}>
              <Text style={[styles.buttonText, { color: '#fff' }]}>{isEditing ? 'Salvar' : 'Adicionar'}</Text>
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
