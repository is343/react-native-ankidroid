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

## Usage

```javascript
import AnkiDroid from "react-native-ankidroid";

AnkiDroid.isApiAvailable();
```

AnkiDroid.**\_\_\_\_\_\_\_\_\_\_\_\_**

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
| dbDeckReference  |  string  | true     | --      | Deck reference name to store locally with the AnkiDroid database                                                          |
| dbModelReference |  string  | true     | --      | Model reference name to store locally with the AnkiDroid database                                                         |
| modelFields      | string[] | true     | --      | The names of the fields used for the note's model during creation / use _(modelFields.length === valueFields.length)_     |
| valueFields      | string[] | true     | --      | The values for the corresponding model fields. _(valueFields.length === modelFields.length)_                              |
| cardNames        | string[] | true     | --      | Names for the front/back sides of the model _(cardNames.length === 2)_                                                    |
| questionFormat   | string[] | true     | --      | Question formatting for each direction of _(questionFormat.length === 2)_ **variable names MUST match modelFields names** |
| answerFormat     | string[] | true     | --      | Answer formatting for each direction of _(answerFormat.length === 2)_ **variable names MUST match modelFields names**     |
| modelName        |  string  | true     | --      | Name of the model used / created for notes                                                                                |
| deckName         |  string  | false    | null    | Name of the deck to create / add notes to _(null for Default Deck)_                                                       |
| tags             | string[] | false    | null    | Tags to attach to added notes                                                                                             |
| css              |  string  | false    | null    | css styling information to be shared across all cards. _(null for default CSS)_                                           |

## Card setup / References

- [Anki Cards and Templates Documentation](https://apps.ankiweb.net/docs/manual.html#cards-and-templates)
- [AnkiDroid API sample app](https://github.com/ankidroid/apisample) _- this was referenced extensively while making this_

## Todo

- [ ] add multiple notes at once
- [ ] add basic card
- [ ] AnkiDroid intent API
- [ ] detailed examples
- [x] ~~typescript~~
