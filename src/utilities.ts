import { NativeModules, Platform } from "react-native"
import {
  Errors,
  ErrorText,
  MODULE_NAME,
  NoteData,
  NoteDataKeys,
} from "./types"

const { AnkiDroidModule } = NativeModules

/**
 * Check if android
 * - display error message if not android
 * @returns `true` if android
 */
export const androidCheck = (): boolean => {
  if (Platform.OS === "android") {
    return true
  }
  console.warn(MODULE_NAME, Errors.OS_ERROR)
  return false
}
/**
 * Get the AnkiDroid API permission name
 */
export const getPermissionName = async (): Promise<any> => {
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
 * check all noteData values for errors
 * @param noteData
 * @returns `null` if no errors
 */
export const checkForAddNoteErrors = (noteData: NoteData): Errors => {
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
export const checkValidString = (itemToCheck: string | string[]): boolean => {
  if (Array.isArray(itemToCheck)) {
    return itemToCheck.every(item => checkValidString(item))
  } else {
    return typeof itemToCheck === "string"
  }
}
