# react-native-react-native-anki-droid

## Getting started

`$ npm install react-native-react-native-anki-droid --save`

### Mostly automatic installation

`$ react-native link react-native-react-native-anki-droid`

### Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-react-native-anki-droid` and add `RNReactNativeAnkiDroid.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNReactNativeAnkiDroid.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`

- Add `import com.is343.reactnativeankidroid.RNAnkiDroidPackage;` to the imports at the top of the file
- Add `new RNAnkiDroidPackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
   ```
   include ':react-native-react-native-anki-droid'
   project(':react-native-react-native-anki-droid').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-react-native-anki-droid/android')
   ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
   ```
     compile project(':react-native-react-native-anki-droid')
   ```

## Usage

```javascript
import RNReactNativeAnkiDroid from "react-native-react-native-anki-droid";

// TODO: What to do with the module?
RNReactNativeAnkiDroid;
```
