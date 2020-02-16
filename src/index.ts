import { Deck } from './ankidroid';
import {
  checkPermission,
  getDeckList,
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
};

export default AnkiDroid;
