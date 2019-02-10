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

// TODO: What to do with the module?
AnkiDroid;
```
