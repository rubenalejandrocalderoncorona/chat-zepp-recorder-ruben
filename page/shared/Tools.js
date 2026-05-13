import { DeviceInfo } from "mzfw/device/UiProperties";
import { SERVER_AUTH_KEY } from "./constants";
function getRequestHeaders() {
  var _a, _b;
  return {
    "X-AI-Model": (_a = localStorage.getItem("currentModel")) != null ? _a : "",
    "Authorization": `Token ${getTbaToken(SERVER_AUTH_KEY)}`,
    "Device": `${DeviceInfo.deviceName};${(_b = localStorage.getItem("device_id")) != null ? _b : "0"}`
  };
}
function getSharedDeviceData() {
  var _a;
  return {
    id: (_a = localStorage.getItem("device_id")) != null ? _a : generateDeviceID(),
    name: DeviceInfo.deviceName
  };
}
function generateDeviceID() {
  let length = 12;
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  localStorage.setItem("device_id", result);
  return result;
}
function makeCRC32Table(polynomial = 3582100097) {
  let table = new Uint32Array(256), forward;
  for (let i = 0; i < 256; i++) {
    forward = i;
    for (let j = 8; j > 0; j--) {
      if ((forward & 1) === 1)
        forward = forward >>> 1 ^ polynomial;
      else
        forward >>>= 1;
    }
    table[i] = forward & 4294967295;
  }
  return table;
}
const defaultTable = makeCRC32Table();
function CRC32(data, table = defaultTable) {
  let crc = 4294967295;
  for (const c of data)
    crc = crc >>> 8 ^ table[(crc ^ c) & 255];
  return (crc ^ 4294967295) >>> 0;
}
function getTbaToken(key) {
  key[0] = Math.floor(Date.now() / 1e3 / 60 / 60);
  return CRC32(key);
}
export {
  getRequestHeaders,
  getSharedDeviceData,
  getTbaToken
};
