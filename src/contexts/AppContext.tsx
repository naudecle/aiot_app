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

  // Get device location then fetch weather every 60 seconds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const startWeather = async () => {
      setWeatherLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied, using default coordinates");
        // Fallback to Beau Bassin, Mauritius
        const data = await fetchWeather();
        if (data) setRealWeather(data);
        setWeatherLoading(false);
        return;
      }

      const fetchWithLocation = async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = location.coords;
          const data = await fetchWeather(latitude, longitude);
          if (data) setRealWeather(data);
        } catch (error) {
          console.error("Location/weather error:", error);
          // Fallback if GPS fails
          const data = await fetchWeather();
          if (data) setRealWeather(data);
        }
        setWeatherLoading(false);
      };

      await fetchWithLocation();
      interval = setInterval(fetchWithLocation, 60000);
    };

    startWeather();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
