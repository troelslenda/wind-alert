
export interface TimeSerie {
    time: string,
    temp: number,
    symbol: number,
    precip1: number,
    precipType: string,
    windDir: string,
    windDegree: number,
    windSpeed: number,
    windGust: number,
    humidity: number,
    pressure: number,
    visibility: number,
    precip3: number,
    precip6: number,
    temp10: number,
    temp50: number,
    temp90: number,
    prec10: number,
    prec50: number,
    prec75: number,
    prec90: number,
    windspeed10: number,
    windspeed50: number,
    windspeed90: number
  }

  export interface WindTime {
    time: Date,
    windDegree: number | null,
    windSpeed: number | null,
    windGust: number | null,
    windspeed10: number | null,
    windspeed50: number | null,
    windspeed90: number | null
  }
  
  export interface WeatherResponse {
    timeserie: TimeSerie[];
    id: string,
    city: string,
    country: string,
    longitude: 9.65846,
    latitude: 55.7419,
    timezone: string,
    lastupdate: string,
    sunrise: string,
    sunset: string
  }
  