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



// import { useState, useEffect, useRef } from "react";
// import { BrowserMultiFormatReader } from "@zxing/library"; // 通常のインポート方法

// export default function Home() {
//   const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
//   const [scanning, setScanning] = useState(true);
//   const [firstUrl, setFirstUrl] = useState(null); // 最初に取得したURLを格納
//   const videoRef = useRef(null);

//   useEffect(() => {
//     const codeReader = new BrowserMultiFormatReader();

//     // カメラの設定
//     const constraints = {
//       video: {
//         facingMode: "environment", // 背面カメラを使用
//         width: { ideal: 1280 },
//         height: { ideal: 720 },
//         frameRate: { ideal: 60, max: 60 },
//       },
//     };

//     // メディアデバイスからストリームを取得
//     const getCameraStream = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia(constraints);
//         videoRef.current.srcObject = stream;
//         videoRef.current.play().catch((error) => {
//           console.error("カメラの再生に失敗しました:", error);
//         });
//       } catch (error) {
//         console.error("カメラの取得に失敗しました:", error);
//         alert("カメラにアクセスできませんでした。");
//       }
//     };

//     getCameraStream();

//     // QRコードの読み取り設定
//     codeReader.decodeFromVideoDevice(
//       null,
//       videoRef.current,
//       (result, error) => {
//         if (result) {
//           const scannedUrl = result.getText();
//           const urlParams = new URLSearchParams(new URL(scannedUrl).search);
//           const id = urlParams.get("id");

//           // 最初に読み取ったURLを保存
//           if (!firstUrl) {
//             setFirstUrl(scannedUrl); // 最初に読み取ったURLを保存
//           }

//           // IDが1〜4の範囲であれば、そのURLを保存
//           if (id && id >= 1 && id <= 4) {
//             // すでにそのIDが読み取られている場合はスキップ
//             if (!urls[id]) {
//               setUrls((prevUrls) => {
//                 const updatedUrls = { ...prevUrls, [id]: scannedUrl };

//                 // すべてのQRコードが読み取れたらスキャンを停止
//                 if (Object.values(updatedUrls).filter(Boolean).length === 4) {
//                   setScanning(false);
//                   codeReader.reset(); // QRコード読み取りを停止

//                   // すべて読み取れたら最初のURLへ移動
//                   window.location.href = firstUrl; // 最初に読み取ったURLへ移動
//                 }

//                 return updatedUrls;
//               });
//             }
//           }
//         }

//         if (error && error !== "NotFoundError") {
//           console.error("QRコードの読み取りエラー:", error);
//         }
//       }
//     );

//     return () => {
//       // コンポーネントがアンマウントされた場合にカメラを停止
//       if (videoRef.current.srcObject) {
//         const stream = videoRef.current.srcObject;
//         const tracks = stream.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, [firstUrl, urls]);

//   const handleStopScanning = () => {
//     setScanning(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
//       <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
//       <div className="w-full max-w-4xl">
//         {/* カメラ映像 */}
//         <video
//           ref={videoRef}
//           className="w-full h-auto bg-black rounded object-cover" // object-cover を追加
//         />

//         {/* 最初のURLを表示 */}
//         {firstUrl && (
//           <div className="mt-4 bg-white shadow rounded p-4">
//             <h2 className="text-lg font-bold">最初に取得したURL:</h2>
//             <p>
//               <a
//                 href={firstUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 underline"
//               >
//                 {firstUrl}
//               </a>
//             </p>
//           </div>
//         )}

//         {/* 結果表示 */}
//         <div className="mt-4 bg-white shadow rounded p-4">
//           <h2 className="text-lg font-bold">スキャン結果:</h2>
//           <ul className="list-disc list-inside mt-2">
//             {[1, 2, 3, 4].map((id) => (
//               <li key={id}>
//                 <span className="font-bold">QRコード {id}:</span>{" "}
//                 {urls[id] ? (
//                   <>
//                     <a
//                       href={urls[id]}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-500 underline"
//                     >
//                       {urls[id]}
//                     </a>
//                     <span className="text-gray-500"> (ID: {id})</span>
//                   </>
//                 ) : (
//                   <span className="text-gray-500">スキャン結果待ち...</span>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* スキャン停止ボタン */}
//         {scanning && (
//           <button
//             onClick={handleStopScanning}
//             className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
//           >
//             スキャン停止
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import dynamic from "next/dynamic";

// QRコードスキャナーを動的に読み込む
const QrReader = dynamic(() => import("react-qr-scanner"), { ssr: false });

const QrCodePage = () => {
  const [scannedIds, setScannedIds] = useState(new Set()); // 読み取ったID番号のセット
  const [message, setMessage] = useState(""); // ステータスメッセージ

  // QRコード読み取り時の処理
  const handleScan = (data) => {
    if (data) {
      const url = data.text; // 読み取ったURL
      const baseUrl = "https://example.com"; // QRコードのベースURL（例）
      const idParam = "id="; // IDパラメータのキー
      if (url.startsWith(baseUrl) && url.includes(idParam)) {
        const id = url.split(idParam)[1]; // ID番号を抽出
        if (id && !scannedIds.has(id)) {
          setScannedIds((prevIds) => new Set([...prevIds, id])); // ID番号をセットに追加
          setMessage(`ID ${id} を認識しました！`);

          // すべてのID (1～4) を認識したらURLにリダイレクト
          if ([...scannedIds, id].length === 4) {
            setMessage("すべてのQRコードを認識しました。リダイレクト中...");
            window.location.href = url; // URL へ移動
          }
        } else {
          setMessage(`ID ${id} はすでに認識済みです。`);
        }
      } else {
        setMessage("無効なQRコードです。");
      }
    }
  };

  const handleError = (error) => {
    console.error("QRコード読み取りエラー:", error);
    setMessage("QRコードの読み取り中にエラーが発生しました。");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <QrReader
          delay={300}
          style={{ width: "100%" }}
          onError={handleError}
          onScan={handleScan}
        />
      </div>
      <div className="mt-4 text-center">
        {message && <p className="text-blue-500">{message}</p>}
        <p className="text-gray-700 mt-2">
          認識済みID: {[...scannedIds].join(", ") || "なし"}
        </p>
      </div>
    </div>
  );
};

export default QrCodePage;
