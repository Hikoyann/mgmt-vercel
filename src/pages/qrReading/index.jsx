// import { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// import { Header } from "@/components/Header";

// export default function MultiQRCodeScanner() {
//   const [scanCount, setScanCount] = useState({}); // スキャンしたQRコードのカウント
//   const [scannedUrls, setScannedUrls] = useState([]); // 認識済みのURL一覧
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [opencvLoaded, setOpencvLoaded] = useState(false);
//   const router = useRouter();

//   // OpenCVのロードを確認
//   useEffect(() => {
//     const loadOpenCV = () => {
//       if (window.cv && window.cv.getBuildInformation) {
//         setOpencvLoaded(true);
//         startCamera(window.cv); // OpenCVがロードされたらカメラを開始
//       } else {
//         setTimeout(loadOpenCV, 100); // OpenCVがロードされるまで再試行
//       }
//     };
//     loadOpenCV();
//   }, []);

//   // QRコードの結果を処理
//   const handleResult = (decodedText) => {
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

//   // カメラを開始してフレーム処理
//   const startCamera = (cv) => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const qrCodeDetector = new cv.QRCodeDetector();

//     // 明示的にgetUserMediaを呼び出して、カメラの権限を要求
//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then((stream) => {
//         video.srcObject = stream;
//         video.play();

//         const processFrame = () => {
//           // OpenCVがロードされているかつ、カメラの映像が準備できているかチェック
//           if (!opencvLoaded || video.videoWidth === 0) {
//             requestAnimationFrame(processFrame);
//             return;
//           }

//           // フレームをキャンバスに描画
//           const ctx = canvas.getContext("2d");
//           canvas.width = video.videoWidth;
//           canvas.height = video.videoHeight;
//           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//           // OpenCVでQRコードを検出
//           const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//           const src = cv.matFromImageData(imageData);
//           const points = new cv.Mat();
//           const decodedText = qrCodeDetector.detectAndDecode(src, points);

//           if (decodedText && decodedText !== "") {
//             console.log("QR Code detected:", decodedText); // QRコードが検出された場合のログ
//             handleResult(decodedText);
//           } else {
//             console.log("QRコードが検出されませんでした"); // QRコードが検出されなかった場合のログ
//           }

//           // メモリ解放
//           src.delete();
//           points.delete();

//           requestAnimationFrame(processFrame); // 次のフレーム処理
//         };

//         // 最初のフレーム処理を開始
//         requestAnimationFrame(processFrame);
//       })
//       .catch((error) => {
//         console.error("カメラアクセスエラー:", error);
//         alert("カメラにアクセスできませんでした。設定を確認してください。");
//       });
//   };

//   // 全てのQRコードが揃ったらリダイレクト
//   useEffect(() => {
//     for (const [pathId, ids] of Object.entries(scanCount)) {
//       if (ids.size === 4) {
//         const redirectUrl = `https://mgmt-vercel.vercel.app/equipmentRegistry/${pathId}`;
//         alert(`全てのQRコードが揃いました！ ${redirectUrl} へ移動します。`);
//         router.push(redirectUrl);
//         break;
//       }
//     }
//   }, [scanCount, router]);

//   return (
//     <div>
//       <Head>
//         <title>QRコードスキャナー</title>
//         <script async src="https://docs.opencv.org/4.x/opencv.js"></script>
//       </Head>
//       <Header />
//       <div className="text-center mt-12">
//         <h1 className="text-2xl font-bold">QRコードスキャナー</h1>
//         <p className="text-gray-600">
//           カメラでQRコードをスキャンしてください。
//         </p>

//         {/* カメラ映像 */}
//         <div className="relative mx-auto" style={{ maxWidth: "640px" }}>
//           <video ref={videoRef} style={{ width: "100%" }} />
//           <canvas ref={canvasRef} style={{ display: "none" }} />
//         </div>

//         {!opencvLoaded && <p>Loading OpenCV...</p>}

//         {/* 認識済みのQRコード */}
//         <div className="mt-6">
//           <h3 className="text-xl font-semibold">認識したQRコード一覧</h3>
//           <ul className="list-disc list-inside">
//             {scannedUrls.map((entry, index) => (
//               <li key={index} className="text-gray-700">
//                 パスID: <span className="font-semibold">{entry.pathId}</span> -
//                 クエリID: <span className="text-blue-600">{entry.queryId}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* スキャン状況 */}
//         <div className="mt-6">
//           <h3 className="text-xl font-semibold">スキャン状況</h3>
//           {Object.entries(scanCount).map(([pathId, ids]) => (
//             <div key={pathId} className="mt-2">
//               <p>
//                 パスID: <span className="font-bold">{pathId}</span> - 認識ID:{" "}
//                 {[...ids].sort().join(", ")}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QrReader } from "react-qr-reader";
import Head from "next/head";
import { Header } from "@/components/Header";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function Home() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (result) {
          const url = result.getText();
          const urlParams = new URLSearchParams(new URL(url).search);
          const id = urlParams.get("id");

          if (id && id >= 1 && id <= 4) {
            setUrls((prevUrls) => ({
              ...prevUrls,
              [id]: url, // IDに基づいて対応するURLを設定
            }));
          }
        }
        if (error) {
          console.error(error);
        }
      }
    );

    return () => {
      codeReader.reset();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      <div className="w-full max-w-4xl">
        {/* カメラ映像 */}
        <video ref={videoRef} className="w-full bg-black rounded" />

        {/* 結果表示 */}
        <div className="mt-4 bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold">スキャン結果:</h2>
          <ul className="list-disc list-inside mt-2">
            {[1, 2, 3, 4].map((id) => (
              <li key={id}>
                <span className="font-bold">QRコード {id}:</span>{" "}
                {urls[id] ? (
                  <a
                    href={urls[id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {urls[id]}
                  </a>
                ) : (
                  <span className="text-gray-500">スキャン結果待ち...</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
