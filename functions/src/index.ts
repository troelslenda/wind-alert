import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from "moment";
import { fetchData, shouldWeFetchWeather, calculateRefreshTime } from "./utils";
import { WeatherResponse } from "./models";

try {
    admin.initializeApp();
  } catch (e) {}
  

export const searchAlerts = functions.region('europe-west2').pubsub
  .schedule("3 * * * *")
  .timeZone("Europe/Copenhagen")
  .onRun(async _ => {
    const windReadingQuery = await admin
      .firestore()
      .collection("windReadings").orderBy('refreshTime', 'asc').limit(1)
      .get();

    const windReadingDoc: any = windReadingQuery.docs[0]
      if (shouldWeFetchWeather(windReadingDoc)) {
        const data: WeatherResponse = await fetchData(functions.config().windapp.apitemplate.replace('CITY_CODE',windReadingDoc.data().location.key));

        return windReadingDoc.ref.set({
          refreshTime: moment().add(
            calculateRefreshTime(data.timeserie),
            "hours"
          ),
          location: {
            city_name: data.city
          },
          raw: data
        }, {merge:true});
      }
    return false;
  });
