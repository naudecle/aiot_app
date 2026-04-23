const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const CITY = process.env.EXPO_PUBLIC_WEATHER_CITY; // or any city you want
const BASE_URL = process.env.EXPO_PUBLIC_WEATHER_URL;

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
  icon: string;
  feelsLike: number;
  windSpeed: number;
}
 
export const fetchWeather = async (
    latitude?: number,
    longitude?: number): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn('Weather API key not set. Add EXPO_PUBLIC_WEATHER_API_KEY to .env');
    return null;
  }
 
  try {
    const url = (latitude && longitude) ?
      `${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}` :
      `${BASE_URL}?q=${encodeURIComponent(CITY)}&units=metric&appid=${API_KEY}`;

    const response = await fetch( url ) ;                                        

    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }
 
    const data = await response.json();
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      city: data.name,
      icon: data.weather[0].icon,
      feelsLike: data.main.feels_like,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return null;
  }
};