import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { insertData, initDB } from "../services/db";
import { fetchWeather, WeatherData } from "../services/weather";
import * as Location from "expo-location";

export interface SensorData {
  id?: number;
  temperature: number;
  humidity: number;
  motion: number; // 0 or 1
  energy: number;
  timestamp: string;
}

export interface Thresholds {
  temperature: number;
  humidity: number;
  energy: number;
}

export interface AIoTStatus {
  coolingActive: boolean;
  dehumidifierActive: boolean;
  energySavingMode: boolean;
}

export type TrendDirection = "up" | "down" | "stable";

export interface Trends {
  temperature: TrendDirection;
  humidity: TrendDirection;
  energy: TrendDirection;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  cityName: string | null;
}

interface AppContextData {
  isDarkMode: boolean;
  toggleTheme: () => void;
  thresholds: Thresholds;
  updateThreshold: (key: keyof Thresholds, value: number) => void;
  currentData: SensorData | null;
  previousData: SensorData | null;
  alertActive: boolean;
  aiotStatus: AIoTStatus;
  trends: Trends;
  refreshHistory: number;
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
  dataPointCount: number;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  userLocation: UserLocation | null;
  updateLocation: (lat: number, lon: number, city?: string) => void;
  refreshLocationFromGPS: () => Promise<void>;
}
export const AppContext = createContext<AppContextData>({} as AppContextData);

const DEFAULT_THRESHOLDS: Thresholds = {
  temperature: 30,
  humidity: 70,
  energy: 400,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [previousData, setPreviousData] = useState<SensorData | null>(null);
  const [alertActive, setAlertActive] = useState(false);
  const [aiotStatus, setAiotStatus] = useState<AIoTStatus>({
    coolingActive: false,
    dehumidifierActive: false,
    energySavingMode: false,
  });
  const [trends, setTrends] = useState<Trends>({
    temperature: "stable",
    humidity: "stable",
    energy: "stable",
  });
  const [dbReady, setDbReady] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [dataPointCount, setDataPointCount] = useState(0);
  const [realWeather, setRealWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  const toggleTheme = useCallback(() => setIsDarkMode((prev) => !prev), []);
  const toggleSimulation = useCallback(
    () => setIsSimulationRunning((prev) => !prev),
    [],
  );

  const updateThreshold = useCallback(
    (key: keyof Thresholds, value: number) => {
      setThresholds((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const computeTrend = (current: number, previous: number): TrendDirection => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5) return "stable";
    return diff > 0 ? "up" : "down";
  };

  // Get device location ONCE on first launch
  useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            cityName: null, // will be filled by weather response
          });
        }
      } catch (error) {
        console.warn("GPS failed, using default location:", error);
      }
      setLocationReady(true);
    };

    initLocation();
  }, []);

  // Manual location update from Settings
  const updateLocation = useCallback(
    (lat: number, lon: number, city?: string) => {
      setUserLocation({
        latitude: lat,
        longitude: lon,
        cityName: city || null,
      });
    },
    [],
  );

  // Re-detect location from GPS
  const refreshLocationFromGPS = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission denied");
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        cityName: null,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  // Fetch weather every 60 seconds using current userLocation
  useEffect(() => {
    if (!locationReady) return;

    const fetchAndSet = async () => {
      setWeatherLoading(true);
      const data = await fetchWeather(
        userLocation?.latitude,
        userLocation?.longitude,
      );
      if (data) {
        setRealWeather(data);
        // Update cityName from API response if not manually set
        if (!userLocation?.cityName || userLocation?.cityName !== data.city) {
          setUserLocation((prev) =>
            prev ? { ...prev, cityName: data.city } : prev,
          );
        }
      }
      setWeatherLoading(false);
    };

    fetchAndSet();
    const interval = setInterval(fetchAndSet, 60000);
    return () => clearInterval(interval);
  }, [locationReady, userLocation?.latitude, userLocation?.longitude]);

  useEffect(() => {
    if (!dbReady || !isSimulationRunning) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      const newData: SensorData = {
        temperature: realWeather
          ? +(realWeather.temperature + (Math.random() * 2 - 1)).toFixed(1)
          : +(18 + Math.random() * 25).toFixed(1),
        humidity: realWeather
          ? +(realWeather.humidity + (Math.random() * 3 - 1.5))
          : +(25 + Math.random() * 55).toFixed(1),
        motion: Math.random() > 0.75 ? 1 : 0,
        energy: +(50 + Math.random() * 500).toFixed(0),
        timestamp,
      };

      setCurrentData((prev) => {
        setPreviousData(prev);
        if (prev) {
          setTrends({
            temperature: computeTrend(newData.temperature, prev.temperature),
            humidity: computeTrend(newData.humidity, prev.humidity),
            energy: computeTrend(newData.energy, prev.energy),
          });
        }
        return newData;
      });

      setDataPointCount((c) => c + 1);

      insertData(
        newData.temperature,
        newData.humidity,
        newData.motion,
        newData.energy,
      )
        .then(() => setRefreshHistory((prev) => prev + 1))
        .catch(console.error);

      // AIoT logic
      const cooling = newData.temperature > thresholds.temperature;
      const dehumidifier = newData.humidity > thresholds.humidity;
      const energySaving = newData.energy > thresholds.energy;

      setAiotStatus({
        coolingActive: cooling,
        dehumidifierActive: dehumidifier,
        energySavingMode: energySaving,
      });

      setAlertActive(cooling || dehumidifier || energySaving);
    }, 3000);

    return () => clearInterval(interval);
  }, [dbReady, thresholds, isSimulationRunning]);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        thresholds,
        updateThreshold,
        currentData,
        previousData,
        alertActive,
        aiotStatus,
        trends,
        refreshHistory,
        isSimulationRunning,
        toggleSimulation,
        dataPointCount,
        weatherData: realWeather,
        weatherLoading,
        userLocation,
        updateLocation,
        refreshLocationFromGPS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
