
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

public class RNAnkiDroidModule extends ReactContextBaseJavaModule {
  private AddContentApi mApi;
  private Context mContext;
  // private ReactApplicationContext reactContext;


  private final ReactApplicationContext reactContext;

  public RNAnkiDroidModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    mContext = reactContext.getApplicationContext();
    // mContext = reactContext.getApplicationContext();
    mApi = new AddContentApi(mContext);
  }

  @Override
  public String getName() {
    return "RNAnkiDroid";
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
   * 
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
        return array
    } catch (Exception e) {
      return null
    }
  }


  /**
   * get the deck id
   * @param deckName - null for default deck
   * @return might be null if there was a problem, or to return the default deck
   */
  private Long getDeckId(String deckName) {
    if (deckName == null) {
      return null
    }
    Long did = findDeckIdByName(deckName);
    if (did == null) {
      did = getApi().addNewDeck(deckName);
      storeDeckReference(deckName, did);
    }
    return did;
  }

  /**
   * get model id
   * @param deckId - null for default deck.
   * @param modelName
   * @param modelFields
   * @param cardNames
   * @param questionFormat
   * @param answerFormat
   * @param css - null for default CSS.
   * @return might be null if there was an error
   */
  private Long getModelId(String modelName, String[] modelFields, Long deckId, String[] cardNames, String[] questionFormat, String[] answerFormat, String css) {
    Long mid = findModelIdByName(modelName, modelFields.length);
    if (mid == null) {
      mid = getApi().addNewCustomModel(modelName, modelFields, cardNames, questionFormat, answerFormat, css, deckId, null);
      storeModelReference(modelName, mid);
    }
    return mid;
  }

  /**
   * Check if the AnkiDroid API is available on the phone
   * @param deckName - null for default deck.
   * @param modelName
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
  public void addNote(String deckName, String modelName, ReadableArray incomingModelFields, ReadableArray incomingValueFields, ReadableArray incomingTags, ReadableArray incomingCardNames, ReadableArray incomingQuestionFormat, ReadableArray incomingAnswerFormat, String css, Promise promise) {
    try {
      String[] modelFields = convertReadableArray(incomingModelFields);
      String[] valueFields = convertReadableArray(incomingValueFields);
      String[] tagArray = convertReadableArray(incomingTags);
      String[] cardNames = convertReadableArray(incomingCardNames);
      String[] questionFormat = convertReadableArray(incomingQuestionFormat);
      String[] answerFormat = convertReadableArray(incomingAnswerFormat);
      
      Set<String> tags = new HashSet<String>(Arrays.asList(tagArray));
      Long deckId = getDeckId(deckName);
      
      if ((deckId == null) && (deckName != null)) {
        promise.resolve("FAILED_TO_CREATE_DECK");
        return;
      }

      Long modelId = getModelId(modelName, modelFields, deckId, cardNames, questionFormat, answerFormat, css);
      
      if (modelId == null) {
        promise.resolve("FAILED_TO_CREATE_MODEL");
        return;
      }
  
      Long addedNoteId = getApi().addNote(modelId, deckId, fields, tags);
      
      if (addedNoteId == null){
        promise.resolve("FAILED_TO_ADD_NOTE");
      }
      else {
        promise.resolve(addedNoteId.toString());
      }
    } catch (Exception e) {
      promise.reject(e.toString());
    }
  }
}