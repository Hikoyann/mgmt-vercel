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


















import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [qrResults, setQrResults] = useState([]);

  useEffect(() => {
    const loadOpenCV = async () => {
      if (typeof window === "undefined") return;
      const script = document.createElement("script");
      script.src = "https://docs.opencv.org/4.x/opencv.js";
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);
    };

    loadOpenCV();
  }, []);

  useEffect(() => {
    if (!loaded || !videoRef.current || !canvasRef.current) return;

    let streaming = false;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const startVideoStream = async () => {
      const constraints = {
        video: {
          facingMode: "environment", // 背面カメラ
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();
        streaming = true;
      } catch (err) {
        console.error("カメラアクセスに失敗しました:", err);
      }
    };

    const detectQRCode = () => {
      if (!streaming) return;

      const ctx = canvas.getContext("2d");
      const width = video.videoWidth;
      const height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);
      const src = cv.imread(canvas); // OpenCV用画像取得
      const gray = new cv.Mat();
      const qrDecoder = new cv.QRCodeDetector();

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY); // グレースケール化

      const points = new cv.Mat(); // QRコードの位置座標
      const result = new cv.MatVector(); // 検出結果

      const decoded = qrDecoder.detectAndDecodeMulti(gray, points, result);
      if (decoded) {
        const codes = [];
        for (let i = 0; i < result.size(); i++) {
          codes.push(result.get(i).data);
        }
        setQrResults(codes);
      }

      // 後処理
      src.delete();
      gray.delete();
      points.delete();
      result.delete();

      requestAnimationFrame(detectQRCode); // ループ処理
    };

    startVideoStream().then(() => detectQRCode());

    return () => {
      if (video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [loaded]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      <video ref={videoRef} className="w-full max-w-md bg-black rounded" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-4 bg-white shadow rounded p-4 w-full max-w-md">
        <h2 className="text-lg font-bold">検出結果:</h2>
        <ul className="list-disc list-inside mt-2">
          {qrResults.length > 0 ? (
            qrResults.map((result, index) => (
              <li key={index}>
                <span className="font-bold">QRコード {index + 1}:</span>{" "}
                <span className="text-blue-500">{result}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500">スキャン結果待ち...</li>
          )}
        </ul>
      </div>
    </div>
  );
}
