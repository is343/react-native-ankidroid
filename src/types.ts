/**
 * main module name
 */
export const MODULE_NAME = "REACT NATIVE ANKIDROID"
/**
 * misc error text for logging
 */
export enum ErrorText {
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
export enum Errors {
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  TYPE_ERROR = "INPUT_TYPE_ERROR",
  OS_ERROR = "ANDROID_USE_ONLY",
  PERMISSION_ERROR = "PERMISSION_DENIED_BY_USER",
  FAILED_TO_CREATE_DECK = "FAILED_TO_CREATE_DECK",
  FAILED_TO_CREATE_MODEL = "FAILED_TO_CREATE_MODEL",
  FAILED_TO_ADD_NOTE = "FAILED_TO_ADD_NOTE",
}
/**
 * the data object for the addNote method
 */
export interface NoteData {
  deckName: string
  modelName: string
  dbDeckReference: string
  dbModelReference: string
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
export enum NoteDataKeys {
  deckName = "deckName",
  modelName = "modelName",
  dbDeckReference = "dbDeckReference",
  dbModelReference = "dbModelReference",
  modelFields = "modelFields",
  valueFields = "valueFields",
  cardNames = "cardNames",
  questionFormat = "questionFormat",
  answerFormat = "answerFormat",
  tags = "tags",
  css = "css",
}
