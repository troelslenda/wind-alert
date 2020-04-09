import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as moment from "moment";
import {
  dataIsOld,
  determineNextRequest,
  readingIsRelevant,
} from "./utils";
import { WeatherResponse } from "./models";
import { ApiService } from "./api.service";

try {
  admin.initializeApp();
} catch (e) {}

export const searchAlerts = functions
  .runWith({ memory: "256MB", timeoutSeconds: 6 })
  .region("europe-west2")
  .pubsub.schedule("3 * * * *")
  .timeZone("Europe/Copenhagen")
  .onRun(async (_) => {
    const windReadingQuery: admin.firestore.QuerySnapshot = await admin
      .firestore()
      .collection("windReadings")
      .orderBy("refreshTime", "asc")
      .limit(1)
      .get();

    if (windReadingQuery.empty) {
      throw new Error(
        "Your application must have at least one valid windReadings document"
      );
    }
    const windReadingDoc: admin.firestore.DocumentSnapshot =
      windReadingQuery.docs[0];
    if (windReadingDoc.exists && dataIsOld(windReadingDoc)) {
      const service = new ApiService(functions.config().windapp.apitemplate);
      const data: WeatherResponse = await service.fetch(
        windReadingDoc.data()?.location.key
      );

      console.log('data retrieved for: ', data.city)

      let latestReadingRef: admin.firestore.DocumentReference = windReadingDoc.data()
        ?.latestReading;

        const latestReadingDoc = latestReadingRef ? await latestReadingRef.get(): null;

      if (
        !latestReadingRef ||
        latestReadingDoc?.exists && readingIsRelevant(data.wind, latestReadingDoc.data()?.wind)
      ) {
        latestReadingRef = await windReadingDoc.ref
          .collection("readings")
          .add({ wind: data.wind, lastupdate: data.lastupdate });
      }
      return windReadingDoc.ref.set(
        {
          refreshTime: moment().add(determineNextRequest(data.wind), "hours"),
          latestReading: latestReadingRef,
          location: {
            city_name: data.city,
          },
        },
        { merge: true }
      );
    }
    return false;
  });

export const wind = functions
  .region("europe-west2")
  .firestore.document("windReadings/{city}/readings/{reading}")
  .onCreate((snap, context) => {
    // do stuff. Send sms to subscribers!
    return;
  });
