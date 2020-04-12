import { WindTime } from "./models";
import * as moment from "moment";
import * as admin from "firebase-admin";

export const readingIsRelevant = (
  data: WindTime[],
  previousData: WindTime[]
): boolean =>
  {
    // Find the number of differences between previous and current set of WindTime.
    const difference: number =
      data.length -
      previousData
        .map((x) => x.time.getTime())
        .filter((prevItem) =>
          data.map((x) => x.time.getTime()).includes(prevItem)
        ).length;

    // Find how many WindTime had and increase of more than 1 m/s
    // since the previous request.
    const itemsWithDeviation: number = data.filter((item: WindTime) =>
      previousData.find(
        (prevItem: WindTime) =>
          prevItem.time.getTime() === item.time.getTime() &&
          (item.windSpeed - prevItem.windSpeed > 1 ||
            item.windGust - prevItem.windGust > 1)
      )
    ).length;
    return difference > 6 || itemsWithDeviation > 0;
  };

export const toMoment = (dateString: string): moment.Moment =>
  moment(dateString, "YYYYMMDDHHmmss", true);

export const dataIsOld = (
  doc: admin.firestore.DocumentSnapshot
): boolean =>
  !doc.data()?.refreshTime || doc.data()?.refreshTime?.toDate() <= new Date();

const windIsDangerous = (item: WindTime): boolean =>
  item.windSpeed > 9 || item.windGust > 10;

export const determineNextRequest = (data: WindTime[]): number => {
  // general refreshtime.
  let refreshIn: number = 12;
  try {
    [24, 12, 6].forEach((slot) => {
      if (
        data.filter(
          (item: WindTime) =>
            moment(item.time).diff(moment(), "hours") <= slot &&
            windIsDangerous(item)
        )?.length
      ) {
        refreshIn = Math.floor(slot / 4);
      }
    });

    console.log("setting new refreshtime", {
      refreshIn,
      wind: data.slice(0, 25).map((item: WindTime) => {
        return [
          item.windSpeed,
          item.windGust
        ]
      }),
    });
  } catch (e) {
    console.log("error", e, data);
  }
  return refreshIn;
};
