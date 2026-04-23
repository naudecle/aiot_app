import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { AppContext } from "../contexts/AppContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function WeatherCell({
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
    <View style={styles.weatherCell}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurface + "70", marginTop: 4 }}
      >
        {label}
      </Text>
      <Text
        variant="bodyLarge"
        style={{ color: theme.colors.onSurface, fontWeight: "800" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function WeatherCard() {
  const { weatherData, weatherLoading } = useContext(AppContext);
  const theme = useTheme();

  return (
    <View>
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Météo en Direct
      </Text>
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        {weatherLoading && !weatherData ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons
              name="weather-cloudy-clock"
              size={32}
              color={theme.colors.onSurface + "50"}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface + "70", marginTop: 8 }}
            >
              Chargement des données météo...
            </Text>
          </View>
        ) : weatherData ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#F59E0B18" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="weather-partly-cloudy"
                    size={28}
                    color="#F59E0B"
                  />
                </View>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface, fontWeight: "700" }}
                  >
                    {weatherData.city}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurface + "70",
                      textTransform: "capitalize",
                    }}
                  >
                    {weatherData.description}
                  </Text>
                </View>
              </View>
              <Surface
                style={[
                  styles.liveBadge,
                  { backgroundColor: "#34D399" + "20" },
                ]}
                elevation={0}
              >
                <View style={styles.liveDot} />
                <Text
                  variant="labelSmall"
                  style={{ color: "#34D399", fontWeight: "600" }}
                >
                  API
                </Text>
              </Surface>
            </View>
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outline + "25" },
              ]}
            />
            <View style={styles.grid}>
              <WeatherCell
                icon="thermometer"
                label="Température"
                value={`${weatherData.temperature.toFixed(1)}°C`}
                color="#F59E0B"
              />
              <WeatherCell
                icon="thermometer-lines"
                label="Ressenti"
                value={`${weatherData.feelsLike.toFixed(1)}°C`}
                color="#EF4444"
              />
              <WeatherCell
                icon="water-percent"
                label="Humidité"
                value={`${weatherData.humidity}%`}
                color="#3B82F6"
              />
              <WeatherCell
                icon="weather-windy"
                label="Vent"
                value={`${weatherData.windSpeed} m/s`}
                color="#06B6D4"
              />
            </View>
            <View
              style={[
                styles.footer,
                { backgroundColor: theme.colors.surfaceVariant + "60" },
              ]}
            >
              <MaterialCommunityIcons
                name="cloud-download-outline"
                size={14}
                color={theme.colors.onSurface + "60"}
              />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurface + "60", marginLeft: 6 }}
              >
                Source : OpenWeatherMap API · Mise à jour toutes les 60s
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons
              name="weather-cloudy-alert"
              size={32}
              color={theme.colors.error + "80"}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface + "70", marginTop: 8 }}
            >
              Impossible de charger la météo
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurface + "50", marginTop: 4 }}
            >
              Vérifiez la clé API dans .env
            </Text>
          </View>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  weatherCell: {
    alignItems: "center",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
});
