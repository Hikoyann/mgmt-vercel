import QRcode from "@/components/QRcode";
import QRScanner from "../../components/QRScanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      {/* <QRScanner /> */}
      <QRcode />
    </div>
  );
}
