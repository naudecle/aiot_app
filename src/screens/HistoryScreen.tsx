import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, useTheme, Surface, Chip, Button, IconButton } from 'react-native-paper';
import { AppContext, SensorData } from '../contexts/AppContext';
import { getHistory, clearHistory } from '../services/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FilterType = 'all' | 'critical' | 'normal';

interface Stats {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHum: number;
  avgEnergy: number;
  alertCount: number;
  total: number;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.statCell}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
      </View>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurface + '70', marginTop: 4 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
        {value}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { refreshHistory, thresholds } = useContext(AppContext);
  const theme = useTheme();
  const [history, setHistory] = useState<SensorData[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [refreshHistory, fetchHistory]);

  const isCritical = useCallback(
    (item: SensorData) =>
      item.temperature > thresholds.temperature ||
      item.humidity > thresholds.humidity ||
      item.energy > thresholds.energy,
    [thresholds]
  );

  const filteredData = useMemo(
    () =>
      history.filter((item) => {
        if (filter === 'all') return true;
        const hasCritical = isCritical(item);
        return filter === 'critical' ? hasCritical : !hasCritical;
      }),
    [history, filter, isCritical]
  );

  const stats: Stats | null = useMemo(() => {
    if (history.length === 0) return null;
    const temps = history.map((h) => h.temperature);
    const hums = history.map((h) => h.humidity);
    const energies = history.map((h) => h.energy);
    const alertCount = history.filter(isCritical).length;
    return {
      avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
      avgHum: hums.reduce((a, b) => a + b, 0) / hums.length,
      avgEnergy: energies.reduce((a, b) => a + b, 0) / energies.length,
      alertCount,
      total: history.length,
    };
  }, [history, isCritical]);

  const handleClearHistory = () => {
    Alert.alert(
      '🗑️ Effacer l\'historique',
      'Êtes-vous sûr de vouloir supprimer toutes les données enregistrées ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: SensorData }) => {
    const critical = isCritical(item);
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = date.toLocaleDateString([], { day: '2-digit', month: 'short' });

    return (
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 3,
            borderLeftColor: critical ? theme.colors.error : '#34D399',
          },
        ]}
        elevation={1}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurface + '80'} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurface + '80', marginLeft: 4 }}>
              {dateStr} · {timeStr}
            </Text>
          </View>
          {critical && (
            <View style={[styles.alertChip, { backgroundColor: theme.colors.error + '18' }]}>
              <MaterialCommunityIcons name="alert" size={12} color={theme.colors.error} />
              <Text variant="labelSmall" style={{ color: theme.colors.error, marginLeft: 4, fontWeight: '600' }}>
                ALERTE
              </Text>
            </View>
          )}
        </View>
        <View style={styles.valuesGrid}>
          <ValueCell
            icon="thermometer"
            label="Temp"
            value={`${item.temperature.toFixed(1)}°C`}
            critical={item.temperature > thresholds.temperature}
            color="#F59E0B"
          />
          <ValueCell
            icon="water-percent"
            label="Hum"
            value={`${item.humidity.toFixed(1)}%`}
            critical={item.humidity > thresholds.humidity}
            color="#3B82F6"
          />
          <ValueCell
            icon="motion-sensor"
            label="Mouv"
            value={item.motion ? 'Oui' : 'Non'}
            critical={item.motion === 1}
            color="#8B5CF6"
          />
          <ValueCell
            icon="flash"
            label="Énergie"
            value={`${item.energy.toFixed(0)}W`}
            critical={item.energy > thresholds.energy}
            color="#10B981"
          />
        </View>
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Summary */}
      {stats && (
        <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.statsHeader}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              📊 Statistiques
            </Text>
            <IconButton
              icon="delete-outline"
              size={20}
              iconColor={theme.colors.error}
              onPress={handleClearHistory}
              style={{ margin: 0 }}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard icon="thermometer" label="Moy. Temp" value={`${stats.avgTemp.toFixed(1)}°C`} color="#F59E0B" />
            <StatCard icon="thermometer-chevron-down" label="Min Temp" value={`${stats.minTemp.toFixed(1)}°C`} color="#3B82F6" />
            <StatCard icon="thermometer-chevron-up" label="Max Temp" value={`${stats.maxTemp.toFixed(1)}°C`} color="#EF4444" />
            <StatCard icon="water-percent" label="Moy. Hum" value={`${stats.avgHum.toFixed(1)}%`} color="#06B6D4" />
            <StatCard icon="flash" label="Moy. Énergie" value={`${stats.avgEnergy.toFixed(0)}W`} color="#10B981" />
            <StatCard icon="alert-circle" label="Alertes" value={`${stats.alertCount}/${stats.total}`} color="#EF4444" />
          </View>
        </Surface>
      )}

      {/* Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: theme.colors.outline + '30' }]}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          {filteredData.length} enregistrement{filteredData.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.filterChips}>
          {(['all', 'critical', 'normal'] as FilterType[]).map((f) => (
            <Chip
              key={f}
              mode={filter === f ? 'flat' : 'outlined'}
              selected={filter === f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                filter === f && { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={{
                fontSize: 11,
                color: filter === f ? theme.colors.primary : theme.colors.onSurface + '99',
              }}
              compact
            >
              {f === 'all' ? 'Tout' : f === 'critical' ? 'Alertes' : 'Normal'}
            </Chip>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="database-off-outline"
              size={56}
              color={theme.colors.onSurface + '40'}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface + '80', marginTop: 16 }}>
              Aucune donnée enregistrée
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface + '50', marginTop: 8 }}>
              Les données apparaîtront ici automatiquement
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ValueCell({
  icon,
  label,
  value,
  critical,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  critical: boolean;
  color: string;
}) {
  const theme = useTheme();
  const displayColor = critical ? theme.colors.error : color;

  return (
    <View style={styles.valueCell}>
      <MaterialCommunityIcons name={icon} size={16} color={displayColor} />
      <Text variant="labelSmall" style={{ color: theme.colors.onSurface + '70', marginTop: 2 }}>
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: critical ? theme.colors.error : theme.colors.onSurface,
          fontWeight: '700',
          marginTop: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCell: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    borderRadius: 16,
    height: 30,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  valuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueCell: {
    alignItems: 'center',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
});
