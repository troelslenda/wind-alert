import { WeatherResponse, WindTime } from "./models";
import { get } from "https";
import * as moment from "moment";
import { toMoment } from "./utils";

export class ApiService {
  private _template: string;
  private _endpoint: string = "";
  get endpoint() {
    return this._endpoint;
  }
  set endpoint(key: string) {
    this._endpoint = this._template.replace("CITY_CODE", key);
  }

  constructor(template: string) {
    this._template = template;
  }

  public fetch (key: string): Promise<WeatherResponse> {
    return  new Promise<WeatherResponse>((resolve, reject): void => {
        this.endpoint = key;
      get(this.endpoint, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));

        res.on("end", () => {
          try {
            resolve(this.mapToWeatherResponse(JSON.parse(body)));
          } catch (error) {
            reject(error.message);
          }
        });
      });
    });
  }

  
   
  private removeIrelevant = (item: any) =>
    toMoment(item.time).diff(moment(), "hours") >= 0 &&
    toMoment(item.time).diff(moment(), "hours") <= 24 &&
    typeof item.windSpeed !== "undefined" &&
    typeof item.windGust !== "undefined";

  private mapData(item: any): WindTime {
    return {
      time: toMoment(item.time).toDate(),
      windDegree: item.windDegree,
      windSpeed: item.windSpeed,
      windGust: item.windGust,
      windspeed10: item.windspeed10 ? item.windspeed10 : null,
      windspeed50: item.windspeed50 ? item.windspeed50 : null,
      windspeed90: item.windspeed90 ? item.windspeed90 : null,
    };
  }

  private mapToWeatherResponse(data: any): WeatherResponse {
    return {
      lastupdate: toMoment(data.lastupdate).toDate(),
      wind: data.timeserie.filter(this.removeIrelevant).map(this.mapData),
      timezone: data.timezone,
      city: data.city,
      id: data.id,
    };
  }
}
