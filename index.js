import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const { RNAnkiDroidModule } = NativeModules;

const androidCheck = () => Platform.OS === "android";

const getPermissionName = async () => {
  let permissionName;
  try {
    permissionName = await RNAnkiDroidModule.getPermissionName();
  } catch (error) {
    permissionName = null;
    console.warn(
      "REACT NATIVE ANKIDROID - Failed to get permission name:",
      error
    );
  }
  return permissionName;
};

/**
 * Check if the AnkiDroid API is available on the phone
 * @return `true` if the API is available to use
 */
export const isApiAvailable = async () => {
  if (!androidCheck()) return;
  let apiAvailable;
  try {
    apiAvailable = await RNAnkiDroidModule.isApiAvailable();
  } catch (error) {
    apiAvailable = null;
    console.warn(
      "REACT NATIVE ANKIDROID - Error checking for API on phone:",
      error
    );
  }
  return apiAvailable;
};

export const checkPermission = async () => {
  if (!androidCheck()) return;
  const permissionName = await getPermissionName();
  let permission;
  try {
    permission = await PermissionsAndroid.check(permissionName);
  } catch (error) {
    permission = error;
    console.warn("REACT NATIVE ANKIDROID - Error checking permissions:", error);
  }
  return permission;
};

requestPermission = async () => {
  if (!androidCheck()) return;
  const permissionName = await getPermissionName();
  let permissionRequest;
  try {
    permissionRequest = await PermissionsAndroid.check(permissionName);
  } catch (error) {
    permissionRequest = error;
    console.warn(
      "REACT NATIVE ANKIDROID - Error requesting permissions:",
      error
    );
  }
  return permissionRequest;
};

export default RNAnkiDroidModule;
