import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push, remove } from "firebase/database";
// import { QRCode } from 'qrcode.react';
import QRCodeLib from "qrcode";
import { Header } from "@/components/Header";

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.query;
  const USER_API_URL = `https://login-8e441-default-rtdb.firebaseio.com/equipmentRegistry/${id}.json`;
  const user = await fetch(USER_API_URL);
  const userData = await user.json();

  const EQUIPMENTS_API_URL = `https://login-8e441-default-rtdb.firebaseio.com/equipments.json`;
  const user_e = await fetch(EQUIPMENTS_API_URL);
  const equipmentsData = await user_e.json();

  return {
    props: {
      mgmt: userData || {}, // コンポーネントにデータを渡す
      _equipments: equipmentsData || {},
    },
  };
};

const Mgmt_ID = ({ mgmt, _equipments = {} }) => {
  // 日付フォーマット関数
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const [user] = useAuthState(auth);

  const [inputs, setInputs] = useState({
    num: "",
    name: "",
    purpose: "",
    returnDate: "",
  });

  const [returnData, setReturnData] = useState({
    num: "",
    name: "",
    purpose: "",
    returnDate: "",
  });

  const [form, setForm] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = mgmt.num;

    if (user) {
      const updatedInputs = {
        ...inputs,
        equipmentNum: mgmt.num,
        equipmentName: mgmt.equipmentName,
        email: user.email,
      };

      await set(
        ref(database, `equipments/${id}`),
        updatedInputs
      );
      setForm([...form, updatedInputs]);
      setInputs({
        num: "",
        name: "",
        purpose: "",
        returnDate: "",
      });
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();

    if (user && borrowedItem) {
      const equipmentRef = ref(
        database,
        `equipments/${borrowedItem.equipmentNum}`
      ); // borrowedItem.equipmentNumを使用

      // データを削除
      await remove(equipmentRef);
      console.log("備品データが削除されました。");

      // 返却後にフォームをリセット
      setReturnData({
        num: "",
        name: "",
        purpose: "",
        returnDate: "",
      });
    }
  };


  const shouldShowReturnForm = () => {
    if (!user || !_equipments) return false;

    return Object.values(_equipments).some(
      (equipment) =>
        equipment && // equipmentが存在することを確認
        equipment.email === user.email &&
        String(equipment.equipmentNum) === String(mgmt.num)
    );
  };

  const getMyBorrowedItem = () => {
    if (!user || !_equipments) return null;

    const borrowedItem = Object.values(_equipments).find((equipment) => {
      // equipment が null または undefined でないことを確認
      if (equipment) {
        return (
          equipment.email === user.email &&
          String(equipment.equipmentNum) === String(mgmt.num)
        );
      }
      return false;
    });

    return borrowedItem || null;
  };

  const borrowedItem = getMyBorrowedItem();


  return (
    <>
      <Head>
        <title>{mgmt.equipmentName} - 備品レンタル情報</title>
      </Head>
      <div>
        <Header />
        <div>
          <h1>備品情報</h1>
          <div>備品番号: {mgmt.num}</div>
          <div>備品名: {mgmt.equipmentName}</div>
          <div>備品情報: {mgmt.equipmentDetails}</div>
          <div>登録した日付: {formatDate(mgmt.addedDate)}</div>
        </div>

        <div>
          {user ? (
            Object.keys(_equipments).length === 0 ||
            !Object.values(_equipments).some((equipment) => {
              return equipment && String(equipment.equipmentNum) === String(mgmt.num);
            }) ? (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">備品レンタルフォーム</h2>
                <form onSubmit={handleSubmit} className="mt-2">
                  <div className="mb-4">
                    <label className="block">番号</label>
                    <input
                      type="number"
                      name="num"
                      value={inputs.num}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block">借りる人の名前</label>
                    <input
                      type="text"
                      name="name"
                      value={inputs.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block">使用用途</label>
                    <input
                      type="text"
                      name="purpose"
                      value={inputs.purpose}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block">返却予定日</label>
                    <input
                      type="date"
                      name="returnDate"
                      value={inputs.returnDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
                    <button type="submit">送信</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-4">
                この備品は既に借りられているため、レンタルフォームは表示できません。
              </div>
            )
          ) : (
            <div className="mb-4">
              サインインをしていないため、レンタルフォームは表示できません。
            </div>
          )}
        </div>
        <div>
          {user ? (
            shouldShowReturnForm() ? (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">返却フォーム</h2>
                {borrowedItem && (
                  <div className="mt-2">
                    <h3>あなたが借りている備品情報</h3>
                    <div>備品番号: {borrowedItem.equipmentNum}</div>
                    <div>番号: {borrowedItem.num}</div>
                    <div>備品番号: {borrowedItem.name}</div>
                    <div>備品名: {borrowedItem.equipmentName}</div>
                    <div>用途: {borrowedItem.purpose}</div>
                    <div>返却予定日: {borrowedItem.returnDate}</div>
                    <div>備品番号: {borrowedItem.email}</div>
                    <h2>
                      あなたが借りている備品情報と合っていれば返却をしてください。
                    </h2>
                  </div>
                )}
                <form onSubmit={handleReturn} className="mt-2">
                  <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
                    <button type="submit">返却する</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-4">返却フォームは表示できません。</div>
            )
          ) : (
            <div className="mb-4">サインインをしてください。</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Mgmt_ID;