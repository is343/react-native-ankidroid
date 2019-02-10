
package com.is343.reactnativeankidroid;

import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.ListIterator;
import android.util.SparseArray;
import android.content.SharedPreferences;
import android.support.v4.app.ShareCompat;

import android.support.v4.content.ContextCompat;
import android.support.v4.app.ActivityCompat;
import android.content.pm.PackageManager;
import java.util.Collections;

import android.os.Build;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactMethod;

import com.ichi2.anki.api.AddContentApi;
import com.ichi2.anki.api.NoteInfo;

import static com.ichi2.anki.api.AddContentApi.READ_WRITE_PERMISSION;

public class AnkiDroidModule extends ReactContextBaseJavaModule {
  private AddContentApi mApi;
  private Context mContext;

  private final ReactApplicationContext reactContext;

  public AnkiDroidModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    mContext = reactContext.getApplicationContext();
    mApi = new AddContentApi(mContext);
  }

  @Override
  public String getName() {
    return "AnkiDroidModule";
  }

  public AddContentApi getApi() {
    return mApi;
  }

  /**
   * Returns the AnkiDroid AddContentApi permission name
   */
  @ReactMethod
  public void getPermissionName(Promise promise) {
    try {
      promise.resolve(READ_WRITE_PERMISSION);
    } catch (Exception e) {
      promise.reject(e.toString());
    }
  }

  /**
   * Check if the AnkiDroid API is available on the phone
   * @return true if the API is available to use
   */
  @ReactMethod
  public void isApiAvailable(Promise promise) {
    try {
      promise.resolve(isApiAvailable(this.reactContext));
    } catch (Exception e) {
      promise.reject(e.toString());
    }
  }

  /**
   * Whether or not the API is available to use. The API could be unavailable if
   * AnkiDroid is not installed or the user explicitly disabled the API
   * @return true if the API is available to use
   */
  private static boolean isApiAvailable(ReactApplicationContext context) {
    return AddContentApi.getAnkiDroidPackageName(context) != null;
  }

  /**
   * converts ReadableArrays to a useable String[]
   * @param incomingReadableArray
   * @return might be null if there was a problem
   */
  private String[] convertReadableArray(ReadableArray incomingReadableArray) {
    try {
      String[] array = new String[incomingReadableArray.size()];
      for (int index = 0; index < incomingReadableArray.size(); index++) {
        array[index] = incomingReadableArray.getString(index);
      }
      return array;
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * get the deck id
   * @param dBDeckReference
   * @param deckName - null for default deck
   * @return might be null if there was a problem, or to return the default deck
   */
  private Long getDeckId(String dBDeckReference, String deckName) {
    if (deckName == null) {
      return null;
    }
    Long did = findDeckIdByName(dBDeckReference, deckName);
    if (did == null) {
      did = getApi().addNewDeck(deckName);
      storeDeckReference(dBDeckReference, deckName, did);
    }
    return did;
  }

  /**
   * get model id
   * @param dBModelReference
   * @param deckId - null for default deck.
   * @param modelName
   * @param modelFields
   * @param cardNames
   * @param questionFormat
   * @param answerFormat
   * @param css - null for default CSS.
   * @return might be null if there was an error
   */
  private Long getModelId(String dBModelReference, String modelName, String[] modelFields, Long deckId,
      String[] cardNames, String[] questionFormat, String[] answerFormat, String css) {
    Long mid = findModelIdByName(dBModelReference, modelName, modelFields.length);
    if (mid == null) {
      mid = getApi().addNewCustomModel(modelName, modelFields, cardNames, questionFormat, answerFormat, css, deckId,
          null);
      storeModelReference(dBModelReference, modelName, mid);
    }
    return mid;
  }

  /**
   * Save a mapping from deckName to getDeckId in the SharedPreferences
   * @param dBDeckReference
   * @param deckName
   * @param deckId
   */
  public void storeDeckReference(String dBDeckReference, String deckName, long deckId) {
    final SharedPreferences decksDb = mContext.getSharedPreferences(dBDeckReference, Context.MODE_PRIVATE);
    decksDb.edit().putLong(deckName, deckId).apply();
  }

  /**
   * Save a mapping from modelName to modelId in the SharedPreferences
   * @param dBModelReference
   * @param modelName
   * @param modelId
   */
  public void storeModelReference(String dBModelReference, String modelName, long modelId) {
    final SharedPreferences modelsDb = mContext.getSharedPreferences(dBModelReference, Context.MODE_PRIVATE);
    modelsDb.edit().putLong(modelName, modelId).apply();
  }

  /**
   * Remove the duplicates from a list of note fields and tags
   * @param fields List of fields to remove duplicates from
   * @param tags List of tags to remove duplicates from
   * @param modelId ID of model to search for duplicates on
   */
  public void removeDuplicates(LinkedList<String[]> fields, LinkedList<Set<String>> tags, long modelId,
      Promise promise) {
    // Build a list of the duplicate keys (first fields) and find all notes that
    // have a match with each key
    List<String> keys = new ArrayList<>(fields.size());
    int counter = 0;
    for (String[] f : fields) {
      keys.add(f[counter]);
      counter++;
    }
    SparseArray<List<NoteInfo>> duplicateNotes = getApi().findDuplicateNotes(modelId, keys);
    // promise.resolve(duplicateNotes.size());

    // Do some sanity checks
    if (tags.size() != fields.size()) {
      throw new IllegalStateException("List of tags must be the same length as the list of fields");
    }
    if (duplicateNotes == null || duplicateNotes.size() == 0 || fields.size() == 0 || tags.size() == 0) {
      return;
    }
    if (duplicateNotes.keyAt(duplicateNotes.size() - 1) >= fields.size()) {
      throw new IllegalStateException("The array of duplicates goes outside the bounds of the original lists");
    }
    // Iterate through the fields and tags LinkedLists, removing those that had a
    // duplicate
    ListIterator<String[]> fieldIterator = fields.listIterator();
    ListIterator<Set<String>> tagIterator = tags.listIterator();
    int listIndex = -1;
    for (int i = 0; i < duplicateNotes.size(); i++) {
      int duplicateIndex = duplicateNotes.keyAt(i);
      while (listIndex < duplicateIndex) {
        fieldIterator.next();
        tagIterator.next();
        listIndex++;
      }
      fieldIterator.remove();
      tagIterator.remove();
    }
  }

  /**
   * Try to find the given model by name, accounting for renaming of the model: If
   * there's a model with this modelName that is known to have previously been
   * created (by this app) and the corresponding model ID exists and has the
   * required number of fields then return that ID (even though it may have since
   * been renamed) If there's a model from #getModelList with modelName and
   * required number of fields then return its ID Otherwise return null
   * @param dBModelReference
   * @param modelName the name of the model to find
   * @param numFields the minimum number of fields the model is required to have
   * @return the model ID or null if something went wrong
   */
  private Long findModelIdByName(String dBModelReference, String modelName, int numFields) {
    SharedPreferences modelsDb = mContext.getSharedPreferences(dBModelReference, Context.MODE_PRIVATE);
    long prefsModelId = modelsDb.getLong(modelName, -1L);
    // if we have a reference saved to modelName and it exists and has at least
    // numFields then return it
    if ((prefsModelId != -1L) && (mApi.getModelName(prefsModelId) != null) && (mApi.getFieldList(prefsModelId) != null)
        && (mApi.getFieldList(prefsModelId).length >= numFields)) { // could potentially have been renamed
      return prefsModelId;
    }
    Map<Long, String> modelList = mApi.getModelList(numFields);
    if (modelList != null) {
      for (Map.Entry<Long, String> entry : modelList.entrySet()) {
        if (entry.getValue().equals(modelName)) {
          return entry.getKey(); // first model wins
        }
      }
    }
    // model no longer exists (by name nor old id), the number of fields was
    // reduced, or API error
    return null;
  }

  /**
   * Try to find the given deck by name, accounting for potential renaming of the
   * deck by the user as follows: If there's a deck with deckName then return it's
   * ID If there's no deck with deckName, but a ref to deckName is stored in
   * SharedPreferences, and that deck exist in AnkiDroid (i.e. it was renamed),
   * then use that deck.Note: this deck will not be found if your app is
   * re-installed If there's no reference to deckName anywhere then return null
   * @param dBDeckReference
   * @param deckName the name of the deck to find
   * @return the did of the deck in Anki
   */
  private Long findDeckIdByName(String dBDeckReference, String deckName) {
    SharedPreferences decksDb = mContext.getSharedPreferences(dBDeckReference, Context.MODE_PRIVATE);
    // Look for deckName in the deck list
    Long did = _getDeckId(deckName);
    if (did != null) {
      // If the deck was found then return its ID
      return did;
    } else {
      // Otherwise try to check if we have a reference to a deck that was renamed and
      // return that
      did = decksDb.getLong(deckName, -1);
      if (did != -1 && mApi.getDeckName(did) != null) {
        return did;
      } else {
        // If the deck really doesn't exist then return null
        return null;
      }
    }
  }

  /**
   * Get the ID of the deck which matches the name
   * @param deckName Exact name of deck (note: deck names are unique in Anki)
   * @return the ID of the deck that has given name, or null if no deck was found
   *         or API error
   */
  private Long _getDeckId(String deckName) {
    Map<Long, String> deckList = mApi.getDeckList();
    if (deckList != null) {
      for (Map.Entry<Long, String> entry : deckList.entrySet()) {
        if (entry.getValue().equalsIgnoreCase(deckName)) {
          return entry.getKey();
        }
      }
    }
    return null;
  }

  /**
   * Check if the AnkiDroid API is available on the phone
   * @param deckName - null for default deck.
   * @param modelName
   * @param dBDeckReference
   * @param dBModelReference
   * @param incomingModelFields
   * @param incomingValueFields
   * @param incomingTags
   * @param incomingCardNames
   * @param incomingQuestionFormat
   * @param incomingAnswerFormat
   * @param css - null for default CSS.
   * @return might be null if there was an error
   */
  @ReactMethod
  public void addNote(String deckName, String modelName, String dBDeckReference, String dBModelReference,
      ReadableArray incomingModelFields, ReadableArray incomingValueFields, ReadableArray incomingTags,
      ReadableArray incomingCardNames, ReadableArray incomingQuestionFormat, ReadableArray incomingAnswerFormat,
      String css, Promise promise) {
    try {
      String[] modelFields = convertReadableArray(incomingModelFields);
      String[] valueFields = convertReadableArray(incomingValueFields);
      String[] tagArray = convertReadableArray(incomingTags);
      String[] cardNames = convertReadableArray(incomingCardNames);
      String[] questionFormat = convertReadableArray(incomingQuestionFormat);
      String[] answerFormat = convertReadableArray(incomingAnswerFormat);

      Set<String> tags = new HashSet<String>(Arrays.asList(tagArray));
      Long deckId = getDeckId(dBDeckReference, deckName);

      if ((deckId == null) && (deckName != null)) {
        promise.resolve("FAILED_TO_CREATE_DECK");
        return;
      }

      Long modelId = getModelId(dBModelReference, modelName, modelFields, deckId, cardNames, questionFormat,
          answerFormat, css);

      if (modelId == null) {
        promise.resolve("FAILED_TO_CREATE_MODEL");
        return;
      }

      Long addedNoteId = getApi().addNote(modelId, deckId, valueFields, tags);

      if (addedNoteId == null) {
        promise.resolve("FAILED_TO_ADD_NOTE");
      } else {
        promise.resolve(addedNoteId.toString());
      }
    } catch (Exception e) {
      promise.reject(e.toString());
    }
  }
}