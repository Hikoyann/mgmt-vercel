import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
// Googleログイン関数
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // メールアドレスを取得
    const email = user.email;

    // ドメインが@ous.jpかどうかを確認
    if (email && email.endsWith("@ous.jp")) {
      console.log("アクセス許可: @ous.jp ドメインのメールアドレス");
      // @ous.jp ドメインのユーザーに対してアクセスを許可する処理
    } else {
      console.log("アクセス拒否: @ous.jp ドメイン以外のメールアドレス");
      // @ous.jp ドメインでない場合はアクセス拒否の処理
    }
  } catch (error) {
    console.error("Googleログインに失敗しました:", error.message);
  }
};

export { auth, database, storage, provider, signInWithGoogle };