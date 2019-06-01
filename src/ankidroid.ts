import { NativeModules, PermissionsAndroid, Rationale } from "react-native"
import { Errors, ErrorText, MODULE_NAME, NoteData } from "./types"
import {
  androidCheck,
  checkForAddNoteErrors,
  getPermissionName,
} from "./utilities"

const { AnkiDroidModule } = NativeModules

/**
 * Check if the AnkiDroid API is available on the phone
 * @return `true` if the API is available to use
 */
export const isApiAvailable = async (): Promise<boolean> => {
  if (!androidCheck()) return false
  let apiAvailable
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
export const checkPermission = async (): Promise<boolean> => {
  if (!androidCheck()) return false
  const permissionName = await getPermissionName()
  if (!permissionName) return false
  let permission
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
 */
export const requestPermission = async (
  rationale: Rationale = null,
): Promise<string> => {
  if (!androidCheck()) return "denied"
  const permissionName = await getPermissionName()
  if (!permissionName) return "denied"
  let permissionRequest: string
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

/**
 * Create deck, model, references, and then creates a new note. Once the deck, model, and references
 * are created, all newly created notes must have the correct matching info
 * - deckName: `string`
 * - modelName: `string`
 * - dbDeckReference: `string`
 * - dbModelReference: `string`
 * - modelFields: `string[]`
 * - valueFields: `string[]`
 * - cardNames: `string[]`
 * - questionFormat: `string[]`
 * - answerFormat: `string[]`
 * - tags: `string[]` - `null` for no tags
 * - css: `string` - `null` for default CSS.
 * @param noteData object with the above values
 * @param permissionRational optional `PermissionsAndroid` message to show when requesting permissions
 * @return the added note ID
 * @return error string if something goes wrong
 */
export const addNote = async (
  noteData: NoteData,
  permissionRational: Rationale = null,
): Promise<number | Errors> => {
  if (!androidCheck()) return Errors.OS_ERROR
  const permissionStatus = await requestPermission(permissionRational)
  if (permissionStatus !== "granted") return Errors.PERMISSION_ERROR

  // destructure with default values
  const {
    deckName,
    modelName,
    dbDeckReference,
    dbModelReference,
    modelFields,
    valueFields,
    cardNames,
    questionFormat,
    answerFormat,
    tags = null,
    css = null,
  } = noteData

  // check for errors with the default null values added
  const errorCheckResults = checkForAddNoteErrors({
    ...noteData,
    tags,
    css,
  })
  if (errorCheckResults) return errorCheckResults

  const addedNoteId: string = await AnkiDroidModule.addNote(
    deckName,
    modelName,
    dbDeckReference,
    dbModelReference,
    modelFields,
    valueFields,
    tags,
    cardNames,
    questionFormat,
    answerFormat,
    css,
  )
  try {
    const addedNoteIdInt = Number(addedNoteId)

    // check if we received
    if (!addedNoteId || isNaN(addedNoteIdInt)) {
      console.warn(MODULE_NAME, addedNoteId)
      // return the appropriate error
      return Errors[addedNoteId]
    }
    return addedNoteIdInt
  } catch (error) {
    console.warn(MODULE_NAME, error.toString())
    return Errors.UNKNOWN_ERROR
  }
}
