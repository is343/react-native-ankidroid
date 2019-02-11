# react-native-ankidroid

## Getting started

`$ npm install react-native-ankidroid --save`

### Mostly automatic installation

`$ react-native link react-native-ankidroid`

### Manual installation

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`

- Add `import com.is343.reactnativeankidroid.AnkiDroidPackage;` to the imports at the top of the file
- Add `new AnkiDroidPackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
   ```
   include ':react-native-ankidroid'
   project(':react-native-ankidroid').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-ankidroid/android')
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

AnkiDroid.**\_\_\_\_\_\_\_**

- **getPermissionName**
- **isApiAvailable** - checks if the AnkiDroid is avaiable (AnkiDroid is installed on the device)
- **checkPermission**
- **requestPermission**
- **addNote**

## addNote

| Params           |   Type   | Required | Default | Description                                                                                                               |
| ---------------- | :------: | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| dBDeckReference  |  string  | True     | --      | Deck reference name to store locally with the AnkiDroid database                                                          |
| dBModelReference |  string  | True     | --      | Model reference name to store locally with the AnkiDroid database                                                         |
| modelFields      | string[] | True     | --      | The names of the fields used for the note's model during creation / use _(modelFields.length === valueFields.length)_     |
| valueFields      | string[] | True     | --      | The values for the corresponding model fields. _(valueFields.length === modelFields.length)_                              |
| cardNames        | string[] | True     | --      | Names for the front/back sides of the model _(cardNames.length === 2)_                                                    |
| questionFormat   | string[] | True     | --      | Question formatting for each direction of _(questionFormat.length === 2)_ **variable names MUST match modelFields names** |
| answerFormat     | string[] | True     | --      | Answer formatting for each direction of _(answerFormat.length === 2)_ **variable names MUST match modelFields names**     |
| modelName        |  string  | True     | --      | Name of the model used / created for notes                                                                                |
| deckName         |  string  | False    | null    | Name of the deck to create / add notes to _(null for Default Deck)_                                                       |
| tags             | string[] | False    | null    | Tags to attach to added notes                                                                                             |
| css              |  string  | False    | null    | css styling information to be shared across all cards. _(null for default CSS)_                                           |

## Card setup references

- [Anki Cards and Templates Documentation](https://apps.ankiweb.net/docs/manual.html#cards-and-templates)
- [AnkiDroid API documentation](https://github.com/ankidroid/Anki-Android/wiki/AnkiDroid-API)
- [AnkiDroid API sample app](https://github.com/ankidroid/apisample) _- this was referenced extensively while making this_

## Todo

- add multiple notes at once
- add basic card
- AnkiDroid intent API
- add more documentation within code
- typescript
