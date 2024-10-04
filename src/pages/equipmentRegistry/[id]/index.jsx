import Head from "next/head";

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.query;
  const USER_API_URL = `https://login-8e441-default-rtdb.firebaseio.com/equipmentRegistry/${id}.json`;
  const user = await fetch(USER_API_URL);
  const userData = await user.json();

  return {
    props: {
      mgmt: userData, // コンポーネントにデータを渡す
    },
  };
};

const ID = ({ mgmt }) => {
  // 日付フォーマット関数
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Head>
        <title>{mgmt.equipmentName} - 備品レンタル情報</title>
      </Head>

      <div>
        <h1>備品情報</h1>
        <div>番号: {mgmt.num}</div>
        <div>備品名: {mgmt.equipmentName}</div>
        <div>使用用途: {mgmt.equipmentDetails}</div>
        <div>登録した日付: {formatDate(mgmt.addedDate)}</div>
      </div>
    </>
  );
};

export default ID;