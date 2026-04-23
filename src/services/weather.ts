const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const CITY = process.env.EXPO_PUBLIC_WEATHER_CITY; // or any city you want
const WEATHER_URL = process.env.EXPO_PUBLIC_WEATHER_URL;

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
}

export const fetchWeather = async (): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `${WEATHER_URL}?q=${CITY}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      city: data.name,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return null;
  }
};