import QRcode from "@/components/QRcode";
import QRScanner from "../../components/QRScanner";
import { Header } from "@/components/Header";
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>備品登録 Form</title>
      </Head>
      <Header/>
      <div>
        <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
        {/* <QRScanner /> */}
        <QRcode />
      </div>
    </div>
  );
}
