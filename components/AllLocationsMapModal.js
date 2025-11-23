import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { X } from 'lucide-react-native';

export default function AllLocationsMapModal({ visible, onClose, lists, theme }) {
  const t = theme || {
    surface: '#fff',
    text: '#2c3e50',
    muted: '#7f8c8d',
    border: '#e0e0e0',
    primary: '#7159c1',
    card: '#fff',
  };

  const mapRef = useRef(null);
  const [initialRegion, setInitialRegion] = useState(null);

  // Determinar um ponto inicial baseado na primeira lista com localização
  useEffect(() => {
    if (!visible) return;

    const locations = lists
      .filter((l) => l.notification?.type === 'location')
      .filter((l) => l.notification.latitude && l.notification.longitude);

    if (locations.length > 0) {
      const first = locations[0].notification;
      setInitialRegion({
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      // fallback: Brasília
      setInitialRegion({
        latitude: -15.7942,
        longitude: -47.8822,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [visible]);

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: t.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.text }]}>Locais dos lembretes</Text>
            <Pressable onPress={onClose}>
              <X size={24} color={t.muted} />
            </Pressable>
          </View>

          {/* MAPA */}
          {!initialRegion ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={t.primary} />
            </View>
          ) : (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={initialRegion}
            >
              {/* Desenha todos os locais */}
              {lists
                .filter((l) => l.notification?.type === 'location')
                .filter((l) => l.notification.latitude && l.notification.longitude)
                .map((list) => (
                  <React.Fragment key={list.id}>
                    <Marker
                      coordinate={{
                        latitude: list.notification.latitude,
                        longitude: list.notification.longitude,
                      }}
                      title={list.title}
                      description={`Raio: ${list.notification.radius}m`}
                      pinColor={t.primary}
                    />

                    <Circle
                      center={{
                        latitude: list.notification.latitude,
                        longitude: list.notification.longitude,
                      }}
                      radius={list.notification.radius}
                      fillColor="rgba(113, 89, 193, 0.15)"
                      strokeColor={t.primary}
                      strokeWidth={2}
                    />
                  </React.Fragment>
                ))}
            </MapView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    height: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
