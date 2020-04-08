import { WeatherResponse, TimeSerie } from './models';
import { get } from 'https';
import * as moment from "moment";
import * as admin from 'firebase-admin';

export const fetchData = (url: string) =>  new Promise<WeatherResponse>((resolve, reject): void => {
    get(url,
      res => {
        let body = "";
        res.on("data", chunk => (body += chunk));

        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error.message);
          }
        });
      }
    );
  });

  const toMoment = (dateString: string): moment.Moment =>
  moment(dateString, "YYYYMMDDHHmmss", true);

  export const shouldWeFetchWeather = (doc: admin.firestore.DocumentSnapshot): boolean =>
  !doc.data()?.refreshTime || doc.data()?.refreshTime?.toDate() <= new Date();

  const windIsDangerous = (item: TimeSerie): boolean =>
  item.windSpeed > 9 || item.windGust > 10;

  export const calculateRefreshTime = (data: TimeSerie[]): number => {
    // general refreshtime.
    let refreshIn: number = 12;
    try {
      // Remove irelevant data.
      const weatherData = data.filter(
        (item: TimeSerie) =>
          toMoment(item.time).diff(moment(), "hours") >= 0 &&
          typeof item.windSpeed !== "undefined" &&
          typeof item.windGust !== "undefined"
      );
  
      [24, 12, 6].forEach((slot) => {
        if (
          weatherData.filter(
            (item: TimeSerie) =>
              toMoment(item.time).diff(moment(), "hours") <= slot &&
              windIsDangerous(item)
          )?.length
        ) {
          refreshIn = Math.floor(slot / 4);
        }
      });
  
      console.log("setting new refreshtime", {
        refreshIn,
        ...weatherData.slice(0, 25).map((item: TimeSerie) => {
          return {
            speed: item.windSpeed,
            gust: item.windGust,
            time: toMoment(item.time).toDate(),
          };
        }),
      });
    } catch (e) {
      console.log("error", e, data);
    }
    return refreshIn;
  };