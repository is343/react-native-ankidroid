import {
  NativeModules,
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
  Rationale,
} from 'react-native';
import {
  Errors,
  ErrorText,
  Indentifier,
  MODULE_NAME,
  NewDeckProperties,
  NewModelProperties,
  Note,
  NoteKeys,
  Result,
  Settings,
} from './types';

const { AnkiDroidModule } = NativeModules;

/**
 * Create deck, model, and references. Once set up, notes can be created.
 *  All newly created notes must have the correct matching info.
 * - only one needed of (deckId or deckPoperties) and (modelId or modelProperties)
 * @constructor settings object with the below values
 * - deckId: required if `deckProperties` missing
 * - deckProperties: required if `deckId` missing
 * - modelId: required if `modelProperties` missing
 * - modelProperties: required if `modelId` missing
 */
export class AnkiDroid {
  settings: Settings;
  constructor(settings: Settings) {
    this.settings = settings;
  }

  ////////////
  // STATIC //
  ////////////

  /**
   * Check if android
   * - display error message if not android
   * @returns `true` if android
   */
  static androidCheck(): boolean {
    if (Platform.OS === 'android') {
      return true;
    }
    console.warn(MODULE_NAME, Errors.OS_ERROR);
    return false;
  }

  /**
   * Get the AnkiDroid API permission name
   */
  static async getPermissionName(): Promise<any> {
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
  static async isApiAvailable(): Promise<boolean> {
    if (!AnkiDroid.androidCheck()) return false;
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
  static async checkPermission(): Promise<boolean> {
    if (!AnkiDroid.androidCheck()) return false;
    let permissionName: Permission;
    try {
      permissionName = await AnkiDroid.getPermissionName();
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
  static async requestPermission(
    rationale: Rationale = null,
  ): Promise<Result<PermissionStatus>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    let permissionName: Permission;
    try {
      permissionName = await AnkiDroid.getPermissionName();
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
   * @return  a tuple of any errors and the result `[error, result]`
   */
  static async getDeckList(): Promise<Result<Indentifier[]>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await AnkiDroid.checkPermission();
    if (!permissionStatus) return [new Error(Errors.PERMISSION_ERROR)];
    try {
      const decks: Indentifier[] = await AnkiDroidModule.getDeckList();
      return [null, decks];
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }

  /**
   * Gets the ID and name for all models
   * @return  a tuple of any errors and the result `[error, result]`
   */
  static async getModelList(): Promise<Result<Indentifier[]>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await AnkiDroid.checkPermission();
    if (!permissionStatus) return [new Error(Errors.PERMISSION_ERROR)];
    try {
      const models: Indentifier[] = await AnkiDroidModule.getModelList();
      return [null, models];
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }

  /**
   * Gets all field names for a specific model
   * @param modelName required if `modelId` is not used
   * @param modelId required if `modelName` is not used
   * @return  a tuple of any errors and the result `[error, result]`
   */
  static async getFieldList(
    modelName?: string,
    modelId?: number | string,
  ): Promise<Result<string[]>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await AnkiDroid.checkPermission();
    if (!permissionStatus) return [new Error(Errors.PERMISSION_ERROR)];
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
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }

  /**
   * Gets the name of the currently selected deck
   * @return  a tuple of any errors and the result `[error, result]`
   */
  static async getSelectedDeckName(): Promise<Result<string>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await AnkiDroid.checkPermission();
    if (!permissionStatus) return [new Error(Errors.PERMISSION_ERROR)];
    try {
      const deckName: string = await AnkiDroidModule.getSelectedDeckName();
      return [null, deckName];
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }

  /////////////
  // PRIVATE //
  /////////////

  /**
   * check all note values for errors
   * @param note
   * @returns `null` if no errors
   */
  private checkForAddNoteErrors(note: Note): Errors {
    const { modelFields, valueFields } = note;
    if (!this.checkValidFields(modelFields, valueFields))
      return Errors.TYPE_ERROR;
    for (var key in note) {
      // skip loop if the property is from prototype
      if (!note.hasOwnProperty(key)) continue;
      // check for null exceptions
      if (
        note[key] === null &&
        (key === NoteKeys.tags || key === NoteKeys.css)
      ) {
        continue;
      }
      if (!this.checkArrayLength(note[key], key)) {
        return Errors.TYPE_ERROR;
      }
      if (!this.checkValidString(note[key])) {
        this.logTypeError(key);
        return Errors.TYPE_ERROR;
      }
    }
    return null;
  }
  /**
   * check all property values for errors
   * @param properties
   * @returns `null` if no errors
   */
  private checkForPropertyErrors(
    properties: NewDeckProperties | NewModelProperties,
  ): Errors {
    for (var key in properties) {
      // skip loop if the property is from prototype
      if (!properties.hasOwnProperty(key)) continue;
      // check for keys that can have a default null value
      if (!properties[key] && (key === NoteKeys.tags || key === NoteKeys.css)) {
        continue;
      }
      if (!this.checkArrayLength(properties[key], key)) {
        return Errors.TYPE_ERROR;
      }
      if (!this.checkValidString(properties[key])) {
        this.logTypeError(key);
        return Errors.TYPE_ERROR;
      }
    }
    return null;
  }
  private checkIfModelFieldsAreTheSame(
    modelFields: string[],
    modelFieldsFromNote: string[],
  ): Errors {
    let isSame = true;
    if (
      modelFields.length !== modelFieldsFromNote.length &&
      Array.isArray(modelFields) &&
      Array.isArray(modelFieldsFromNote)
    ) {
      isSame = false;
    }
    if (isSame) {
      const compareSet = new Set(modelFields);
      modelFieldsFromNote.forEach(field => {
        compareSet.add(field);
      });
      if (compareSet.size !== modelFields.length) {
        isSame = false;
      }
    }
    if (!isSame) {
      console.warn(
        MODULE_NAME,
        ErrorText.ARGUMENT_TYPE,
        ErrorText.MODEL_FIELDS_DIFFERENT,
      );
      return Errors.TYPE_ERROR;
    }
    return null;
  }
  /**
   * checks if the card fields are valid types and that they have the same length
   * @param modelFields
   * @param valueFields
   */
  private checkValidFields(modelFields: string[], valueFields: string[]) {
    try {
      if (
        modelFields.length !== valueFields.length &&
        Array.isArray(modelFields) &&
        Array.isArray(valueFields)
      ) {
        console.warn(
          MODULE_NAME,
          ErrorText.ARGUMENT_TYPE,
          ErrorText.ARRAY_SAME_LENGTH,
        );
        return false;
      }
    } catch (error) {
      console.warn(
        MODULE_NAME,
        ErrorText.ARGUMENT_TYPE,
        ErrorText.ARRAY_SAME_LENGTH,
        error.toString(),
      );
      return false;
    }
    return true;
  }
  /**
   * checks that arrays are the correct length
   * @param noteValue
   * @param noteKey
   */
  private checkArrayLength(
    noteValue: string | string[],
    noteKey: string,
  ): boolean {
    try {
      switch (noteKey) {
        case NoteKeys.cardNames:
          if (noteValue.length === 2 && Array.isArray(noteValue)) return true;
          break;
        case NoteKeys.questionFormat:
          if (noteValue.length === 2 && Array.isArray(noteValue)) return true;
          break;
        case NoteKeys.answerFormat:
          if (noteValue.length === 2 && Array.isArray(noteValue)) return true;
          break;
        default:
          return true;
      }
      console.warn(
        MODULE_NAME,
        ErrorText.ARGUMENT_TYPE,
        `${noteKey} ${ErrorText.ARRAY_LENGTH_2}`,
      );
    } catch (error) {
      console.warn(
        MODULE_NAME,
        ErrorText.ARGUMENT_TYPE,
        `${noteKey} ${ErrorText.ARRAY_LENGTH_2}`,
        error.toString(),
      );
      return false;
    }
    return false;
  }
  /**
   * logs errors
   * @param noteKey
   */
  private logTypeError(noteKey: string): void {
    let errorText: ErrorText = null;
    switch (noteKey) {
      case NoteKeys.deckName:
        errorText = ErrorText.STRING;
        break;
      case NoteKeys.modelName:
        errorText = ErrorText.STRING;
        break;
      case NoteKeys.dbDeckReference:
        errorText = ErrorText.STRING;
        break;
      case NoteKeys.dbModelReference:
        errorText = ErrorText.STRING;
        break;
      case NoteKeys.modelFields:
        errorText = ErrorText.ARRAY_OF_STRING;
        break;
      case NoteKeys.valueFields:
        errorText = ErrorText.ARRAY_OF_STRING;
        break;
      case NoteKeys.tags:
        errorText = ErrorText.ARRAY_OF_STRING_OR_NULL;
        break;
      case NoteKeys.cardNames:
        errorText = ErrorText.ARRAY_OF_STRING;
        break;
      case NoteKeys.questionFormat:
        errorText = ErrorText.ARRAY_OF_STRING;
        break;
      case NoteKeys.answerFormat:
        errorText = ErrorText.ARRAY_OF_STRING;
        break;
      case NoteKeys.css:
        errorText = ErrorText.STRING_OR_NULL;
        break;
      default:
        errorText = ErrorText.NOTE_UNKNOWN;
        break;
    }
    console.warn(
      MODULE_NAME,
      ErrorText.ARGUMENT_TYPE,
      `${noteKey} ${errorText}`,
    );
  }
  /**
   * Checks if a valid string or array of strings
   * @param itemToCheck
   * @returns `true` if valid
   */
  private checkValidString(itemToCheck: string | string[]): boolean {
    if (Array.isArray(itemToCheck)) {
      return itemToCheck.every(item => this.checkValidString(item));
    } else {
      return typeof itemToCheck === 'string';
    }
  }

  ////////////
  // PUBLIC //
  ////////////

  /**
   * Create notes using the created deck model
   * @param note length must match the settings used when creating the deck
   * @return  a tuple of any errors and the result `[error, result]`
   * @return the added note ID
   */
  public async addNote(
    valueFields: string[],
    modelFields: string[],
  ): Promise<Result<string>> {
    if (!AnkiDroid.androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await AnkiDroid.checkPermission();
    if (!permissionStatus) return [new Error(Errors.PERMISSION_ERROR)];

    const noteErrorCheckResults = this.checkForAddNoteErrors({
      valueFields,
      modelFields,
    });
    if (noteErrorCheckResults) return [new Error(noteErrorCheckResults)];

    let deckPropertiesToUse = {} as NewDeckProperties;
    let modelPropertiesToUse = {} as NewModelProperties;
    let { deckId, modelId } = this.settings;
    const { deckProperties, modelProperties } = this.settings;

    if (!deckId && !deckProperties) {
      return [new Error(ErrorText.DECK_INFO_MISSING)];
    } else if (!deckId) {
      const errorCheckResults = this.checkForPropertyErrors(deckProperties);
      if (errorCheckResults) return [new Error(errorCheckResults)];
      deckPropertiesToUse = deckProperties;
    } else if (deckId) {
      if (typeof deckId === 'number') {
        deckId = deckId.toString();
      }
    }

    if (!modelId && !modelProperties) {
      return [new Error(ErrorText.MODEL_INFO_MISSING)];
    } else if (!modelId) {
      const errorCheckResults = this.checkForPropertyErrors(modelProperties);
      if (errorCheckResults) return [new Error(errorCheckResults)];
      modelPropertiesToUse = modelProperties;
    } else if (modelId) {
      if (typeof modelId === 'number') {
        modelId = modelId.toString();
      }
    }
    // destructure with default values
    const {
      fields,
      cardNames,
      questionFormat,
      answerFormat,
      tags = null,
      css = null,
    } = modelPropertiesToUse;
    const modelName = modelPropertiesToUse.name;
    const dbModelReference = modelPropertiesToUse.dbReference;
    const deckName = deckPropertiesToUse.name;
    const dbDeckReference = deckPropertiesToUse.dbReference;

    if (!modelId) {
      const errorCheckModelFields = this.checkIfModelFieldsAreTheSame(
        fields,
        modelFields,
      );
      if (errorCheckModelFields) return [new Error(errorCheckModelFields)];
    }

    let addedNoteId: string | Errors;
    try {
      addedNoteId = await AnkiDroidModule.addNote(
        deckName,
        deckId,
        modelName,
        modelId,
        dbDeckReference,
        dbModelReference,
        modelFields,
        valueFields,
        tags,
        cardNames,
        questionFormat,
        answerFormat,
        css,
      );
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
    try {
      const addedNoteIdInt = Number(addedNoteId);
      // check if we received
      if (!addedNoteId || isNaN(addedNoteIdInt)) {
        console.warn(MODULE_NAME, addedNoteId);
        // return the appropriate error
        return [new Error(Errors[addedNoteId])];
      }
      return [null, addedNoteIdInt];
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }
}
