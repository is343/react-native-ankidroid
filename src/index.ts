import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  Rationale,
} from "react-native"

const { AnkiDroidModule } = NativeModules

const MODULE_NAME = "REACT NATIVE ANKIDROID"

/**
 * misc error text for logging
 */
enum ErrorText {
  PERMISSIONS_CHECK = " - Error checking permissions:",
  PERMISSIONS_REQUEST = " - Error requesting permissions:",
  API = " - Error checking for API on phone:",
  ARGUMENT_TYPE = " - Argument Type error:",
  PERMISSION_NAME = " - Failed to get permission name:",
  STRING_OR_NULL = "must be a string (or null)",
  STRING = "must be a string",
  ARRAY_OF_STRING = "must be an array of strings",
  ARRAY_OF_STRING_OR_NULL = "must be an array of strings or null",
  ARRAY_LENGTH_2 = "must be an array with a length of 2",
  ARRAY_SAME_LENGTH = "model and value fields must be the same length",
  NOTE_UNKNOWN = "Unknown type error while adding note",
}

/**
 * errors that can be thrown
 */
enum Errors {
  UNKNOWN_ERROR = "UNKNOWN ERROR",
  TYPE_ERROR = "INPUT TYPE ERROR",
  OS_ERROR = "ANDROID USE ONLY",
  PERMISSION_ERROR = "PERMISSION DENIED BY USER",
  FAILED_TO_CREATE_DECK = "FAILED_TO_CREATE_DECK",
  FAILED_TO_CREATE_MODEL = "FAILED_TO_CREATE_MODEL",
  FAILED_TO_ADD_NOTE = "FAILED_TO_ADD_NOTE",
}

/**
 * the data object for the addNote method
 */
interface NoteData {
  deckName?: string
  modelName: string
  dBDeckReference: string
  dBModelReference: string
  modelFields: string[]
  valueFields: string[]
  cardNames: string[]
  questionFormat: string[]
  answerFormat: string[]
  tags?: string[]
  css?: string
}

/**
 * for getting argument names
 */
enum NoteDataKeys {
  deckName = "deckName",
  modelName = "modelName",
  dBDeckReference = "dBDeckReference",
  dBModelReference = "dBModelReference",
  modelFields = "modelFields",
  valueFields = "valueFields",
  cardNames = "cardNames",
  questionFormat = "questionFormat",
  answerFormat = "answerFormat",
  tags = "tags",
  css = "css",
}

/**
 * Check if android
 * - display error message if not android
 * @returns `true` if android
 */
const androidCheck = (): boolean => {
  if (Platform.OS === "android") {
    return true
  }
  console.warn(MODULE_NAME, Errors.OS_ERROR)
  return false
}

/**
 * Get the AnkiDroid API permission name
 */
const getPermissionName = async (): Promise<any> => {
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
const isApiAvailable = async (): Promise<boolean> => {
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
const checkPermission = async (): Promise<boolean> => {
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
const requestPermission = async (
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
 * Check if the AnkiDroid API is available on the phone
 * - deckName: `string` - `null` for default deck.
 * - modelName: `string`
 * - dBDeckReference: `string`
 * - dBModelReference: `string`
 * - modelFields: `string[]`
 * - valueFields: `string[]`
 * - cardNames: `string[]`
 * - questionFormat: `string[]`
 * - answerFormat: `string[]`
 * - tags: `string[]` - `null` for no tags
 * - css: `string` - `null` for default CSS.
 * @param noteData object with the above values
 * @param permissionRational optional `PermissionsAndroid` message to show when requesting permissions
 * @return might return an error type
 */
const addNote = async (
  noteData: NoteData,
  permissionRational: Rationale = null,
): Promise<number | Errors> => {
  if (!androidCheck()) return Errors.OS_ERROR
  const permissionStatus = await requestPermission(permissionRational)
  if (permissionStatus !== "granted") return Errors.PERMISSION_ERROR

  // destructure with default values
  const {
    deckName = null,
    modelName,
    dBDeckReference,
    dBModelReference,
    modelFields,
    valueFields,
    cardNames,
    questionFormat,
    answerFormat,
    tags = null,
    css = null,
  } = noteData

  // check for errors with the default values added
  const errorCheckResults = checkForAddNoteErrors({
    ...noteData,
    deckName,
    tags,
    css,
  })
  if (errorCheckResults) return errorCheckResults

  const addedNoteId: string = await AnkiDroidModule.addNote(
    deckName,
    modelName,
    dBDeckReference,
    dBModelReference,
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

/**
 * check all noteData values for errors
 * @param noteData
 * @returns `null` if no errors
 */
const checkForAddNoteErrors = (noteData: NoteData): Errors => {
  const { modelFields, valueFields } = noteData

  if (!checkValidFields(modelFields, valueFields)) return Errors.TYPE_ERROR

  for (var key in noteData) {
    // skip loop if the property is from prototype
    if (!noteData.hasOwnProperty(key)) continue

    // check for null exceptions
    if (
      noteData[key] === null &&
      (key === NoteDataKeys.deckName ||
        key === NoteDataKeys.tags ||
        key === NoteDataKeys.css)
    ) {
      continue
    }

    if (!checkArrayLength(noteData[key], key)) {
      return Errors.TYPE_ERROR
    }

    if (!checkValidString(noteData[key])) {
      logTypeError(key)
      return Errors.TYPE_ERROR
    }
  }
  return null
}

/**
 * checks if the card fields are valid types and that they have the same length
 * @param modelFields
 * @param valueFields
 */
const checkValidFields = (modelFields: string[], valueFields: string[]) => {
  if (
    modelFields.length !== valueFields.length &&
    Array.isArray(modelFields) &&
    Array.isArray(valueFields)
  ) {
    console.warn(
      MODULE_NAME,
      ErrorText.ARGUMENT_TYPE,
      ErrorText.ARRAY_SAME_LENGTH,
    )
    return false
  }
  return true
}

/**
 * checks that arrays are the correct length
 * @param noteDataValue
 * @param noteDataKey
 */
const checkArrayLength = (
  noteDataValue: string | string[],
  noteDataKey: string,
): boolean => {
  switch (noteDataKey) {
    case NoteDataKeys.cardNames:
      if (noteDataValue.length === 2 && Array.isArray(noteDataValue))
        return true
      break
    case NoteDataKeys.questionFormat:
      if (noteDataValue.length === 2 && Array.isArray(noteDataValue))
        return true
      break
    case NoteDataKeys.answerFormat:
      if (noteDataValue.length === 2 && Array.isArray(noteDataValue))
        return true
      break
    default:
      return true
  }
  console.warn(
    MODULE_NAME,
    ErrorText.ARGUMENT_TYPE,
    `${noteDataKey} ${ErrorText.ARRAY_LENGTH_2}`,
  )
  return false
}

/**
 * logs errors
 * @param noteDataKey
 */
const logTypeError = (noteDataKey: string): void => {
  let errorText: ErrorText = null
  switch (noteDataKey) {
    case NoteDataKeys.deckName:
      errorText = ErrorText.STRING_OR_NULL
      break
    case NoteDataKeys.modelName:
      errorText = ErrorText.STRING
      break
    case NoteDataKeys.dBDeckReference:
      errorText = ErrorText.STRING
      break
    case NoteDataKeys.dBModelReference:
      errorText = ErrorText.STRING
      break
    case NoteDataKeys.modelFields:
      errorText = ErrorText.ARRAY_OF_STRING
      break
    case NoteDataKeys.valueFields:
      errorText = ErrorText.ARRAY_OF_STRING
      break
    case NoteDataKeys.tags:
      errorText = ErrorText.ARRAY_OF_STRING_OR_NULL
      break
    case NoteDataKeys.cardNames:
      errorText = ErrorText.ARRAY_OF_STRING
      break
    case NoteDataKeys.questionFormat:
      errorText = ErrorText.ARRAY_OF_STRING
      break
    case NoteDataKeys.answerFormat:
      errorText = ErrorText.ARRAY_OF_STRING
      break
    case NoteDataKeys.css:
      errorText = ErrorText.STRING_OR_NULL
      break
    default:
      errorText = ErrorText.NOTE_UNKNOWN
      break
  }
  console.warn(
    MODULE_NAME,
    ErrorText.ARGUMENT_TYPE,
    `${noteDataKey} ${errorText}`,
  )
}

/**
 * Checks if a valid string or array of strings
 * @param itemToCheck
 * @returns `true` if valid
 */
const checkValidString = (itemToCheck: string | string[]): boolean => {
  if (Array.isArray(itemToCheck)) {
    return itemToCheck.every(item => checkValidString(item))
  } else {
    return typeof itemToCheck === "string"
  }
}

/**
 * The main AnkiDroid logic
 */
const AnkiDroid = {
  isApiAvailable,
  requestPermission,
  checkPermission,
  addNote,
}

export default AnkiDroid
