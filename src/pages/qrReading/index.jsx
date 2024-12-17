import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QrReader } from "react-qr-reader";
import Head from "next/head";
import { Header } from "@/components/Header";

export default function MultiQRCodeScanner() {
  const [scanCount, setScanCount] = useState({}); // URLごとのIDセット
  const [scannedUrls, setScannedUrls] = useState([]); // 認識したURLとID番号
  const router = useRouter();

  // QRコード読み取り時の処理
  const handleResult = (result) => {
    if (result?.text) {
      console.log("QRコード読み取り結果:", result.text); // デバッグログ
      const urlPattern = /(https?:\/\/[^\s]+)\/id=(\d+)/;
      const match = result.text.match(urlPattern);

      if (match) {
        const url = match[1];
        const id = match[2];

        // 認識URLとIDをリストに追加 (重複を防ぐ)
        setScannedUrls((prev) => {
          const exists = prev.find(
            (entry) => entry.url === url && entry.id === id
          );
          return exists ? prev : [...prev, { url, id }];
        });

        // URLごとのIDセットを更新
        if (["1", "2", "3", "4"].includes(id)) {
          setScanCount((prev) => {
            const updatedCount = { ...prev };
            if (!updatedCount[url]) {
              updatedCount[url] = new Set();
            }
            updatedCount[url].add(id);
            return updatedCount;
          });
        }
      }
    }
  };

  // QRコード4つが揃ったらURLへ移動
  useEffect(() => {
    for (const [url, ids] of Object.entries(scanCount)) {
      if (ids.size === 4) {
        alert(`全てのQRコードが揃いました！${url}へ移動します。`);
        router.push(url);
        break;
      }
    }
  }, [scanCount, router]);

  return (
    <div>
      <Head>
        <title>QRコードカメラ</title>
      </Head>
      <div>
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
            <h3 className="text-xl font-semibold">認識したURLとID</h3>
            <ul className="list-disc list-inside">
              {scannedUrls.map((entry, index) => (
                <li key={index} className="text-gray-700">
                  URL: <span className="font-semibold">{entry.url}</span> - ID:{" "}
                  <span className="text-blue-600">{entry.id}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* スキャン状態表示 */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold">スキャン状況</h3>
            {Object.entries(scanCount).map(([url, ids]) => (
              <div key={url} className="mt-2">
                <p>
                  <span className="font-bold">{url}</span> - 認識ID:{" "}
                  {[...ids].join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
