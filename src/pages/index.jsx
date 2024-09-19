import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
//login-8e441-default-rtdb.firebaseio.com/counter.json

function Home() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState();

  const getJson = useCallback(async () => {
    const res = await fetch(
      "https://login-8e441-default-rtdb.firebaseio.com/counter.json"
    );
    const json = await res.json();
    setData(json);
    console.log(json);
  }, [])

  useEffect(() => {
    getJson();
  }, [getJson])

  return (
    <div className="bg-gray-300 min-h-screen">
      <div className="text-center">
        <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
          {user ? <SignOutButton /> : <SignInButton />}
        </div>
        <div className="mt-5">
          {user && (
            <div className="t-4 text-center flex flex-col items-center">
              <UserInfo user={user} />
            </div>
          )}
        </div>
        <div>
          {data && (
            <div>
              <h1>Counter Data</h1>
              <p>Count: {data.count}</p>
              <p>Name: {data.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SignInButton() {
  const signInWithGoogle = () => {
    // ログイン
    signInWithPopup(auth, provider);
  };

  return <button onClick={signInWithGoogle}>サインイン</button>;
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>サインアウト</button>;
}

function UserInfo({ user }) {
  return (
    <div className="userInfo">
      <img
        className="w-24 h-24 rounded-full mb-4"
        src={user.photoURL || "defaultImage.jpg"}
        alt="Profile"
      />
      <p className="text-lg">{user.displayName || "Anonymous User"}</p>
    </div>
  );
}

export default Home;
