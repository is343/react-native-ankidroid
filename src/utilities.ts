import {
  NativeModules,
  Permission,
  PermissionsAndroid,
  Platform,
  Rationale,
} from "react-native"
import { Errors, ErrorText, MODULE_NAME, PermissionResults } from "./types"

const { AnkiDroidModule } = NativeModules

/**
 * Check if android
 * - display error message if not android
 * @returns `true` if android
 */
export function androidCheck(): boolean {
  if (Platform.OS === "android") {
    return true
  }
  console.warn(MODULE_NAME, Errors.OS_ERROR)
  return false
}
/**
 * Get the AnkiDroid API permission name
 */
export async function getPermissionName(): Promise<any> {
  let permissionName
  try {
    permissionName = await AnkiDroidModule.getPermissionName()
  } catch (error) {
    permissionName = null
    console.warn(MODULE_NAME, ErrorText.PERMISSION_NAME, error)
  }
  return permissionName
}

/**
 * Check if the AnkiDroid API is available on the phone
 * @return `true` if the API is available to use
 */
export async function isApiAvailable(): Promise<boolean> {
  if (!androidCheck()) return false
  let apiAvailable: boolean
  try {
    apiAvailable = await AnkiDroidModule.isApiAvailable()
  } catch (error) {
    apiAvailable = false
    console.warn(MODULE_NAME, ErrorText.API, error)
  }
  return apiAvailable
}

/**
 * Check the permission status
 * @return `true` if permission have been granted
 */
export async function checkPermission(): Promise<boolean> {
  if (!androidCheck()) return false
  let permissionName: Permission
  try {
    permissionName = await getPermissionName()
  } catch (error) {
    console.warn(MODULE_NAME, error.toString())
    return null
  }
  if (!permissionName) return false
  let permission: boolean
  try {
    permission = await PermissionsAndroid.check(permissionName)
  } catch (error) {
    permission = error
    console.warn(MODULE_NAME, ErrorText.PERMISSIONS_CHECK, error)
  }
  return permission
}

/**
 * Request AnkiDroid API permissions
 * @param rationale optional `PermissionsAndroid` message to show when requesting permissions
 * @param returns optional `PermissionsAndroid` message to show when requesting permissions
 */
export async function requestPermission(
  rationale: Rationale = null,
): Promise<PermissionResults | string> {
  if (!androidCheck()) return PermissionResults.DENIED
  let permissionName: Permission
  try {
    permissionName = await getPermissionName()
  } catch (error) {
    console.warn(MODULE_NAME, error.toString())
    return null
  }
  if (!permissionName) return PermissionResults.DENIED
  let permissionRequest: PermissionResults | string
  try {
    permissionRequest = await PermissionsAndroid.request(
      permissionName,
      rationale,
    )
  } catch (error) {
    permissionRequest = error.toString()
    console.warn(MODULE_NAME, ErrorText.PERMISSIONS_REQUEST, error)
  }
  return permissionRequest
}
