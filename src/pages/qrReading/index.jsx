import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QrReader } from "react-qr-reader";
import Head from "next/head";
import { Header } from "@/components/Header";

export default function MultiQRCodeScanner() {
  const [scanCount, setScanCount] = useState({}); // 各サイトごとのIDセット
  const [scannedUrls, setScannedUrls] = useState([]); // 認識したURLとID番号一覧
  const router = useRouter();

  // QRコード読み取り時の処理
  const handleResult = (result) => {
    if (result?.text) {
      console.log("QRコード読み取り結果:", result.text); // デバッグ用ログ
      const urlPattern = /equipmentRegistry\/(\d+)\?id=(\d+)/; // パスIDとクエリIDを取り出す正規表現
      const match = result.text.match(urlPattern);

      if (match) {
        const pathId = match[1]; // パスID（equipmentRegistry/{数字}）
        const queryId = match[2]; // クエリID（?id={数字}）

        console.log("パスID:", pathId, "クエリID:", queryId);

        // 認識したURLとIDを一覧に追加（重複防止）
        setScannedUrls((prev) => {
          const exists = prev.some(
            (entry) => entry.pathId === pathId && entry.queryId === queryId
          );
          if (!exists) {
            return [...prev, { pathId, queryId }];
          }
          return prev;
        });

        // スキャン状態を更新（パスIDごとにIDセット管理）
        setScanCount((prev) => {
          const updatedCount = { ...prev };
          if (!updatedCount[pathId]) {
            updatedCount[pathId] = new Set();
          }
          updatedCount[pathId].add(queryId);
          return updatedCount;
        });
      } else {
        console.log("QRコードのフォーマットが不正です:", result.text);
      }
    }
  };

  // パスIDごとにクエリID（1, 2, 3, 4）が揃ったら移動する
  useEffect(() => {
    for (const [pathId, ids] of Object.entries(scanCount)) {
      if (ids.size === 4) {
        // クエリID（1, 2, 3, 4）が全て揃ったら
        const redirectUrl = `https://mgmt-vercel.vercel.app/equipmentRegistry/${pathId}`;
        alert(`全てのQRコードが揃いました！${redirectUrl} へ移動します。`);
        router.push(redirectUrl); // リダイレクト
        break;
      }
    }
  }, [scanCount, router]);

  return (
    <div>
      <Head>
        <title>QRコードスキャナー</title>
      </Head>
      <Header />
      <div className="text-center mt-12">
        <h1 className="text-2xl font-bold">QRコードスキャナー</h1>
        <p className="text-gray-600">
          カメラでQRコードをスキャンしてください。
        </p>

        {/* QRコードリーダー */}
        <div className="relative w-full max-w-lg mx-auto">
          <QrReader
            onResult={(result, error) => {
              if (result?.text) handleResult(result);
              if (error) console.log("エラー:", error);
            }}
            scanDelay={300}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%" }}
          />
        </div>

        {/* 認識したURLとID一覧 */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold">認識したQRコード一覧</h3>
          <ul className="list-disc list-inside">
            {scannedUrls.map((entry, index) => (
              <li key={index} className="text-gray-700">
                パスID: <span className="font-semibold">{entry.pathId}</span> -
                クエリID: <span className="text-blue-600">{entry.queryId}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* スキャン状態表示 */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold">スキャン状況</h3>
          {Object.entries(scanCount).map(([pathId, ids]) => (
            <div key={pathId} className="mt-2">
              <p>
                パスID: <span className="font-bold">{pathId}</span> - 認識ID:{" "}
                {[...ids].sort().join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
