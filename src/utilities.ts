import {
  NativeModules,
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
  Rationale,
} from 'react-native';
import { Errors, ErrorText, Indentifier, MODULE_NAME, Result } from './types';

const { AnkiDroidModule } = NativeModules;

/**
 * Check if android
 * - display error message if not android
 * @returns `true` if android
 */
export function androidCheck(): boolean {
  if (Platform.OS === 'android') {
    return true;
  }
  console.warn(MODULE_NAME, Errors.OS_ERROR);
  return false;
}
/**
 * Get the AnkiDroid API permission name
 */
export async function getPermissionName(): Promise<any> {
  let permissionName;
  try {
    permissionName = await AnkiDroidModule.getPermissionName();
  } catch (error) {
    permissionName = null;
    console.warn(MODULE_NAME, ErrorText.PERMISSION_NAME, error);
  }
  return permissionName;
}

/**
 * Check if the AnkiDroid API is available on the phone
 * @return `true` if the API is available to use
 */
export async function isApiAvailable(): Promise<boolean> {
  if (!androidCheck()) return false;
  let apiAvailable: boolean;
  try {
    apiAvailable = await AnkiDroidModule.isApiAvailable();
  } catch (error) {
    apiAvailable = false;
    console.warn(MODULE_NAME, ErrorText.API, error);
  }
  return apiAvailable;
}

/**
 * Check the permission status
 * @return `true` if permission have been granted
 */
export async function checkPermission(): Promise<boolean> {
  if (!androidCheck()) return false;
  let permissionName: Permission;
  try {
    permissionName = await getPermissionName();
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return false;
  }
  if (!permissionName) return false;
  try {
    const permission = await PermissionsAndroid.check(permissionName);
    return permission;
  } catch (error) {
    console.warn(MODULE_NAME, ErrorText.PERMISSIONS_CHECK, error);
    return false;
  }
}

/**
 * Request AnkiDroid API permissions
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @return  a tuple of any errors and the result `[error, result]`
 */
export async function requestPermission(
  rationale: Rationale = null,
): Promise<Result<PermissionStatus>> {
  if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
  let permissionName: Permission;
  try {
    permissionName = await getPermissionName();
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return [new Error(Errors.UNKNOWN_ERROR)];
  }
  if (!permissionName) return [null, 'denied'];
  try {
    const permissionRequest = (await PermissionsAndroid.request(
      permissionName,
      rationale,
    )) as PermissionStatus;
    return [null, permissionRequest];
  } catch (error) {
    console.warn(MODULE_NAME, ErrorText.PERMISSIONS_REQUEST, error);
    return [new Error(error.toString())];
  }
}

/**
 * Gets the ID and name for all decks
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @return  a tuple of any errors and the result `[error, result]`
 */
export async function getDeckList(
  rationale: Rationale = null,
): Promise<Result<Indentifier[]>> {
  if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
  const permissionStatus = await requestPermission(rationale);
  if (permissionStatus[1] !== 'granted')
    return [new Error(Errors.PERMISSION_ERROR)];
  try {
    const decks: Indentifier[] = await AnkiDroidModule.getDeckList();
    return [null, decks];
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return [new Error(Errors.UNKNOWN_ERROR), []];
  }
}

/**
 * Gets the ID and name for all models
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @return  a tuple of any errors and the result `[error, result]`
 */
export async function getModelList(
  rationale: Rationale = null,
): Promise<Result<Indentifier[]>> {
  if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
  const permissionStatus = await requestPermission(rationale);
  if (permissionStatus[1] !== 'granted')
    return [new Error(Errors.PERMISSION_ERROR)];
  try {
    const models: Indentifier[] = await AnkiDroidModule.getModelList();
    return [null, models];
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return [new Error(Errors.UNKNOWN_ERROR), []];
  }
}

/**
 * Gets all field names for a specific model
 * @param modelName required if `modelId` is not used
 * @param modelId required if `modelName` is not used
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @return  a tuple of any errors and the result `[error, result]`
 */
export async function getFieldList(
  modelName?: string,
  modelId?: number | string,
  rationale: Rationale = null,
): Promise<Result<string[]>> {
  if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
  const permissionStatus = await requestPermission(rationale);
  if (permissionStatus[1] !== 'granted')
    return [new Error(Errors.PERMISSION_ERROR)];
  if (!modelName && !modelId) return [new Error(Errors.IDENTIFIER_MISSING)];
  if (typeof modelId === 'number') {
    modelId = modelId.toString();
  }
  try {
    const fieldList: string[] = await AnkiDroidModule.getFieldList(
      modelName || null,
      modelId || null,
    );
    return [null, fieldList];
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return [new Error(Errors.UNKNOWN_ERROR), []];
  }
}

/**
 * Gets the name of the currently selected deck
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @return  a tuple of any errors and the result `[error, result]`
 */
export async function getSelectedDeckName(
  rationale: Rationale = null,
): Promise<Result<string>> {
  if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
  const permissionStatus = await requestPermission(rationale);
  if (permissionStatus[1] !== 'granted')
    return [new Error(Errors.PERMISSION_ERROR)];
  try {
    const deckName: string = await AnkiDroidModule.getSelectedDeckName();
    return [null, deckName];
  } catch (error) {
    console.warn(MODULE_NAME, error.toString());
    return [new Error(Errors.UNKNOWN_ERROR)];
  }
}
