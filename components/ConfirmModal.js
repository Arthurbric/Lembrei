import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export default function DeleteConfirmModal({
  visible,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apagar Lista</Text>
            <Pressable onPress={onCancel}>
              <X size={24} color="#7f8c8d" />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>
              Tem certeza que quer apagar esta lista?
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
            >
              <Text style={styles.buttonText}>Apagar</Text>
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
  modalMessage: { fontSize: 16, color: '#2c3e50', textAlign: 'center' },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
