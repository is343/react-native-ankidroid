import { NativeModules, Rationale } from 'react-native';
import {
  Errors,
  ErrorText,
  ModelSettings,
  MODULE_NAME,
  Note,
  NoteKeys,
  Result,
} from './types';
import { androidCheck, requestPermission } from './utilities';

const { AnkiDroidModule } = NativeModules;

/**
 * Create deck, model, and references. Once set up, notes can be created.
 *  All newly created notes must have the correct matching info.
 * @constructor modelSettings object with the below values
 * - deckName: `string`
 * - modelName: `string`
 * - dbDeckReference: `string`
 * - dbModelReference: `string`
 * - modelFields: `string[]`
 * - cardNames: `string[]`
 * - questionFormat: `string[]`
 * - answerFormat: `string[]`
 * - tags: `string[]` - `null` for no tags
 * - css: `string` - `null` for default CSS.
 */
export class Deck {
  modelSettings: ModelSettings;
  constructor(modelSettings: ModelSettings) {
    this.modelSettings = modelSettings;
  }
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
  /**
   * Create notes using the created deck model
   * @param note length must match the settings used when creating the deck
   * @param permissionRational optional `PermissionsAndroid` message to show when requesting permissions
   * @return the added note ID
   * @return error string if something goes wrong
   */
  async addNote(
    valueFields: string[],
    permissionRational: Rationale = null,
  ): Promise<Result<number>> {
    if (!androidCheck()) return [new Error(Errors.OS_ERROR)];
    const permissionStatus = await requestPermission(permissionRational);
    if (permissionStatus[1] !== 'granted')
      return [new Error(Errors.PERMISSION_ERROR)];
    // destructure with default values
    const {
      deckName,
      modelName,
      dbDeckReference,
      dbModelReference,
      modelFields,
      cardNames,
      questionFormat,
      answerFormat,
      tags = null,
      css = null,
    } = this.modelSettings;
    const noteData: Note = { ...this.modelSettings, valueFields };
    // check for errors with the default null values added
    const errorCheckResults = this.checkForAddNoteErrors({
      ...noteData,
      tags,
      css,
    });
    if (errorCheckResults) return [new Error(errorCheckResults)];
    let addedNoteId: string | Errors;
    try {
      addedNoteId = await AnkiDroidModule.addNote(
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
        return Errors[addedNoteId];
      }
      return [null, addedNoteIdInt];
    } catch (error) {
      console.warn(MODULE_NAME, error.toString());
      return [new Error(Errors.UNKNOWN_ERROR)];
    }
  }
}
