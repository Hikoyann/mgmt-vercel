import React, { useCallback, useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, database, provider } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, set, push } from "firebase/database";

function Home() {
  const [user] = useAuthState(auth);
  const [data, setData] = useState();
  const [mgmts, setMgmt] = useState([]);

  const getJson = useCallback(async () => {
    const res = await fetch(
      "https://login-8e441-default-rtdb.firebaseio.com/counter.json"
    );
    const json = await res.json();
    setData(json);
    console.log(json);
  }, [])

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
    // console.log(json);
  }, []);

  useEffect(() => {
    getJson();
    getEquipment();
  }, [getJson, getEquipment]);

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

    const equipmentRef = ref(database, "equipments");
    const newEquipmentRef = push(equipmentRef); // 一意のキーを自動生成
    set(newEquipmentRef, inputs)

    setForm([...form, inputs]);
    setInputs({ num: "", name: "", equipment: "", purpose: "", returnDate: "" });
  };


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

        <div>
          {mgmts.map((mgmt, index) => {
            return (
              <div key={index} className="mgmt-item">
                <p>登録順: {index + 1}</p>
                <p>番号: {mgmt.num}</p>
                <p>名前: {mgmt.name}</p>
                <p>備品名: {mgmt.equipment}</p>
                <p>使用用途: {mgmt.purpose}</p>
                <p>返却予定日: {mgmt.returnDate}</p>
              </div>
            );
          })}
        </div>

        <div>
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
