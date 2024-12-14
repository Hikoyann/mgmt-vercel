import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QrReader } from "react-qr-reader";
import Head from "next/head";
import { Header } from "@/components/Header";

export default function MultiQRCodeScanner() {
  const [scannedData, setScannedData] = useState([]); // スキャンしたQRコードのID
  const [scanCount, setScanCount] = useState({}); // 各URLのIDカウント
  const router = useRouter();

  // QRコードをスキャンしたときの処理
  const handleResult = (result) => {
    if (result?.text) {
      // URL/id=? の形式を解析してURLとidを取り出す
      const urlPattern = /(https?:\/\/[^\s]+)\/id=(\d+)/;
      const match = result.text.match(urlPattern);

      if (match) {
        const url = match[1]; // QRコードのURL部分を取得
        const id = match[2]; // QRコードのID部分を取得

        // IDが1、2、3、4のいずれかの場合のみカウントを更新
        if (["1", "2", "3", "4"].includes(id)) {
          // 同じURLがスキャンされた場合、そのURLのカウントを更新
          setScanCount((prevScanCount) => {
            const newScanCount = { ...prevScanCount };

            // URLがまだ登録されていなければ、カウントを初期化
            if (!newScanCount[url]) {
              newScanCount[url] = new Set();
            }

            // 同じIDがスキャンされていない場合、そのIDを追加
            if (!newScanCount[url].has(id)) {
              newScanCount[url].add(id);
            }

            return newScanCount;
          });

          // スキャンしたデータにURLを追加（重複しないように）
          setScannedData((prevData) => {
            if (!prevData.some((item) => item.url === url)) {
              return [...prevData, { url, id }];
            }
            return prevData;
          });
        }
      }
    }
  };

  // すべてのID（1, 2, 3, 4）が揃った場合に移動
  useEffect(() => {
    // 各URLに対応するIDが1, 2, 3, 4すべて揃った場合
    for (const [url, ids] of Object.entries(scanCount)) {
      if (
        ids.size === 4 &&
        Array.from(ids).every((id) => ["1", "2", "3", "4"].includes(id))
      ) {
        alert(`すべてのQRコードが揃いました。移動します！`);
        router.push(url); // 対応するURLに移動
        return;
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
        <div>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>QRコードスキャナー</h1>
            <p>カメラでQRコードを4つスキャンしてください。</p>

            {/* QRコードリーダー */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "600px",
                margin: "auto",
              }}
            >
              <QrReader
                onResult={handleResult}
                constraints={{ facingMode: "environment" }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3>スキャン結果</h3>
              <ul>
                {scannedData.map((data, index) => (
                  <li key={index}>{`URL: ${data.url}, ID: ${data.id}`}</li>
                ))}
              </ul>
              <h4>スキャン回数</h4>
              <ul>
                {Object.entries(scanCount).map(([url, ids]) => (
                  <li key={url}>
                    {url} - スキャンされたID: {Array.from(ids).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
