import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapPickerModal({ visible, onCancel, onConfirm, theme }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [initialRegion, setInitialRegion] = useState(null);
  const mapRef = useRef(null);

  // Ao abrir o modal, tenta obter a localização atual e centralizar o mapa
  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      setMapError(false);
      setLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // não autorizado — usamos região padrão (Brasília) mas avisamos o usuário
          Alert.alert(
            'Permissão necessária',
            'Permita o uso da localização para centralizar o mapa na sua posição.'
          );
          setInitialRegion({
            latitude: -15.7942,
            longitude: -47.8822,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          setLoadingLocation(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        if (!mounted) return;
        setInitialRegion(region);

        // opcional: marca automaticamente o ponto atual como selecionado
        // setSelectedLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        // anima mapa quando estiver pronto
        setTimeout(() => {
          if (mapRef.current && region) {
            try {
              mapRef.current.animateToRegion(region, 400);
            } catch (e) {
              /* silent */
            }
          }
        }, 300);
      } catch (err) {
        console.error('Erro ao obter localização:', err);
        setMapError(true);
      } finally {
        setLoadingLocation(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visible]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleMapError = (error) => {
    console.error('Erro ao carregar o mapa:', error);
    setMapError(true);
    Alert.alert(
      'Erro ao carregar mapa',
      'O mapa não pôde ser exibido. Verifique a configuração da API do Google Maps e rode em um build nativo (ou dev client).'
    );
  };

  const useMyLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita localização para usar "Minha localização".');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setInitialRegion(region);
      setSelectedLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (mapRef.current) {
        try {
          mapRef.current.animateToRegion(region, 400);
        } catch (e) { /* silent */ }
      }
    } catch (err) {
      console.error('Erro ao buscar localização atual:', err);
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const renderMap = () => {
    if (mapError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>⚠️ Não foi possível carregar o mapa.</Text>
          <Pressable
            onPress={() => setMapError(false)}
            style={[styles.button, { backgroundColor: '#7159c1', marginTop: 12 }]}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    // se ainda está carregando a localização inicial, mostra um loader no lugar do mapa
    if (loadingLocation && !initialRegion) {
      return (
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color="#7159c1" />
          <Text style={[styles.fallbackText, { marginTop: 10 }]}>Buscando sua localização...</Text>
        </View>
      );
    }

    try {
      return (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion || {
            latitude: -15.7942,
            longitude: -47.8822,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
          onError={handleMapError}
          showsUserLocation={true}
          followsUserLocation={false}
          showsMyLocationButton={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Local selecionado"
              pinColor="#7159c1"
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setSelectedLocation({ latitude, longitude });
              }}
            />
          )}
        </MapView>
      );
    } catch (err) {
      console.error('Erro crítico ao inicializar MapView:', err);
      setMapError(true);
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>⚠️ O mapa falhou ao iniciar.</Text>
        </View>
      );
    }
  };
  const t = theme || { surface: '#fff', text: '#2c3e50', muted: '#7f8c8d', border: '#e0e0e0', primary: '#7159c1', card: '#fff' };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable onPress={() => {}} style={[styles.container, { backgroundColor: t.surface }]}> 
          <Text style={[styles.title, { color: t.text }]}>Selecione o local do lembrete</Text>

          {/* Botões auxiliares acima do mapa */}
          <View style={styles.topActions}>
            <Pressable onPress={useMyLocation} style={[styles.smallButton, { backgroundColor: t.card, borderColor: t.border }]}> 
              <Text style={{ color: t.text }}>📍 Usar minha localização</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedLocation(null);
              }}
              style={[styles.smallButton, { backgroundColor: t.card, borderColor: t.border }]}
            >
              <Text style={{ color: t.text }}>Limpar seleção</Text>
            </Pressable>
          </View>

          {/* Mapa / fallback */}
          {renderMap()}

          {/* Ações finais */}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, styles.cancel, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}> 
              <Text style={[styles.cancelText, { color: t.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => selectedLocation && onConfirm(selectedLocation)}
              style={[
                styles.button,
                {
                  backgroundColor: selectedLocation ? t.primary : '#ccc',
                },
              ]}
              disabled={!selectedLocation}
            >
              <Text style={[styles.confirmText, { color: selectedLocation ? '#fff' : '#333' }]}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    height: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    padding: 12,
    color: '#2c3e50',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  fallbackText: {
    color: '#7f8c8d',
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: '#ecf0f1',
  },
  cancelText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  confirmText: {
    color: 'white',
    fontWeight: '600',
  },
});
