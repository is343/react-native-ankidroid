import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const { AnkiDroidModule } = NativeModules;

const MODULE_NAME = "REACT NATIVE ANKIDROID";
const ARGUMENT_TYPE_ERROR = " - Argument Type error:";
const PERMISSION_ERROR = "PERMISSION DENIED BY USER";
const OS_ERROR = "ANDROID USE ONLY";
const STRING_OR_NULL = "must be a string (or null)";
const STRING = "must be a string";
const ARRAY_OF_STRING = "must be an array of strings";
const NOTE_UNKNOWN = "Unknown type error while adding note";

const androidCheck = () => {
  if (Platform.OS === "android") {
    return true;
  }
  console.warn(MODULE_NAME, OS_ERROR);
  return false;
};

const getPermissionName = async () => {
  let permissionName;
  try {
    permissionName = await AnkiDroidModule.getPermissionName();
  } catch (error) {
    permissionName = null;
    console.warn(MODULE_NAME, " - Failed to get permission name:", error);
  }
  return permissionName;
};

/**
 * Check if the AnkiDroid API is available on the phone
 * @return `true` if the API is available to use
 */
const isApiAvailable = async () => {
  if (!androidCheck()) return;
  let apiAvailable;
  try {
    apiAvailable = await AnkiDroidModule.isApiAvailable();
  } catch (error) {
    apiAvailable = null;
    console.warn(MODULE_NAME, " - Error checking for API on phone:", error);
  }
  return apiAvailable;
};

const checkPermission = async () => {
  if (!androidCheck()) return;
  const permissionName = await getPermissionName();
  if (!permissionName) return false;
  let permission;
  try {
    permission = await PermissionsAndroid.check(permissionName);
  } catch (error) {
    permission = error;
    console.warn(MODULE_NAME, " - Error checking permissions:", error);
  }
  return permission;
};

const requestPermission = async (rational = null) => {
  if (!androidCheck()) return;
  const permissionName = await getPermissionName();
  if (!permissionName) return false;
  let permissionRequest;
  try {
    permissionRequest = await PermissionsAndroid.request(
      permissionName,
      rational
    );
  } catch (error) {
    permissionRequest = error;
    console.warn(MODULE_NAME, " - Error requesting permissions:", error);
  }
  return permissionRequest;
};

async function addNote(
  dBDeckReference,
  dBModelReference,
  modelFields,
  valueFields,
  cardNames,
  questionFormat,
  answerFormat,
  modelName,
  deckName = null,
  tags = null,
  css = null
) {
  if (!androidCheck()) return;
  if (!checkPermission()) return PERMISSION_ERROR;

  if (!checkValidFields(modelFields, valueFields)) return;

  for (let index = 0; index < arguments.length; index++) {
    // check for null exceptions
    if (
      arguments[index] === null &&
      (index === 8 || index === 9 || index === 10)
    ) {
      continue;
    }
    if (!checkArrayLength(arguments[index], index)) {
      return;
    }
    if (!checkValidString(arguments[index])) {
      return getTypeError(index);
    }
  }
  const addedNoteId = await AnkiDroidModule.addNote(
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
    css
  );
  return addedNoteId;
}

const checkValidFields = (modelFields, valueFields) => {
  if (
    modelFields.length !== valueFields.length &&
    Array.isArray(modelFields) &&
    Array.isArray(valueFields)
  ) {
    console.warn(
      MODULE_NAME,
      ARGUMENT_TYPE_ERROR,
      "model and value fields must be the same length"
    );
    return false;
  }
  return true;
};

const checkArrayLength = (argument, index) => {
  let errorArgument = null;
  switch (index) {
    case 4:
      if (argument.length === 2 && Array.isArray(argument)) return true;
      errorArgument = "cardNames";
      break;
    case 5:
      if (argument.length === 2 && Array.isArray(argument)) return true;
      errorArgument = "questionFormat";
      break;
    case 6:
      if (argument.length === 2 && Array.isArray(argument)) return true;
      errorArgument = "answerFormat";
      break;
    default:
      return true;
  }
  if (errorArgument) {
    console.warn(
      MODULE_NAME,
      ARGUMENT_TYPE_ERROR,
      `${errorArgument} must be an array with a length of 2`
    );
    return false;
  }
  return true;
};

const getTypeError = argumentIndex => {
  let errorText = "";
  let errorArgument = "";
  switch (argumentIndex) {
    case 0:
      errorArgument = "deckName";
      errorText = STRING_OR_NULL;
      break;
    case 1:
      errorArgument = "modelName";
      errorText = STRING;
      break;
    case 2:
      errorArgument = "dBDeckReference";
      errorText = STRING;
      break;
    case 3:
      errorArgument = "dBModelReference";
      errorText = STRING;
      break;
    case 4:
      errorArgument = "incomingModelFields";
      errorText = ARRAY_OF_STRING;
      break;
    case 5:
      errorArgument = "incomingValueFields";
      errorText = ARRAY_OF_STRING;
      break;
    case 6:
      errorArgument = "incomingTags";
      errorText = ARRAY_OF_STRING;
      break;
    case 7:
      errorArgument = "incomingCardNames";
      errorText = ARRAY_OF_STRING;
      break;
    case 8:
      errorArgument = "incomingQuestionFormat";
      errorText = ARRAY_OF_STRING;
      break;
    case 9:
      errorArgument = "incomingAnswerFormat";
      errorText = ARRAY_OF_STRING;
      break;
    case 10:
      errorArgument = "css";
      errorText = STRING_OR_NULL;
      break;
    default:
      errorText = NOTE_UNKNOWN;
      break;
  }
  console.warn(
    MODULE_NAME,
    ARGUMENT_TYPE_ERROR,
    `${errorArgument} ${errorText}`
  );
};

/**
 * Checks if a valid string or array of strings
 * @param itemToCheck
 * @returns `true` if valid
 */
const checkValidString = itemToCheck => {
  if (Array.isArray(itemToCheck)) {
    return itemToCheck.every(item => checkValidString(item));
  } else {
    return typeof itemToCheck === "string";
  }
};

const AnkiDroid = {
  getPermissionName,
  isApiAvailable,
  requestPermission,
  checkPermission,
  addNote
};

export default AnkiDroid;
