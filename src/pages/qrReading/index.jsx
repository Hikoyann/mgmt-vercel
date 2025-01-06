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





import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QrReader } from "react-qr-reader";
import Head from "next/head";
import { Header } from "@/components/Header";
import { BrowserMultiFormatReader } from "@zxing/library";

// export default function Home() {
//   const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
//   const [scanning, setScanning] = useState(true);
//   const videoRef = useRef(null);

//   useEffect(() => {
//     const codeReader = new BrowserMultiFormatReader();

//     // カメラの設定を最適化
//     const constraints = {
//       video: {
//         facingMode: "environment", // 背面カメラを使用
//         width: { ideal: 1280 }, // 解像度は1280x720
//         height: { ideal: 720 },
//         frameRate: { ideal: 60, max: 60 }, // 高フレームレートで素早く読み取る
//       },
//     };

//     // メディアデバイスからストリームを取得
//     navigator.mediaDevices
//       .getUserMedia(constraints)
//       .then((stream) => {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       })
//       .catch((error) => {
//         console.error("カメラの取得に失敗しました:", error);
//       });

//     // QRコードの読み取り設定
//     let lastScanTime = 0;
//     const scanInterval = 100; // ミリ秒単位の間隔。高すぎると性能低下。

//     codeReader.decodeFromVideoDevice(
//       null,
//       videoRef.current,
//       (result, error) => {
//         const currentTime = Date.now();
//         if (currentTime - lastScanTime > scanInterval) {
//           lastScanTime = currentTime;

//           if (result) {
//             const url = result.getText();
//             const urlParams = new URLSearchParams(new URL(url).search);
//             const id = urlParams.get("id");

//             // すでにQRコードIDが読み取られている場合は無視
//             if (id && id >= 1 && id <= 4 && !urls[id]) {
//               setUrls((prevUrls) => ({
//                 ...prevUrls,
//                 [id]: url,
//               }));

//               // 全てのQRコードが読み取れたらスキャンを停止
//               if (Object.values(urls).filter(Boolean).length === 3) {
//                 setScanning(false); // スキャン停止
//                 codeReader.reset(); // 読み取り停止
//               }
//             }
//           }

//           if (error && error !== "NotFoundError") {
//             console.error("QRコードの読み取りエラー:", error);
//           }
//         }
//       }
//     );

//     return () => {
//       // コンポーネントがアンマウントされた場合にストリームを停止
//       if (videoRef.current.srcObject) {
//         const stream = videoRef.current.srcObject;
//         const tracks = stream.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, [urls]);

//   const handleStopScanning = () => {
//     setScanning(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
//       <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
//       <div className="w-full max-w-4xl">
//         {/* カメラ映像 */}
//         <video ref={videoRef} className="w-full bg-black rounded" />

//         {/* 結果表示 */}
//         <div className="mt-4 bg-white shadow rounded p-4">
//           <h2 className="text-lg font-bold">スキャン結果:</h2>
//           <ul className="list-disc list-inside mt-2">
//             {[1, 2, 3, 4].map((id) => (
//               <li key={id}>
//                 <span className="font-bold">QRコード {id}:</span>{" "}
//                 {urls[id] ? (
//                   <a
//                     href={urls[id]}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 underline"
//                   >
//                     {urls[id]}
//                   </a>
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



// import { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
// import { BrowserMultiFormatReader } from "@zxing/library";

export default function QRScannerYOLO() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let model = null;

    const loadModel = async () => {
      try {
        // YOLOモデルのロード
        model = await tf.loadGraphModel("/path/to/yolo/model.json");
        console.log("YOLOモデルをロードしました");
      } catch (error) {
        console.error("YOLOモデルのロードに失敗しました:", error);
      }
    };

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
      }
    };


    const detectObjects = async () => {
      if (!videoRef.current || !canvasRef.current || !model || loading) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const tfImg = tf.browser.fromPixels(video);
      const resizedImg = tf.image.resizeBilinear(tfImg, [640, 640]);
      const expandedImg = resizedImg.expandDims(0).div(255.0);

      const predictions = await model.executeAsync(expandedImg);

      // 検出されたオブジェクトのデータを取得
      const boxes = predictions[0].arraySync()[0];
      const scores = predictions[1].arraySync()[0];
      const classes = predictions[2].arraySync()[0];

      // スコアが一定以上のものを描画
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      boxes.forEach((box, i) => {
        if (scores[i] > 0.5 && classes[i] === 0) {
          // QRコードクラスIDを指定
          const [ymin, xmin, ymax, xmax] = box;
          const x = xmin * canvas.width;
          const y = ymin * canvas.height;
          const width = (xmax - xmin) * canvas.width;
          const height = (ymax - ymin) * canvas.height;

          // 描画
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // QRコード領域の切り抜きとデコード
          const qrCanvas = document.createElement("canvas");
          qrCanvas.width = width;
          qrCanvas.height = height;
          const qrCtx = qrCanvas.getContext("2d");
          qrCtx.drawImage(video, x, y, width, height, 0, 0, width, height);

          const imageData = qrCtx.getImageData(0, 0, width, height);
          const codeReader = new BrowserMultiFormatReader();
          codeReader
            .decodeFromImage(imageData)
            .then((result) => {
              setQrCodeData(result.text);
              setScanning(false);
            })
            .catch((err) => console.error("QRコードデコードエラー:", err));
        }
      });

      tfImg.dispose();
      resizedImg.dispose();
      expandedImg.dispose();
      predictions.forEach((p) => p.dispose());
    };

    const interval = setInterval(detectObjects, 500); // 定期スキャン

    const initialize = async () => {
      setLoading(true);
      await loadModel();
      await startCamera();
      setLoading(false);
    };

    initialize();

    return () => {
      clearInterval(interval);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー（YOLO版）</h1>
      <div className="w-full max-w-4xl">
        {loading ? (
          <p>モデルをロード中...</p>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full bg-black rounded"
            />
            <canvas ref={canvasRef} className="w-full absolute top-0 left-0" />

            {qrCodeData && (
              <div className="mt-4 bg-white shadow rounded p-4">
                <h2 className="text-lg font-bold">スキャン結果:</h2>
                <a
                  href={qrCodeData}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {qrCodeData}
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
