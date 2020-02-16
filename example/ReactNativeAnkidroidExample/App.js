/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { Button, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AnkiDroid from 'react-native-ankidroid';
import { Colors, Header } from 'react-native/Libraries/NewAppScreen';


// Name of deck which will be created in AnkiDroid
const deckName = "API Sample Name";
// Name of model which will be created in AnkiDroid (can be any string)
const modelName = "Sample Model Name";
// Used to save a reference to this deck in the SharedPreferences (can be any string)
const dbDeckReference = "com.your.app.decks";
// Used to save a reference to this model in the SharedPreferences (can be any string)
const dbModelReference = "com.your.app.models";
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
const questionFmt1 = "<div class=big>{{Word}}</div><br>{{Grammar}}";
const questionFmt2 =
  "{{Meaning}}<br><br><div class=small>{{Grammar}}<br><br>({{Idiom}})</div>";
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

// const myAnkiDeck = new AnkiDroid.Deck(deckModelSetup);

// myAnkiDeck.addNote(valueFields);
// // returns a promise that returns the added note ID

const newNote = [
  "여행사",
  "travel agency",
  "A company that offers an array of services for travel, including transportation, accomodaton, tour guide, etc.",
  "noun",
  "",
  "",
  ""
];

// myAnkiDeck.addNote(newNote);


const App = () => {
  const [apiAvailable, setApiAvailable] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState(false);
  const [decks, setDecks] = React.useState([]);
  const [models, setModels] = React.useState([]);
  const [fields, setFields] = React.useState([]);
  const [showDecks, setShowDecks] = React.useState(false);
  const [showModels, setShowModels] = React.useState(false);
  const [deckName, setDeckName] = React.useState('');
  const [modelIdentifier, setModelIdentifier] = React.useState('');

  const getDeckList = async () => {
    const [error, deckList] = await AnkiDroid.getDeckList();
    if (deckList) {
      setDecks(deckList)
    }
  }

  const getModelList = async () => {
    const [error, modelList] = await AnkiDroid.getModelList();
    if (modelList) {
      setModels(modelList)
    }
  }

  const getFieldList = async (identifier) => {
    let modelName = null;
    let modelId = null;
    if (isNaN(Number(identifier))) {
      modelName = identifier;
    } else {
      modelId = identifier;
    }
    const [error, fieldList] = await AnkiDroid.getFieldList(modelName, modelId);
    if (fieldList) {
      setFields(fieldList)
    }
  }

  const getSelectedDeckName = async () => {
    const [error, selectedDeckName] = await AnkiDroid.getSelectedDeckName();
    if (selectedDeckName) {
      setDeckName(selectedDeckName)
    }
  }

  const getApiStatus = async () => {
    setApiAvailable(await AnkiDroid.isApiAvailable());
  }

  const getPermissionStatus = async () => {
    setHasPermission(await AnkiDroid.checkPermission());
  }

  const requestPermission = async () => {
    const [error, result] = await AnkiDroid.requestPermission();
    if (result) {
      setHasPermission(result === 'granted');
    }
  }

  React.useEffect(() => {
    getApiStatus();
    getPermissionStatus();
    getDeckList();
    getModelList();
    getSelectedDeckName();
    getFieldList();
  }, []);

  React.useEffect(() => {
    if (hasPermission) {
      getDeckList();
      getModelList();
    }
  }, [hasPermission]);

  const handleShowDecksPress = () => {
    if (!decks.length) {
      getDeckList();
    }
    setShowDecks(prevValue => !prevValue);
  }

  const handleShowModelsPress = () => {
    if (!models.length) {
      getModelList();
    }
    setShowModels(prevValue => !prevValue);
  }

  const renderList = (list) => list.map((item, index) => {
    return (<View key={index}>
      <Text selectable style={styles.sectionDescription}>{`Name: ${item.name}`}</Text>
      <Text selectable style={styles.sectionDescription}>{`ID: ${item.id}`}</Text>
    </View>)
  });

  const renderFieldList = (fields) => fields.map((field, index) => {
    return <Text key={index} style={styles.sectionDescription}>{field}</Text>
  })

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{`Api available: ${apiAvailable ? 'Yes' : 'No'}`}</Text>
              <Text style={styles.sectionTitle}>{`Has permission: ${hasPermission ? 'Yes' : 'No'}`}</Text>
              <Button
                onPress={requestPermission}
                title="Request Permission"
              />
              <Text style={styles.sectionTitle}>{`Selected deck name:`}</Text>
              <Text selectable style={styles.sectionDescription}>{deckName}</Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{`Existing decks:`}</Text>
              <Button
                onPress={handleShowDecksPress}
                title={`${showDecks ? 'Hide' : 'Show'} Deck List`}
              />
              {showDecks && renderList(decks)}
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{`Existing models:`}</Text>
              <Button
                onPress={handleShowModelsPress}
                title={`${showModels ? 'Hide' : 'Show'} Model List`}
              />
              {showModels && renderList(models)}
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{`Get model fields by model name or ID`}</Text>
              <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={text => setModelIdentifier(text)}
                value={modelIdentifier}
              />
              <Button
                onPress={() => getFieldList(modelIdentifier)}
                title={'search'}
              />
              {!!fields && renderFieldList(fields)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
