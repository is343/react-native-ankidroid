import { Deck } from './ankidroid';
import {
  checkPermission,
  getDeckList,
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
};

export default AnkiDroid;
