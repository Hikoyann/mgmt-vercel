// const handleResult = (decodedText) => {
//     console.log("QRコードの結果:", decodedText); // ここでQRコードの結果をコンソールに出力

//     const urlPattern = /equipmentRegistry\/(\d+)\?id=(\d+)/;
//     const match = decodedText.match(urlPattern);

//     if (match) {
//       const [_, pathId, queryId] = match;

//       // スキャン済みURLの追加（重複防止）
//       setScannedUrls((prev) => {
//         const exists = prev.some(
//           (entry) => entry.pathId === pathId && entry.queryId === queryId
//         );
//         return exists ? prev : [...prev, { pathId, queryId }];
//       });

//       // カウント管理
//       setScanCount((prev) => {
//         const updatedCount = { ...prev };
//         if (!updatedCount[pathId]) updatedCount[pathId] = new Set();
//         updatedCount[pathId].add(queryId);
//         return updatedCount;
//       });
//     }
//   };


// import { BrowserMultiFormatReader } from "@zxing/library";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library"; // 通常のインポート方法に戻します

export default function Home() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [scanning, setScanning] = useState(true);
  const [firstUrl, setFirstUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // カメラの設定
    const constraints = {
      video: {
        facingMode: "environment", // 背面カメラを使用
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 },
      },
    };

    // メディアデバイスからストリームを取得
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((error) => {
          console.error("カメラの再生に失敗しました:", error);
        });
      } catch (error) {
        console.error("カメラの取得に失敗しました:", error);
        alert("カメラにアクセスできませんでした。");
      }
    };

    getCameraStream();

    // QRコードの読み取り設定
    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (result) {
          const url = result.getText();
          const urlParams = new URLSearchParams(new URL(url).search);
          const id = urlParams.get("id");

          // 最初に読み取ったURLがまだ設定されていない場合はそれを設定
          if (!firstUrl) {
            setFirstUrl(url);
          }

          // 最初に読み取ったURLと一致したQRコードだけを許可
          if (
            firstUrl &&
            url === firstUrl &&
            id &&
            id >= 1 &&
            id <= 4 &&
            !urls[id]
          ) {
            setUrls((prevUrls) => ({
              ...prevUrls,
              [id]: url,
            }));

            // すべてのQRコードが読み取れたらスキャンを停止
            if (Object.values(urls).filter(Boolean).length === 3) {
              setScanning(false);
              codeReader.reset(); // 読み取り停止
            }
          }
        }

        if (error && error !== "NotFoundError") {
          console.error("QRコードの読み取りエラー:", error);
        }
      }
    );

    return () => {
      // コンポーネントがアンマウントされた場合にカメラを停止
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [urls, firstUrl]);

  const handleStopScanning = () => {
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      <div className="w-full max-w-4xl">
        {/* カメラ映像 */}
        <video
          ref={videoRef}
          className="w-full h-auto bg-black rounded object-cover" // object-cover を追加
        />

        {/* 結果表示 */}
        <div className="mt-4 bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold">スキャン結果:</h2>
          <ul className="list-disc list-inside mt-2">
            {[1, 2, 3, 4].map((id) => (
              <li key={id}>
                <span className="font-bold">QRコード {id}:</span>{" "}
                {urls[id] ? (
                  <>
                    <a
                      href={urls[id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {urls[id]}
                    </a>
                    <span className="text-gray-500"> (ID: {id})</span>
                  </>
                ) : (
                  <span className="text-gray-500">スキャン結果待ち...</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* スキャン停止ボタン */}
        {scanning && (
          <button
            onClick={handleStopScanning}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            スキャン停止
          </button>
        )}
      </div>
    </div>
  );
}
