import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, set, push } from "firebase/database";

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


  return (
    <div className="bg-gray-300 min-h-screen flex flex-col items-center">
      <div className="">
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
        <div className="mt-5">
          {user && (
            <div className="t-4 text-center flex flex-col items-center">
              <UserInfo user={user} />
            </div>
          )}
        </div>

        <div>
          <div>
            <h1 className="mt-5">借りてる人</h1>
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

        <div>
          {user ? (
            <div className="mt-4">
              <h2>備品レンタルフォーム</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>番号</label>
                  <input
                    type="number"
                    name="num"
                    value={inputs.num}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>借りる人の名前</label>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>備品名</label>
                  <input
                    type="text"
                    name="equipment"
                    value={inputs.equipment}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>使用用途</label>
                  <input
                    type="text"
                    name="purpose"
                    value={inputs.purpose}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>返却予定日</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={inputs.returnDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit">送信</button>
              </form>
            </div>
          ) : (
            <div>フォームを使用するには、サインインしてください。</div>
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
    // <div className="userInfo">
    //   <div className="text-lg">{user.email || "Anonymous User"}</div>
    // </div>
    // <div className="userInfo relative">
    //   <div className="text-lg">{user.email || "Anonymous User"}</div>
    //   <div className="absolute mt-2 hidden group-hover:block">
    //     <SignOutButton />
    //   </div>
    // </div>
    <div className="userInfo relative group">
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
