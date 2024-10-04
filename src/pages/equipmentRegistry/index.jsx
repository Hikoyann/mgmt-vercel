import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";

const Posts = () => {
  return (
    <>
      <Head>
        <title>備品一覧 Page</title>
      </Head>

      <div>
        <h1>aaa</h1>
      </div>
    </>
  );
};

export default Posts;
