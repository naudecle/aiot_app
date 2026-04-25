import React, { useContext, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  useTheme,
  Text,
  Switch,
  List,
  TextInput,
  Button,
  Surface,
  Divider,
  IconButton,
} from "react-native-paper";
import { AppContext } from "../contexts/AppContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ThresholdRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  unit: string;
  value: string;
  onChange: (val: string) => void;
  color: string;
}

function ThresholdRow({
  icon,
  label,
  unit,
  value,
  onChange,
  color,
}: ThresholdRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.thresholdRow}>
      <View style={styles.thresholdLeft}>
        <View style={[styles.thresholdIcon, { backgroundColor: color + "18" }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface, fontWeight: "600" }}
          >
            {label}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurface + "60" }}
          >
            Seuil critique en {unit}
          </Text>
        </View>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        mode="outlined"
        dense
        style={styles.thresholdInput}
        outlineStyle={{ borderRadius: 10, borderColor: color + "50" }}
        contentStyle={{ fontSize: 16, fontWeight: "700", textAlign: "center" }}
        right={<TextInput.Affix text={unit} />}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    isDarkMode,
    toggleTheme,
    thresholds,
    updateThreshold,
    isSimulationRunning,
    toggleSimulation,
    userLocation,
    updateLocation,
    refreshLocationFromGPS,
  } = useContext(AppContext);

  const [tempInput, setTempInput] = useState(thresholds.temperature.toString());
  const [humInput, setHumInput] = useState(thresholds.humidity.toString());
  const [energyInput, setEnergyInput] = useState(thresholds.energy.toString());
  const [cityInput, setCityInput] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSave = () => {
    const temp = parseFloat(tempInput);
    const hum = parseFloat(humInput);
    const energy = parseFloat(energyInput);

    if (isNaN(temp) || isNaN(hum) || isNaN(energy)) {
      Alert.alert("Erreur", "Veuillez entrer des valeurs numériques valides.");
      return;
    }
    if (
      temp < 0 ||
      temp > 100 ||
      hum < 0 ||
      hum > 100 ||
      energy < 0 ||
      energy > 10000
    ) {
      Alert.alert(
        "Erreur",
        "Les valeurs doivent être dans des plages raisonnables.",
      );
      return;
    }

    updateThreshold("temperature", temp);
    updateThreshold("humidity", hum);
    updateThreshold("energy", energy);
    Alert.alert("✅ Succès", "Les seuils AIoT ont été mis à jour avec succès.");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Appearance Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Apparence
      </Text>
      <Surface
        style={[styles.section, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name={isDarkMode ? "weather-night" : "weather-sunny"}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Mode Sombre
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurface + "70" }}
              >
                {isDarkMode ? "Activé" : "Désactivé"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            color={theme.colors.primary}
          />
        </View>
      </Surface>

      {/* Simulation Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Simulation IoT
      </Text>
      <Surface
        style={[styles.section, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    (isSimulationRunning ? "#34D399" : theme.colors.outline) +
                    "18",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="access-point"
                size={20}
                color={isSimulationRunning ? "#34D399" : theme.colors.outline}
              />
            </View>
            <View>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Capteurs Simulés
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurface + "70" }}
              >
                Données générées toutes les 3 secondes
              </Text>
            </View>
          </View>
          <Switch
            value={isSimulationRunning}
            onValueChange={toggleSimulation}
            color="#34D399"
          />
        </View>
      </Surface>

      {/* Location Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Localisation Météo
      </Text>
      <Surface
        style={[styles.section, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: "#06B6D4" + "18" },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#06B6D4"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, fontWeight: "600" }}
              >
                Position actuelle
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurface + "70" }}
              >
                {userLocation?.cityName ||
                  `${userLocation?.latitude.toFixed(4)}, ${userLocation?.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />

        {/* GPS refresh button */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Button
            mode="outlined"
            onPress={async () => {
              setGpsLoading(true);
              try {
                await refreshLocationFromGPS();
                Alert.alert("✅ Succès", "Position GPS mise à jour.");
              } catch (e) {
                Alert.alert(
                  "Erreur",
                  "Impossible d'obtenir la position GPS. Vérifiez les permissions.",
                );
              }
              setGpsLoading(false);
            }}
            loading={gpsLoading}
            icon="crosshairs-gps"
            style={{ borderRadius: 12, borderColor: "#06B6D4" + "50" }}
            labelStyle={{ fontSize: 13 }}
          >
            Détecter ma position GPS
          </Button>
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />

        {/* Manual coordinate entry */}
        <View
          style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
        >
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurface + "70", marginBottom: 8 }}
          >
            Ou entrer les coordonnées manuellement :
          </Text>
          <View style={styles.locationInputRow}>
            <TextInput
              label="Latitude"
              value={latInput}
              onChangeText={setLatInput}
              keyboardType="numeric"
              mode="outlined"
              dense
              style={styles.locationInput}
              outlineStyle={{ borderRadius: 10 }}
              placeholder={userLocation?.latitude.toFixed(4)}
            />
            <TextInput
              label="Longitude"
              value={lonInput}
              onChangeText={setLonInput}
              keyboardType="numeric"
              mode="outlined"
              dense
              style={styles.locationInput}
              outlineStyle={{ borderRadius: 10 }}
              placeholder={userLocation?.longitude.toFixed(4)}
            />
          </View>
          <TextInput
            label="Nom de la ville (optionnel)"
            value={cityInput}
            onChangeText={setCityInput}
            mode="outlined"
            dense
            style={{ marginBottom: 12 }}
            outlineStyle={{ borderRadius: 10 }}
            placeholder="ex: Port Louis"
            left={<TextInput.Icon icon="city" />}
          />
          <Button
            mode="contained"
            onPress={() => {
              const lat = parseFloat(latInput);
              const lon = parseFloat(lonInput);
              if (isNaN(lat) || isNaN(lon)) {
                Alert.alert(
                  "Erreur",
                  "Veuillez entrer des coordonnées valides.",
                );
                return;
              }
              if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                Alert.alert(
                  "Erreur",
                  "Latitude (-90 à 90) et longitude (-180 à 180).",
                );
                return;
              }
              updateLocation(lat, lon, cityInput || undefined);
              setLatInput("");
              setLonInput("");
              setCityInput("");
              Alert.alert(
                "✅ Succès",
                "Localisation mise à jour. La météo se rafraîchira automatiquement.",
              );
            }}
            icon="map-marker-check"
            style={{ borderRadius: 12, marginBottom: 12 }}
            labelStyle={{ fontSize: 13 }}
          >
            Mettre à jour la localisation
          </Button>
        </View>
      </Surface>

      {/* AIoT Thresholds Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Seuils d'Alerte AIoT
      </Text>
      <Surface
        style={[styles.section, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <ThresholdRow
          icon="thermometer"
          label="Température"
          unit="°C"
          value={tempInput}
          onChange={setTempInput}
          color="#F59E0B"
        />
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />
        <ThresholdRow
          icon="water-percent"
          label="Humidité"
          unit="%"
          value={humInput}
          onChange={setHumInput}
          color="#3B82F6"
        />
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />
        <ThresholdRow
          icon="flash"
          label="Consommation"
          unit="W"
          value={energyInput}
          onChange={setEnergyInput}
          color="#10B981"
        />
      </Surface>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        labelStyle={{ fontWeight: "700", fontSize: 15, letterSpacing: 0.5 }}
        icon="content-save-check"
      >
        Enregistrer les seuils
      </Button>

      {/* About Section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        À propos
      </Text>
      <Surface
        style={[styles.section, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View style={styles.aboutRow}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface + "80" }}
          >
            Version
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface, fontWeight: "600" }}
          >
            1.0.0
          </Text>
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />
        <View style={styles.aboutRow}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface + "80" }}
          >
            Base de données
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface, fontWeight: "600" }}
          >
            SQLite (Expo)
          </Text>
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.outline + "25" },
          ]}
        />
        <View style={styles.aboutRow}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface + "80" }}
          >
            Framework
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface, fontWeight: "600" }}
          >
            React Native + Paper
          </Text>
        </View>
      </Surface>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  thresholdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thresholdLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  thresholdIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  thresholdInput: {
    width: 100,
    height: 40,
    backgroundColor: "transparent",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  locationInput: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
