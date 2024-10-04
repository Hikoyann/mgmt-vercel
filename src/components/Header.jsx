import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";

export function Header() {
  const [user] = useAuthState(auth);

  return (
    <div>
      <div className="w-full p-4 flex justify-around items-center">
        {/* 備品管理アプリのタイトル */}
        <div>
          <a href="#" className="text-blue-600 text-xl font-bold">
            備品管理アプリ
          </a>
        </div>
        {/* サインインボタン */}
        <div>
          {!user && (
            <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <SignInButton />
            </div>
          )}
        </div>
      </div>
      <div>
        {user && (
          <div>
            <UserInfo user={user} />
          </div>
        )}
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
      <div className="text-lg hover:cursor-pointer">
        {user.email || "Anonymous User"}
      </div>
      {/* メールアドレスをホバーしたときにサインアウトボタンを表示 */}
      <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}