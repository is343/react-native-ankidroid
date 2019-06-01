# react-native-ankidroid

React Native wrapper for the AnkiDroid API

- [AnkiDroid API documentation](https://github.com/ankidroid/Anki-Android/wiki/AnkiDroid-API)

## Getting started

`npm install react-native-ankidroid --save`

### Mostly automatic installation

`react-native link react-native-ankidroid`

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
     compile project(':react-native-ankidroid')
   ```
4. Add the following line to `/android/app/src/main/res/AndroidManifest.xml`:

   ```java
   <manifest xmlns:android="http://schemas.android.com/apk/res/android"
       xmlns:tools="http://schemas.android.com/tools"
       package="com.yourpackage.name">

       <uses-permission android:name="android.permission.INTERNET" />
       <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

       <application
         android:name="com.yourpackage.name.MainApplication"
         android:label="@string/app_name"
         android:icon="@mipmap/ic_launcher"
         android:allowBackup="false"
         android:theme="@style/AppTheme"
         tools:replace="android:allowBackup" // <---- ADD HERE
         >
   ```

This will prevent the following error by forcing the compiler to use your app's attribute:

    Execution failed for task ':app:processDebugManifest'.
    > Manifest merger failed : Attribute application@allowBackup value=(false) from AndroidManifest.xml:15:7-34 is also present at [com.ichi2.anki:api:1.1.0alpha6] AndroidManife
    st.xml:14:9-35 value=(true).
    Suggestion: add 'tools:replace="android:allowBackup"' to <application> element at AndroidManifest.xml:7:5-117 to override.

## Usage

```javascript
import AnkiDroid from "react-native-ankidroid";

await AnkiDroid.isApiAvailable();
```

AnkiDroid.**\_\_\_\_\_\_\_\_\_\_\_\_**
**(All methods return Promises)**

- **isApiAvailable()** - checks if the AnkiDroid API is avaiable (AnkiDroid is installed on the device)
  _in order to access the API, AnkiDroid may need to be installed before the react native app_
- **checkPermission()**
- **requestPermission(rationale)**
  -- rationale (optional)
- **addNote(noteData, permissionRationale)**
  -- noteData (see below)
  -- permissionRationale (optional)

## noteData object

| Params           |   Type   | Required | Default | Description                                                                                                               |
| ---------------- | :------: | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| dbDeckReference  |  string  | true     | --      | Deck reference name to store locally in SharedPreferences                                                                 |
| dbModelReference |  string  | true     | --      | Model reference name to store locally in SharedPreferences                                                                |
| modelFields      | string[] | true     | --      | The names of the fields used for the note's model during creation / use _(modelFields.length === valueFields.length)_     |
| valueFields      | string[] | true     | --      | The values for the corresponding model fields. _(valueFields.length === modelFields.length)_                              |
| cardNames        | string[] | true     | --      | Names for the front/back sides of the model _(cardNames.length === 2)_                                                    |
| questionFormat   | string[] | true     | --      | Question formatting for each direction of _(questionFormat.length === 2)_ **variable names MUST match modelFields names** |
| answerFormat     | string[] | true     | --      | Answer formatting for each direction of _(answerFormat.length === 2)_ **variable names MUST match modelFields names**     |
| modelName        |  string  | true     | --      | Name of the model used / created for notes                                                                                |
| deckName         |  string  | true     | --      | Name of the deck to create / add notes to                                                                                 |
| tags             | string[] | false    | null    | Tags to attach to added notes                                                                                             |
| css              |  string  | false    | null    | css styling information to be shared across all cards. _(null for default CSS)_                                           |

## Gotchas

- Once a model or reference has been created with a certain name, the format **must** match for all subsequent cards you wish to create using said model
- If you intend to change the format in any way, you must use new names as a reference

## Example

```javascript
///////////////////////////////////
// SETTING UP THE DECK AND MODEL //
///////////////////////////////////

// Name of deck which will be created in AnkiDroid
const deckName = "API Sample";
// Name of model which will be created in AnkiDroid (can be any string)
const modelName = "com.yourapp.apisample";
// Used to save a reference to this deck in the SharedPreferences (can be any string)
const dbDeckReference = "com.your.app.api.decks";
// Used to save a reference to this model in the SharedPreferences (can be any string)
const dbModelReference = "com.your.app.api.models";
// Optional space separated list of tags to add to every note
const tags = ["API_Sample", "my", "tags"];
// List of field names that will be used in AnkiDroid model
const modelFields = [
  "Word",
  "Translation",
  "Meaning",
  "Grammar",
  "Idiom",
  "IdiomTranslation",
  "IdiomMeaning"
];
// List of card names that will be used in AnkiDroid (one for each direction of learning)
const cardNames = ["Korean>English", "English>Korean"];
// CSS to share between all the cards (optional). User will need to install the NotoSans font by themselves
const css =
  ".card {\n" +
  " font-family: NotoSansKR;\n" +
  " font-size: 24px;\n" +
  " text-align: center;\n" +
  " color: black;\n" +
  " background-color: white;\n" +
  " word-wrap: break-word;\n" +
  "}\n" +
  "@font-face { font-family: \"NotoSansKR\"; src: url('_NotoSansKR-Regular.otf'); }\n" +
  "@font-face { font-family: \"NotoSansKR\"; src: url('_NotoSansKR-Bold.otf'); font-weight: bold; }\n" +
  "\n" +
  ".big { font-size: 48px; }\n" +
  ".small { font-size: 18px;}\n";
// Template for the question of each card
const questionFmt1 = "<div class=big>{{Word}}</div><br>{{Grammar}}";
const questionFmt2 =
  "{{Meaning}}<br><br><div class=small>{{Grammar}}<br><br>({{Idiom}})</div>";
const questionFormat = [questionFmt1, questionFmt2];
// Template for the answer (this example is identical for both sides)
const answerFmt1 =
  "<div class=big>{{Translation}}</div><br>{{Meaning}}\n" +
  "<br><br>\n" +
  "{{IdiomTranslation}}<br>\n" +
  "<a href=\"#\" onclick=\"document.getElementById('hint').style.display='block';return false;\">Idiom Meaning</a>\n" +
  '<div id="hint" style="display: none">{{IdiomMeaning}}</div>\n' +
  "<br><br>\n" +
  "{{Grammar}}<br><div class=small>{{Tags}}</div>";
const answerFormat = [answerFmt1, answerFmt1];

//////////////////
// ADDING NOTES //
//////////////////

const deckModelSetup = {
  deckName,
  modelName,
  dbDeckReference,
  dbModelReference,
  modelFields,
  tags,
  cardNames,
  questionFormat,
  answerFormat,
  css
};

const valueFields = [
  "사랑",
  "love",
  "The attitude of sincerely caring about someone out of affection.",
  "noun",
  "사랑을 속삭이다",
  "whisper love",
  "For lovers to have a conversation of love."
];

AnkiDroid.addNote({ ...deckModelSetup, valueFields });
// returns the added note ID

const noteData = {
  ...deckModelSetup,
  valueFields: [
    "여행사",
    "travel agency",
    "A company that offers an array of services for travel, including transportation, accomodaton, tour guide, etc.",
    "noun",
    "",
    "",
    ""
  ]
};

AnkiDroid.addNote(noteData);
```

## Card setup / References

- [Anki Cards and Templates Documentation](https://apps.ankiweb.net/docs/manual.html#cards-and-templates)
- [AnkiDroid API sample app](https://github.com/ankidroid/apisample) _- this was referenced extensively while making this_

## Todo

- [ ] add to default deck
- [ ] add basic card
- [ ] AnkiDroid intent API
- [ ] add multiple notes at once
- [x] ~~detailed examples~~
- [x] ~~typescript~~

## Contributions

Pull requests welcome!
