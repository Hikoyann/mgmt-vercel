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



import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library"; // 通常のインポート方法

export default function Home() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [scanning, setScanning] = useState(true);
  const [firstUrl, setFirstUrl] = useState(null); // 最初に取得したURLを格納
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // QRコードの枠を描画するキャンバス
  const codeReader = useRef(new BrowserMultiFormatReader()).current; // QRコードリーダーのインスタンス

  useEffect(() => {
    const constraints = {
      video: {
        facingMode: "environment", // 背面カメラを使用
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60, max: 60 },
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

    // QRコードの枠を描画する関数
    const drawFrames = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // ビデオのサイズを取得
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // 枠の設定
      const frameSize = 150; // 枠のサイズ
      const margin = 5; // 枠の間隔

      // 左上、右上、左下、右下に枠を配置
      const positions = [
        { x: margin, y: margin }, // 左上
        { x: videoWidth - frameSize - margin, y: margin }, // 右上
        { x: margin, y: videoHeight - frameSize - margin }, // 左下
        {
          x: videoWidth - frameSize - margin,
          y: videoHeight - frameSize - margin,
        }, // 右下
      ];

      context.clearRect(0, 0, canvas.width, canvas.height); // 前の枠をクリア

      // 枠を描画
      positions.forEach((pos) => {
        context.beginPath();
        context.rect(pos.x, pos.y, frameSize, frameSize);
        context.lineWidth = 5;
        context.strokeStyle = "#FF0000"; // 枠の色を赤に設定
        context.stroke();
      });
    };

    // QRコードの読み取り処理
    const handleScan = (result, error) => {
      if (result) {
        const scannedUrl = result.getText();
        const urlParams = new URLSearchParams(new URL(scannedUrl).search);
        const id = urlParams.get("id");

        // 最初に取得したURLを設定
        if (!firstUrl) {
          setFirstUrl(scannedUrl);
        }

        // 枠内のQRコードが検出された場合のみ認識する
        drawFrames();

        // IDが1〜4の範囲であれば、そのURLを保存
        if (id && id >= 1 && id <= 4) {
          if (!urls[id]) {
            setUrls((prevUrls) => {
              const updatedUrls = { ...prevUrls, [id]: scannedUrl };

              if (Object.values(updatedUrls).filter(Boolean).length === 4) {
                setScanning(false);
                codeReader.reset(); // QRコード読み取りを停止
                window.location.href = firstUrl; // 最初に読み取ったURLへ移動
              }

              return updatedUrls;
            });
          }
        }
      }

      if (error && error !== "NotFoundError") {
        console.error("QRコードの読み取りエラー:", error);
      }
    };

    // QRコードをカメラ映像から読み取る
    codeReader.decodeFromVideoDevice(null, videoRef.current, handleScan);

    return () => {
      // コンポーネントがアンマウントされた場合にカメラを停止
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [firstUrl, urls]);

  const handleStopScanning = () => {
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QRコードスキャナー</h1>
      <div className="w-full max-w-4xl relative">
        {/* カメラ映像 */}
        <video
          ref={videoRef}
          className="w-full h-auto bg-black rounded object-cover" // object-cover を追加
        />

        {/* QRコードの枠を描画するキャンバス */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* 最初のURLを表示 */}
        {firstUrl && (
          <div className="mt-4 bg-white shadow rounded p-4">
            <h2 className="text-lg font-bold">最初に取得したURL:</h2>
            <p>
              <a
                href={firstUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {firstUrl}
              </a>
            </p>
          </div>
        )}

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
