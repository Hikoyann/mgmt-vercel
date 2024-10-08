import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";
import { Header } from "@/components/Header";
import { Mgmt } from "@/components/Mgmt";
import { Register } from "@/components/Register";



function Home() {
  return (
    <div>
      <Header />
      <Mgmt />
    </div>
  );
}

export default Home;
