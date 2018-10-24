// tslint:disable object-literal-sort-keys no-submodule-imports
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { AuthProvider } from './models/AuthProvider';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENSER_ID,
};
const fire = firebase.initializeApp(config);
export const authProviders = new Map<AuthProvider, firebase.auth.AuthProvider>([
  ['Password', new firebase.auth.EmailAuthProvider()],
  ['Google', new firebase.auth.GoogleAuthProvider()],
  ['GitHub', new firebase.auth.GithubAuthProvider()],
  ['Facebook', new firebase.auth.FacebookAuthProvider()],
  ['Twitter', new firebase.auth.TwitterAuthProvider()],
]);
export const emailAuthProvider = firebase.auth.EmailAuthProvider; // パスワード認証追加時に必要
export default fire;
