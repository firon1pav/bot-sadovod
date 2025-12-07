
import axios from 'axios';

export const weatherService = {
    async getWeatherAlert(lat: number, lon: number): Promise<string | null> {
        try {
            // SECURITY FIX: Validate Coordinates Range
            if (isNaN(lat) || isNaN(lon)) return null;
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                console.warn(`Invalid coordinates: ${lat}, ${lon}`);
                return null;
            }

            // Using Open-Meteo API (Free, no key required)
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
            const response = await axios.get(url);
            
            const temp = response.data.current.temperature_2m;
            // WMO Weather interpretation codes
            const code = response.data.current.weather_code;

            if (temp < 5) {
                return `Холодает! На улице ${temp}°C. Занесите растения с балкона или сада в дом.`;
            }
            if (temp > 30) {
                return `Жара! На улице ${temp}°C. Проверьте полив и притените растения на солнце.`;
            }
            // 61, 63, 65 = Rain; 80, 81, 82 = Rain showers; 95, 96, 99 = Thunderstorm
            if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
                return `Ожидается сильный дождь или гроза. Спрячьте хрупкие растения с улицы.`;
            }

            return null;
        } catch (error) {
            console.error("Weather API Error:", error);
            return null;
        }
    }
};
