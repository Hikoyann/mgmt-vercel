import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";
import { Header } from "@/components/Header";

export function Mgmt() {
  const [mgmts, setMgmt] = useState([]);

  const getEquipment = useCallback(async () => {
    const res = await fetch(
      "https://login-8e441-default-rtdb.firebaseio.com/equipments.json"
    );
    const json = await res.json();
    const equipmentArray = Object.keys(json).map((key) => ({
      id: key,
      ...json[key],
    }));
    setMgmt(equipmentArray);
  }, []);

  useEffect(() => {
    getEquipment();
  }, [getEquipment]);

  return (
    <div>
      <div className="w-full">
        <h1 className="mt-5 text-xl font-bold">借りてる人</h1>
      </div>
      {mgmts.map((mgmt, index) => {
        return (
          <div key={index} className="mgmt-item mt-4">
            <div>登録順: {index + 1}</div>
            <div>番号: {mgmt.num}</div>
            <div>名前: {mgmt.name}</div>
            <div>備品名: {mgmt.equipmentName}</div>
            <div>使用用途: {mgmt.purpose}</div>
            <div>返却予定日: {mgmt.returnDate}</div>
            <div>メールアドレス: {mgmt.email}</div>
          </div>
        );
      })}
    </div>
  );
}
