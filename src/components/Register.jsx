import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";

export function Register() {
  const [user] = useAuthState(auth);

  const [inputs_2, setInputs_2] = useState({
    equipmentName: "",
    equipmentDetails: "",
  });

  const handleChange_2 = (e) => {
    const { name, value } = e.target;
    setInputs_2({ ...inputs_2, [name]: value });
  };

  const handleSubmit_2 = async (e) => {
    e.preventDefault();

    if (user) {
      const inventoryRef = ref(database, "equipmentRegistry");
      const snapshot = await get(inventoryRef);

      // 2. データの総数を取得して、新しい番号を決定
      // 既存のデータから最大の番号を取得
      let maxEquipmentNum = 0;
      if (snapshot.exists()) {
        const existingData = snapshot.val();
        for (const key in existingData) {
          const equipmentNum = existingData[key].num; // 既存の番号
          if (equipmentNum > maxEquipmentNum) {
            maxEquipmentNum = equipmentNum;
          }
        }
      }

      const newEquipmentNum = maxEquipmentNum + 1;
      // const newInventoryRef = push(inventoryRef);
      const qrDataUrl = `https://mgmt-vercel.vercel.app/equipmentRegistry/${newEquipmentNum}`;

      // QRコードを生成
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrDataUrl);

      const updatedInputs = {
        num: newEquipmentNum,
        equipmentName: inputs_2.equipmentName,
        equipmentDetails: inputs_2.equipmentDetails,
        qrCode: qrCodeDataUrl,
        addedDate: new Date().toISOString(), // 追加の日付
        email: user.email, // 登録したメールアドレス
      };

      // Firebaseデータベースの別のパスに送信
      await set(
        ref(database, `equipmentRegistry/${newEquipmentNum}`),
        updatedInputs
      );

      // フォームのリセット
      setInputs_2({ equipmentName: "", equipmentDetails: "" });
    }
  };

  return (
    <div>

      <div className="w-full">
        {user ? (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">備品登録フォーム</h2>
            <form onSubmit={handleSubmit_2}>
              <div className="mb-4">
                <label>備品名</label>
                <input
                  type="text"
                  name="equipmentName"
                  value={inputs_2.equipmentName}
                  onChange={handleChange_2}
                  required
                />
              </div>
              <div className="mb-4">
                <label>備品の詳細</label>
                <input
                  type="text"
                  name="equipmentDetails"
                  value={inputs_2.equipmentDetails}
                  onChange={handleChange_2}
                  required
                />
              </div>
              <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
                <button type="submit" className="submit-button">
                  送信
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-4">
            登録フォームを使用するには、サインインしてください。
          </div>
        )}
      </div>
    </div>
  );
}
