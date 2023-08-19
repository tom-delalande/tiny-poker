import moment from "moment";
import wretch from "wretch";
import { Device } from "@capacitor/device";
import versionInfo from "../../version-info.json";

export async function logEvent(eventType: string, data?: any) {
  const device = await Device.getId();
  const deviceId = device.identifier;
  const sessionId = getSessionId();
  const timestamp = moment().utc().format();
  const gitCommitHash = versionInfo.gitCommitHash;

  const event = {
    deviceId,
    sessionId,
    timestamp,
    gitCommitHash,
    eventType,
    ...data,
  };

  console.debug(event);
  wretch("/api/analytics/event").post(event);
}

let sessionId = undefined;
function getSessionId() {
  if (sessionId === undefined) {
    sessionId = Math.floor(moment().valueOf());
  }
  return sessionId;
}
