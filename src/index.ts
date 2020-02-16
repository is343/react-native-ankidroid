import { Deck } from './ankidroid';
import {
  checkPermission,
  getDeckList,
  isApiAvailable,
  requestPermission,
} from './utilities';

const AnkiDroid = {
  Deck,
  isApiAvailable,
  checkPermission,
  requestPermission,
  getDeckList,
};

export default AnkiDroid;
