
  export interface WindTime {
    time: Date,
    windDegree: number,
    windSpeed: number,
    windGust: number,
    windspeed10: number | null,
    windspeed50: number | null,
    windspeed90: number | null
  }
  
  export interface WeatherResponse {
    wind: WindTime[];
    id: string,
    city: string,
    timezone: string,
    lastupdate: Date,
  }
  