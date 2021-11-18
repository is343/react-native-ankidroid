[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/P5P71KGZI)

# react-native-ankidroid

React Native wrapper for the AnkiDroid API

- [AnkiDroid API documentation](https://github.com/ankidroid/Anki-Android/wiki/AnkiDroid-API)

## Getting started

`npm install react-native-ankidroid --save`

## **RN 0.60+**

The library will be automatically linked **BUT step 4 of the manual installation is still required.**

## RN < 0.60

### Mostly automatic installation

`react-native link react-native-ankidroid`

- Step 4 of the manual installation is still required.

### Manual installation

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`

- Add `import com.is343.reactnativeankidroid.AnkiDroidPackage;` to the imports at the top of the file
- Add `new AnkiDroidPackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
   ```
   include ':react-native-ankidroid'
   project(':react-native-ankidroid').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-ankidroid/android')
   ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
   ```
     implementation project(':react-native-ankidroid')
   ```
4. **Add the following lines to `/android/app/src/main/res/AndroidManifest.xml`:**

   ```java
   <manifest xmlns:android="http://schemas.android.com/apk/res/android"
       xmlns:tools="http://schemas.android.com/tools" // <---- ADD HERE
       package="com.yourpackage.name">

       <uses-permission android:name="android.permission.INTERNET" />
       <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

       <application
         android:name="com.yourpackage.name.MainApplication"
         android:label="@string/app_name"
         android:icon="@mipmap/ic_launcher"
         android:allowBackup="true"
         android:theme="@style/AppTheme"
         tools:replace="android:allowBackup" // <---- ADD HERE
         >
   ```

- This will prevent the following error by forcing the compiler to use your app's attribute:

```
    Execution failed for task ':app:processDebugManifest'.
    > Manifest merger failed : Attribute application@allowBackup value=(false) from AndroidManifest.xml:15:7-34 is also present at [com.github.ankidroid:Anki-Android:api-v1.1.0] AndroidManife
    st.xml:14:9-35 value=(true).
    Suggestion: add 'tools:replace="android:allowBackup"' to <application> element at AndroidManifest.xml:7:5-117 to override.
```

## Usage

```javascript
import AnkiDroid from 'react-native-ankidroid';

await AnkiDroid.isApiAvailable();
```

### Static Methods

AnkiDroid.**\_\_\_\_\_\_\_\_\_\_\_\_**
**\*(returns a Promise)**

- **isApiAvailable()\*** - checks if the AnkiDroid API is avaiable (AnkiDroid is installed on the device)
  _in order to access the API, AnkiDroid may need to be installed before the react native app_
- **checkPermission()\***
- **requestPermission(rationale)\***
  -- rationale (optional)
- **getSelectedDeckName()\***
  -- gets the name of the currently selected deck
  -- returns a response tuple
- **getDeckList()\***
  -- gets a list of the names and IDs of each deck
  -- returns a response tuple
- **getModelList()\***
  -- gets a list of the names and IDs of each model
  -- returns a response tuple
- **getFieldList(modelName, modelId)\***
  -- gets a list of all field names for a specific model
  -- only one of `modelName` or `modelId` is required
  -- returns a response tuple
- **uploadMediaFromUri(fileUri, preferredName, mimeType)\***
  -- gets a list of all field names for a specific model
  -- `fileUri`: the location of the media to upload
  -- `preferredName`: the name that will be used to access the media in the card
  -- `mimeType`: can be either `"audio"` or `"image"`
  -- returns a response tuple
  -- import media into notes with `<img src="myimage.jpg">` and `[sound:myaudio.mp3]`
  -- official anki docs can be found [here](https://docs.ankiweb.net/importing.html?highlight=media#importing-media)
  -- Both AnkiDroid and your app require the `android.permission.MANAGE_EXTERNAL_STORAGE` permission granted if you intend to upload a file from external storage

### Creating a class instance

- `new AnkiDroid(setupOptions)` - creates an instance of your deck

## The Response tuple

- some methods will return a tuple in the form of `[error, responseData]`
  -- when there is no error the first value in the tuple will be `null`. The data we want to retrieve will always be in the second value

## setupOptions object

| Params          |       Type       | Required                             | Description                                                |
| --------------- | :--------------: | ------------------------------------ | ---------------------------------------------------------- |
| deckProperties  |      object      | optional if `deckId` exists          | properties required to search by name / create a new deck  |
| deckId          | string \| number | optional if `deckProperties` exists  | Id of the existing deck to add notes to                    |
| modelProperties |      object      | optional if `modelId` exists         | Id of the existing model to add notes to                   |
| modelId         | string \| number | optional if `modelProperties` exists | properties required to search by name / create a new model |

## deckProperties object

| Params    |  Type  | Default  | Description                                                                                        |
| --------- | :----: | -------- | -------------------------------------------------------------------------------------------------- |
| reference | string | REQUIRED | Deck reference name to store locally in SharedPreferences                                          |
| name      | string | REQUIRED | Name of the deck to create / add notes to **(Will first search for deck by name before creating)** |

## modelProperties object

| Params         |   Type   | Default  | Description                                                                                                               |
| -------------- | :------: | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| name           |  string  | REQUIRED | Name of the model used / created for notes **(Will first search for deck by name before creating)**                       |
| reference      |  string  | REQUIRED | Model reference name to store locally in SharedPreferences                                                                |
| modelFields    | string[] | REQUIRED | The names of the fields used for the note's model during creation / use _(modelFields.length === valueFields.length)_     |
| cardNames      | string[] | REQUIRED | Names for the front/back sides of the model _(cardNames.length === 2)_                                                    |
| questionFormat | string[] | REQUIRED | Question formatting for each direction of _(questionFormat.length === 2)_ **variable names MUST match modelFields names** |
| answerFormat   | string[] | REQUIRED | Answer formatting for each direction of _(answerFormat.length === 2)_ **variable names MUST match modelFields names**     |
| tags           | string[] | null     | Tags to attach to added notes                                                                                             |
| css            |  string  | null     | css styling information to be shared across all cards. _(null for default CSS)_                                           |

## AnkiDroid Class Instances

- **addNote(valueFields, modelFields)**

  | Param       |   Type   | Description                                                                                                     |
  | ----------- | :------: | --------------------------------------------------------------------------------------------------------------- |
  | valueFields | string[] | The values for the corresponding model fields. **(valueFields.length === modelFields.length)**                  |
  | modelFields | string[] | The model fields that correspond to the model that will be used. **(values must exactly match the model used)** |

## Gotchas

- Once a model or reference has been created with a certain name, the format **must** match for all subsequent cards you wish to create using said model
- If you intend to change the format in any way, you must use new names as a reference

## Example

```javascript
///////////////////////////////////
// SETTING UP THE DECK AND MODEL //
///////////////////////////////////

// Name of deck which will be created in AnkiDroid
const deckName = 'API Sample Name';
// Name of model which will be created in AnkiDroid (can be any string)
const modelName = 'Sample Model Name';
// Used to save a reference to this deck in the SharedPreferences (can be any string)
const dbDeckReference = 'com.your.app.decks';
// Used to save a reference to this model in the SharedPreferences (can be any string)
const dbModelReference = 'com.your.app.models';
// Optional space separated list of tags to add to every note
const tags = ['API_Sample', 'my', 'tags'];
// List of field names that will be used in AnkiDroid model
const modelFields = [
  'Word',
  'Translation',
  'Meaning',
  'Grammar',
  'Idiom',
  'IdiomTranslation',
  'IdiomMeaning',
];
// List of card names that will be used in AnkiDroid (one for each direction of learning)
const cardNames = ['Korean>English', 'English>Korean'];
// CSS to share between all the cards (optional).
const css = `.card {
  font-family: NotoSansKR;
  font-size: 24px;
  text-align: center;
  color: black;
  background-color: white;
  word-wrap: break-word;
}
.big { font-size: 48px; }
.small { font-size: 18px;}`;
// Template for the question of each card
const questionFmt1 = '<div class=big>{{Word}}</div><br>{{Grammar}}';
const questionFmt2 =
  '{{Meaning}}<br><br><div class=small>{{Grammar}}<br><br>({{Idiom}})</div>';
const questionFormat = [questionFmt1, questionFmt2];
// Template for the answer (this example is identical for both sides)
const answerFmt1 = `<div class=big>{{Translation}}</div><br>{{Meaning}}
<br><br>
{{IdiomTranslation}}<br>
<a href=\"#\" onclick=\"document.getElementById('hint').style.display='block';return false;\">Idiom Meaning</a>
<div id="hint" style="display: none">{{IdiomMeaning}}</div>
<br><br>
{{Grammar}}<br><div class=small>{{Tags}}</div>`;
const answerFormat = [answerFmt1, answerFmt1];

//////////////////
// ADDING NOTES //
//////////////////

const deckProperties = {
  name: deckName,
  reference: dbDeckReference,
};
const modelProperties = {
  name: modelName,
  reference: dbModelReference,
  fields: modelFields,
  tags,
  cardNames,
  questionFormat,
  answerFormat,
  css,
};

const valueFields = [
  '사랑',
  'love',
  'The attitude of sincerely caring about someone out of affection.',
  'noun',
  '사랑을 속삭이다',
  'whisper love',
  'For lovers to have a conversation of love.',
];

const settings = {
  modelId: undefined,
  modelProperties: modelProperties,
  deckId: undefined,
  deckProperties: deckProperties,
};

const myAnkiDeck = new AnkiDroid(settings);

myAnkiDeck.addNote(valueFields, modelFields);
// returns a promise that returns the added note ID

const newNote = [
  '여행사',
  'travel agency',
  'A company that offers an array of services for travel, including transportation, accomodaton, tour guide, etc.',
  'noun',
  '',
  '',
  '',
];

myAnkiDeck.addNote(newNote, modelFields);
```

## Demo App

- A demo app is in the example folder. Just cd into the demo app directory and `npm install && npm run android`

## Card setup / References

- [Anki Cards and Templates Documentation](https://apps.ankiweb.net/docs/manual.html#cards-and-templates)
- [AnkiDroid API sample app](https://github.com/ankidroid/apisample) _- this was referenced extensively while making this_

## Todo

- [ ] add basic card
- [ ] AnkiDroid intent API
- [ ] add multiple notes at once
- [x] ~~upload media~~
- [x] ~~add to default deck~~
- [x] ~~create by model ID / deck ID~~
- [x] ~~get selected deck~~
- [x] ~~get model field values~~
- [x] ~~get model list~~
- [x] ~~get deck list~~
- [x] ~~detailed examples~~
- [x] ~~typescript~~

## Contributions

Pull requests welcome!
