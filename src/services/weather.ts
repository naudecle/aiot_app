const API_KEY = '8cb8ff2ea7eff1132ae21ddf27b9256e';
const CITY = 'Mauritius'; // or any city you want

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
}

export const fetchWeather = async (): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
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