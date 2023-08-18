import moment from "moment";
import wretch from "wretch";
import { Device } from "@capacitor/device";

export async function logEvent(eventType: string, data?: any) {
  const device = await Device.getId();
  const deviceId = device.identifier;
  const sessionId = getSessionId();
  const timestamp = moment();

  const event = {
    deviceId,
    sessionId,
    timestamp,
    eventType,
    ...data,
  };

  console.debug({
    message: "logging event",
    event,
  });
  // wretch("/api/analytics/event").post(event);
}

let sessionId = undefined;
function getSessionId() {
  if (sessionId === undefined) {
    sessionId = moment().valueOf();
  }
  return sessionId;
}
