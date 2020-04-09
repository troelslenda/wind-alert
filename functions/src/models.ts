
export interface TimeSerie {
    time: string,
    temp: number | null,
    symbol: number | null,
    precip1: number | null,
    precipType: string | null,
    windDir: string | null,
    windDegree: number | null,
    windSpeed: number | null,
    windGust: number | null,
    humidity: number | null,
    pressure: number | null,
    visibility: number | null,
    precip3: number | null,
    precip6: number | null,
    temp10: number | null,
    temp50: number | null,
    temp90: number | null,
    prec10: number | null,
    prec50: number | null,
    prec75: number | null,
    prec90: number | null,
    windspeed10: number | null,
    windspeed50: number | null,
    windspeed90: number | null
  }

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
  