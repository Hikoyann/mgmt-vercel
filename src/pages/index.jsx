import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, set, push } from "firebase/database";

function Home() {
  const [user] = useAuthState(auth);
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

  const [inputs, setInputs] = useState({
    num: "",
    name: "",
    equipment: "",
    purpose: "",
    returnDate: "",
  });

  const [inputs_2, setInputs_2] = useState({
    equipmentName: "",
    equipmentDetails: "",
  });

  const [form, setForm] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (user) { // ログイン状態を確認
      const equipmentRef = ref(database, "equipments");
      const newEquipmentRef = push(equipmentRef);

      const updatedInputs = {
        ...inputs,
        email: user.email,
      };

      // データベースに送信
      set(newEquipmentRef, updatedInputs);
      setForm([...form, updatedInputs]);
      setInputs({ num: "", name: "", equipment: "", purpose: "", returnDate: "" });
    }
  };

  const handleChange_2 = (e) => {
    const { name, value } = e.target;
    setInputs_2({ ...inputs_2, [name]: value });
  };

  const handleSubmit_2 = async (e) => {
    e.preventDefault();

    if (user) {
      // 別のパスを指定 (例えば 'equipmentRegistry')
      const inventoryRef = ref(database, "equipmentRegistry");
      const snapshot = await get(inventoryRef);

      // 2. データの総数を取得して、新しい番号を決定
      const equipmentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      const newEquipmentNum = equipmentCount + 1;
      const newInventoryRef = push(inventoryRef);

      const updatedInputs = {
        num: newEquipmentNum,
        equipmentName: inputs_2.equipmentName,
        equipmentDetails: inputs_2.equipmentDetails,
        addedDate: new Date().toISOString(), // 追加の日付
        email: user.email, // 登録したメールアドレス
      };

      // Firebaseデータベースの別のパスに送信
      await set(newInventoryRef, updatedInputs);

      // フォームのリセット
      setInputs_2({ equipmentName: "", equipmentDetails: "" });
    }
  };



  return (
    <div className="bg-gray-300 min-h-screen flex flex-col items-center">
      <div>
        <div className="w-full flex justify-between p-4">
          <a href="#" className="text-blue-600 font-bold">
            備品管理アプリ
          </a>
          {!user && (
            <div className="inline-block bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out mt-4">
              <SignInButton />
            </div>
          )}
        </div>
        <div className="mt-5 w-full">
          {user && (
            <div className="t-4 text-center flex flex-col items-center">
              <UserInfo user={user} />
            </div>
          )}
        </div>

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
                <div>備品名: {mgmt.equipment}</div>
                <div>使用用途: {mgmt.purpose}</div>
                <div>返却予定日: {mgmt.returnDate}</div>
                <div>メールアドレス: {mgmt.email}</div>
              </div>
            );
          })}
        </div>

        <div className="w-full">
          {user ? (
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
                  <label className="block">備品名</label>
                  <input
                    type="text"
                    name="equipment"
                    value={inputs.equipment}
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
              レンタルフォームを使用するには、サインインしてください。
            </div>
          )}
        </div>

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

export default Home;
