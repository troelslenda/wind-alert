import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from "moment";
import { fetchData, shouldWeFetchWeather, calculateRefreshTime,  readingIsRelevant, mapData } from "./utils";
import { WeatherResponse } from "./models";

try {
    admin.initializeApp();
  } catch (e) {}
  

export const searchAlerts = functions
  .runWith({memory: '256MB', timeoutSeconds: 6})
  .region('europe-west2')
  .pubsub
  .schedule("3 * * * *")
  .timeZone("Europe/Copenhagen")
  .onRun(async _ => {
    const windReadingQuery: admin.firestore.QuerySnapshot = await admin
      .firestore()
      .collection("windReadings").orderBy('refreshTime', 'asc').limit(1)
      .get();
    
    if (windReadingQuery.empty) {
        throw new Error('Your application must have at least one valid windReadings document');
    }
    const windReadingDoc: admin.firestore.DocumentSnapshot = windReadingQuery.docs[0]
      if (windReadingDoc.exists && shouldWeFetchWeather(windReadingDoc)) {
        const data: WeatherResponse = await fetchData(
          functions.config().windapp.apitemplate.replace(
            'CITY_CODE', windReadingDoc.data()?.location.key
          )
        );

        let latestReading: admin.firestore.DocumentReference = windReadingDoc.data()?.latestReading;
        /*if (windReadingDoc.data()?.latestReading) {
            console.log(windReadingDoc.data()?.latestReading)
            latestReading = windReadingDoc.data()?.latestReading;
        }*/
        if (readingIsRelevant(data)) {
            latestReading = await windReadingDoc.ref.collection('readings').add({data: data.timeserie.map(item => mapData(item)), lastupdate: data.lastupdate})
        }
        console.log(latestReading)

        return windReadingDoc.ref.set({
          refreshTime: moment().add(
            calculateRefreshTime(data.timeserie),
            "hours"
          ),
          //latestReading : latestReading,
          location: {
            city_name: data.city
          },
        }, {merge:true});
        
      }
    return false;
  });

  export const readingCreated = functions.firestore.document('windReadings/{city}/readings/{reading}').onCreate((snap, context) => {
      return;
  });