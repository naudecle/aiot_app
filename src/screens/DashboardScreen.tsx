import React, { useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Card, Text, useTheme, Surface, Chip } from 'react-native-paper';
import { AppContext, TrendDirection } from '../contexts/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface SensorCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  unit: string;
  isCritical: boolean;
  trend?: TrendDirection;
  gradientColors: [string, string];
  index: number;
}

function TrendIndicator({ trend, color }: { trend: TrendDirection; color: string }) {
  const theme = useTheme();
  if (trend === 'stable') return null;

  const iconName = trend === 'up' ? 'trending-up' : 'trending-down';
  const trendColor = trend === 'up' ? '#EF4444' : '#34D399';

  return (
    <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
      <MaterialCommunityIcons name={iconName} size={14} color={trendColor} />
    </View>
  );
}

function SensorCard({ icon, label, value, unit, isCritical, trend, gradientColors, index }: SensorCardProps) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const valueAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulse on value change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(valueAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(valueAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [value]);

  useEffect(() => {
    if (isCritical) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCritical]);

  const borderColor = isCritical ? theme.colors.error : gradientColors[0];

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Surface
        style={[
          styles.sensorCard,
          {
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: borderColor,
          },
        ]}
        elevation={2}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: (isCritical ? theme.colors.error : gradientColors[0]) + '18' },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={26}
              color={isCritical ? theme.colors.error : gradientColors[0]}
            />
          </View>
          <View style={styles.cardHeaderRight}>
            {trend && <TrendIndicator trend={trend} color={gradientColors[0]} />}
            {isCritical && (
              <View style={[styles.criticalBadge, { backgroundColor: theme.colors.error + '20' }]}>
                <MaterialCommunityIcons name="alert" size={14} color={theme.colors.error} />
              </View>
            )}
          </View>
        </View>
        <Text
          variant="labelMedium"
          style={[styles.cardLabel, { color: theme.colors.onSurface + 'AA' }]}
        >
          {label}
        </Text>
        <Animated.View style={[styles.valueRow, { transform: [{ scale: valueAnim }] }]}>
          <Text
            variant="headlineMedium"
            style={[
              styles.valueText,
              { color: isCritical ? theme.colors.error : theme.colors.onSurface },
            ]}
          >
            {value}
          </Text>
          {unit ? (
            <Text
              variant="labelSmall"
              style={[styles.unitText, { color: theme.colors.onSurface + '88' }]}
            >
              {unit}
            </Text>
          ) : null}
        </Animated.View>
        <View
          style={[
            styles.statusBar,
            { backgroundColor: (isCritical ? theme.colors.error : gradientColors[0]) + '30' },
          ]}
        >
          <View
            style={[
              styles.statusFill,
              {
                backgroundColor: isCritical ? theme.colors.error : gradientColors[0],
                width: '100%',
              },
            ]}
          />
        </View>
      </Surface>
    </Animated.View>
  );
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 5) return 'à l\'instant';
  if (seconds < 60) return `il y a ${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `il y a ${mins}min`;
}

export default function DashboardScreen() {
  const {
    currentData,
    alertActive,
    thresholds,
    aiotStatus,
    trends,
    isSimulationRunning,
    dataPointCount,
  } = useContext(AppContext);
  const theme = useTheme();
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: alertActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [alertActive]);

  if (!currentData) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="access-point-network" size={64} color={theme.colors.primary + '60'} />
        <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onSurface + 'AA' }}>
          Initialisation des capteurs IoT...
        </Text>
        <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurface + '60' }}>
          Les données arriveront dans 3 secondes
        </Text>
      </View>
    );
  }

  const tempCritical = currentData.temperature > thresholds.temperature;
  const humidityCritical = currentData.humidity > thresholds.humidity;
  const energyCritical = currentData.energy > thresholds.energy;
  const motionDetected = currentData.motion === 1;

  const activeAlerts: string[] = [];
  if (aiotStatus.coolingActive) activeAlerts.push('🧊 Refroidissement activé');
  if (aiotStatus.dehumidifierActive) activeAlerts.push('💨 Déshumidificateur activé');
  if (aiotStatus.energySavingMode) activeAlerts.push('⚡ Mode économie d\'énergie');

  const bannerHeight = bannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, activeAlerts.length > 1 ? 110 : 80],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* AIoT Alert Banner */}
      <Animated.View
        style={[
          styles.alertBanner,
          {
            height: bannerHeight,
            opacity: bannerAnim,
            backgroundColor: theme.colors.error,
          },
        ]}
      >
        <View style={styles.alertContent}>
          <MaterialCommunityIcons name="robot-outline" size={22} color="#FFF" />
          <Text style={styles.alertTitle}>Intelligence AIoT Active</Text>
        </View>
        {activeAlerts.map((alert, i) => (
          <Text key={i} style={styles.alertItem}>{alert}</Text>
        ))}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Capteurs en Direct
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface + '80' }}>
              {timeAgo(currentData.timestamp)} · {dataPointCount} mesure{dataPointCount > 1 ? 's' : ''}
            </Text>
          </View>
          <Surface style={[styles.statusChip, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <View style={[styles.statusDot, { backgroundColor: isSimulationRunning ? '#34D399' : theme.colors.outline }]} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurface }}>
              {isSimulationRunning ? 'EN LIGNE' : 'PAUSE'}
            </Text>
          </Surface>
        </View>

        {/* Sensor Grid */}
        <View style={styles.grid}>
          <SensorCard
            icon="thermometer"
            label="Température"
            value={currentData.temperature.toFixed(1)}
            unit="°C"
            isCritical={tempCritical}
            trend={trends.temperature}
            gradientColors={['#F59E0B', '#EF4444']}
            index={0}
          />
          <SensorCard
            icon="water-percent"
            label="Humidité"
            value={currentData.humidity.toFixed(1)}
            unit="%"
            isCritical={humidityCritical}
            trend={trends.humidity}
            gradientColors={['#3B82F6', '#06B6D4']}
            index={1}
          />
          <SensorCard
            icon="motion-sensor"
            label="Mouvement"
            value={motionDetected ? 'Détecté' : 'Aucun'}
            unit=""
            isCritical={motionDetected}
            gradientColors={['#8B5CF6', '#A78BFA']}
            index={2}
          />
          <SensorCard
            icon="flash"
            label="Énergie"
            value={currentData.energy.toFixed(0)}
            unit="W"
            isCritical={energyCritical}
            trend={trends.energy}
            gradientColors={['#10B981', '#34D399']}
            index={3}
          />
        </View>

        {/* AIoT Status Section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>
          État des Systèmes AIoT
        </Text>
        <Surface style={[styles.aiotCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AIoTRow
            icon="snowflake"
            label="Système de refroidissement"
            active={aiotStatus.coolingActive}
            activeColor="#3B82F6"
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.outline + '30' }]} />
          <AIoTRow
            icon="air-humidifier"
            label="Déshumidificateur"
            active={aiotStatus.dehumidifierActive}
            activeColor="#06B6D4"
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.outline + '30' }]} />
          <AIoTRow
            icon="leaf"
            label="Mode économie d'énergie"
            active={aiotStatus.energySavingMode}
            activeColor="#10B981"
          />
        </Surface>

        {/* Thresholds */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 24 }]}>
          Seuils Configurés
        </Text>
        <View style={styles.chipRow}>
          <Chip
            icon="thermometer"
            mode="outlined"
            style={[styles.chip, { borderColor: tempCritical ? theme.colors.error : theme.colors.outline }]}
            textStyle={{ color: theme.colors.onSurface, fontSize: 12 }}
          >
            {thresholds.temperature}°C
          </Chip>
          <Chip
            icon="water-percent"
            mode="outlined"
            style={[styles.chip, { borderColor: humidityCritical ? theme.colors.error : theme.colors.outline }]}
            textStyle={{ color: theme.colors.onSurface, fontSize: 12 }}
          >
            {thresholds.humidity}%
          </Chip>
          <Chip
            icon="flash"
            mode="outlined"
            style={[styles.chip, { borderColor: energyCritical ? theme.colors.error : theme.colors.outline }]}
            textStyle={{ color: theme.colors.onSurface, fontSize: 12 }}
          >
            {thresholds.energy}W
          </Chip>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function AIoTRow({
  icon,
  label,
  active,
  activeColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  activeColor: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.aiotRow}>
      <View style={styles.aiotRowLeft}>
        <View
          style={[
            styles.aiotIcon,
            { backgroundColor: (active ? activeColor : theme.colors.outline) + '18' },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={active ? activeColor : theme.colors.outline}
          />
        </View>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
          {label}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: active ? activeColor + '20' : theme.colors.outline + '18' }]}>
        <View style={[styles.pillDot, { backgroundColor: active ? activeColor : theme.colors.outline }]} />
        <Text variant="labelSmall" style={{ color: active ? activeColor : theme.colors.outline, marginLeft: 6 }}>
          {active ? 'ACTIF' : 'INACTIF'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alertBanner: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  alertItem: {
    color: '#FFFFFFDD',
    fontSize: 12,
    marginLeft: 30,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  sensorCard: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criticalBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  valueText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unitText: {
    fontWeight: '500',
  },
  statusBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statusFill: {
    height: '100%',
    borderRadius: 2,
  },
  aiotCard: {
    borderRadius: 16,
    padding: 4,
  },
  aiotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aiotRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  aiotIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 20,
  },
});
