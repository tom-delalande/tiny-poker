import moment from "moment";
import wretch from "wretch";
import { Device } from "@capacitor/device";
import buildVersionData from "../../build-version.json";

export async function logEvent(eventType: string, data?: any) {
  const device = await Device.getId();
  const deviceId = device.identifier;
  const sessionId = getSessionId();
  const timestamp = moment().utc().format();
  const clientBuildversion = buildVersionData.buildVersion;

  const event = {
    deviceId,
    sessionId,
    timestamp,
    clientBuildversion,
    eventType,
    ...data,
  };

  console.debug(event);
  try {
    wretch("/api/analytics/event").post(event);
  } catch (e: any) {}
}

let sessionId = undefined;
function getSessionId() {
  if (sessionId === undefined) {
    sessionId = Math.floor(moment().valueOf());
  }
  return sessionId;
}
