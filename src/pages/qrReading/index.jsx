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





// import { useRef, useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { QrReader } from "react-qr-reader";
// import Head from "next/head";
// import { Header } from "@/components/Header";
// import { BrowserMultiFormatReader } from "@zxing/library";

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



import { useRef, useState, useEffect } from "react";
import { InferenceSession, Tensor } from "onnxjs"; // onnxjsライブラリ
import { BrowserMultiFormatReader } from "@zxing/library"; // QRコード解析用

const QR_CODE_CLASS_ID = 0; // QRコードのクラスID (モデルに合わせて調整)

export default function QRScannerYOLO() {
  const videoRef = useRef(null); // <video>要素への参照
  const [urls, setUrls] = useState({}); // QRコードのURLを保存する状態
  const [scanning, setScanning] = useState(false); // カメラが起動しているかどうか
  const [error, setError] = useState(""); // エラーメッセージ
  const [session, setSession] = useState(null); // YOLOv5の推論セッション

  // YOLOv5モデルのロード
  const loadYOLOModel = async () => {
    try {
      const response = await fetch("/models/yolov5s.onnx");
      if (!response.ok) {
        throw new Error("モデルの読み込みに失敗しました。");
      }
      const buffer = await response.arrayBuffer();
      const yoloSession = new InferenceSession();
      await yoloSession.loadModel(buffer);
      setSession(yoloSession);
    } catch (err) {
      setError(`モデルのロードに失敗しました: ${err.message}`);
      console.error("モデルロードエラー:", err);
    }
  };

  // カメラの起動
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // 背面カメラを使用
      });
      videoRef.current.srcObject = stream; // ビデオ要素にストリームを接続
      videoRef.current.play(); // 再生を開始
      setScanning(true); // スキャン状態に設定
    } catch (err) {
      setError("カメラの起動に失敗しました");
    }
  };

  // QRコード検出
  const detectQR = async () => {
    if (!session || !videoRef.current) return;

    const video = videoRef.current;
    const qrReader = new BrowserMultiFormatReader();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const inputTensor = new Float32Array(canvas.width * canvas.height * 3);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 画像をYOLOv5モデルの入力形式に変換
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b] = [
        imageData.data[i] / 255,
        imageData.data[i + 1] / 255,
        imageData.data[i + 2] / 255,
      ];
      inputTensor[(i / 4) * 3 + 0] = r;
      inputTensor[(i / 4) * 3 + 1] = g;
      inputTensor[(i / 4) * 3 + 2] = b;
    }

    const yoloInput = new Tensor(inputTensor, "float32", [
      1,
      3,
      canvas.height,
      canvas.width,
    ]);

    try {
      const output = await session.run({ input: yoloInput });
      const detections = output.data[0];

      detections.forEach(async (detection) => {
        const [x, y, width, height, confidence, classIndex] = detection;

        if (confidence > 0.5 && classIndex === QR_CODE_CLASS_ID) {
          const [x1, y1, x2, y2] = [
            x * canvas.width,
            y * canvas.height,
            (x + width) * canvas.width,
            (y + height) * canvas.height,
          ];

          // QRコード領域を切り出す
          canvas.width = x2 - x1;
          canvas.height = y2 - y1;
          ctx.drawImage(
            video,
            x1,
            y1,
            x2 - x1,
            y2 - y1,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const croppedData = canvas.toDataURL("image/png");
          const image = new Image();
          image.src = croppedData;

          try {
            const result = await qrReader.decodeFromImage(image);
            if (result) {
              setUrls((prevUrls) => ({
                ...prevUrls,
                [result.text]: result.text, // QRコードのURLを保存
              }));
            }
          } catch (err) {
            console.warn("QRコードの解析に失敗:", err);
          }
        }
      });
    } catch (err) {
      console.error("YOLOv5の推論に失敗:", err);
    }
  };

  useEffect(() => {
    loadYOLOModel(); // ページが読み込まれた時にYOLOモデルをロード

    const interval = setInterval(() => {
      if (scanning) detectQR(); // カメラが起動している時にQRコード検出
    }, 500); // 500msごとに検出

    return () => clearInterval(interval); // クリーンアップ
  }, [scanning]);

  return (
    <div>
      <h1>YOLOv5 QRコードスキャナー</h1>
      <video ref={videoRef} style={{ width: "100%" }} />{" "}
      {/* カメラ映像を表示 */}
      <button onClick={startVideo}>カメラを起動</button>{" "}
      {/* カメラ起動ボタン */}
      {error && <p>{error}</p>} {/* エラーメッセージ */}
      <ul>
        {Object.keys(urls).map((key) => (
          <li key={key}>
            <a href={urls[key]}>{urls[key]}</a>{" "}
            {/* 解析したQRコードのURLを表示 */}
          </li>
        ))}
      </ul>
    </div>
  );
}
