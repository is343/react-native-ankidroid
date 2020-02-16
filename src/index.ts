import { Deck } from './ankidroid';
import {
  checkPermission,
  getDeckList,
  getFieldList,
  getModelList,
  getSelectedDeckName,
  isApiAvailable,
  requestPermission,
} from './utilities';

const AnkiDroid = {
  Deck,
  isApiAvailable,
  checkPermission,
  requestPermission,
  getSelectedDeckName,
  getDeckList,
  getModelList,
  getFieldList,
};

export default AnkiDroid;
