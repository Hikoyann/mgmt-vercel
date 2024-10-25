import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push, remove } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";
import QRCode from "qrcode.react";

export function Equipment() {
  const [mgmts, setMgmt] = useState([]);
  const [user] = useAuthState(auth);

  const getEquipment = useCallback(async () => {
    const res = await fetch(
      "https://login-8e441-default-rtdb.firebaseio.com/equipmentRegistry.json"
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("この備品を削除しますか？");
    if (confirmed) {
      await remove(ref(database, `equipmentRegistry/${id}`));
      setMgmt((prev) => prev.filter((mgmt) => mgmt.id !== id)); // 状態を更新
      alert("削除しました");
    }
  };

  return (
    <div>
      <div className="w-full">
        <h1 className="mt-5 text-xl font-bold">備品一覧</h1>
      </div>
      {user ? (
        <div>
          {mgmts
            .filter((mgmt) => mgmt.num) // 備品番号があるものだけをフィルタリング
            .map((mgmt, index) => {
              return (
                <div key={index} className="mgmt-item mt-4 border p-4 rounded">
                  <div>登録順: {index + 1}</div>
                  <div>備品番号: {mgmt.num}</div>
                  <div>備品名: {mgmt.equipmentName}</div>
                  <div>
                    <h2>写真:</h2>
                    {mgmt.photo ? (
                      <img
                        src={mgmt.photo}
                        alt="備品の写真"
                        style={{ width: "128px", height: "128px" }}
                      />
                    ) : (
                      <div>写真が見つかりません</div>
                    )}
                  </div>
                  <div>備品情報: {mgmt.equipmentDetails}</div>
                  <div>メールアドレス: {mgmt.email}</div>
                  <div>登録日: {formatDate(mgmt.addedDate)}</div>
                  <div className="mt-4">
                    <h2>QRコード:</h2>
                    {mgmt.qrCode ? (
                      <div>
                        <img
                          src={mgmt.qrCode}
                          alt="QRコード"
                          style={{ width: "128px", height: "128px" }}
                        />
                        <a
                          href={mgmt.qrCode}
                          download={`qr_code_${mgmt.num}.png`}
                          className="mt-2 inline-block bg-blue-500 text-white py-1 px-2 rounded"
                        >
                          QRコードをダウンロード
                        </a>
                      </div>
                    ) : (
                      <div>QRコードが見つかりません</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(mgmt.id)}
                    className="mt-2 bg-gray-500 text-white py-1 px-2 rounded"
                  >
                    削除
                  </button>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="mb-4">
          備品一覧を閲覧するには、サインインしてください。
        </div>
      )}
    </div>
  );
};
