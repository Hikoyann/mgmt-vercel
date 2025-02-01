import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/router";

export default function QRcode() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [scanning, setScanning] = useState(true); // すべてのQRコードの読み取りが終わるまで待機
  const [failedUrls, setFailedUrls] = useState([]); // 損傷判定URLを押したQRコードIDを管理
  const videoRef = useRef(null);
  const router = useRouter(); // Next.jsのrouterをインポート

  const [firstUrl, setFirstUrl] = useState(null); // 最初に読み取ったURL
  const [loadingUrls, setLoadingUrls] = useState([1, 2, 3, 4]); // スキャン待ちのQRコードIDを管理

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // カメラの設定
    const constraints = {
      video: {
        facingMode: "environment", // 背面カメラを使用
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 60, max: 60 },
      },
    };

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
          const scannedUrl = result.getText();
          const urlParams = new URLSearchParams(new URL(scannedUrl).search);
          const id = urlParams.get("id");

          if (id && id >= 1 && id <= 4) {
            // QRコードが読み取れたら、URLを保存
            setUrls((prevUrls) => {
              const updatedUrls = { ...prevUrls, [id]: scannedUrl };

              // スキャン待ちのIDを削除
              setLoadingUrls((prev) => prev.filter((item) => item !== id));

              // 最初に読み取ったURLを保存
              if (!firstUrl) {
                setFirstUrl(scannedUrl);
              }

              // すべてのQRコードが読み取れたら判定処理
              const allScanned =
                Object.values(updatedUrls).filter(Boolean).length === 4;

              if (allScanned) {
                const allDamaged = Object.values(updatedUrls).every(
                  (url) => url === "損傷判定URL"
                );
                setScanning(false); // すべてのQRコードの情報を取得したのでスキャンを終了

                if (allDamaged) {
                  // すべて損傷判定URLなら、"/"に戻る
                  router.push("/");
                } else {
                  // URLが読み取られていればその最初のURLに移動
                  if (firstUrl) {
                    router.push(firstUrl); // 最初に読み取られたURLへ移動
                  }
                }
              }

              return updatedUrls;
            });
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
  }, [firstUrl, urls, router]);

  // URL読み取りに失敗したQRコードのIDを管理
  const handleFailScan = (id) => {
    setFailedUrls((prev) => [...prev, id]); // 代替URLが必要なIDを追加
    setLoadingUrls((prev) => prev.filter((item) => item !== id)); // スキャン待ちIDから削除

    // 損傷ボタンを押した場合、代替URLとして判定
    setUrls((prevUrls) => {
      const updatedUrls = { ...prevUrls, [id]: "損傷判定URL" };
      return updatedUrls;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl relative">
        {/* カメラ映像 */}
        <div className="relative w-1/3 h-auto mx-auto">
          <video
            ref={videoRef}
            className="bg-black rounded object-cover w-full h-full"
            style={{
              margin: "0 auto", // センター配置
            }}
          />
        </div>

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
                ) : loadingUrls.includes(id) ? (
                  <button
                    onClick={() => handleFailScan(id)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mt-2 mb-2"
                  >
                    スキャン結果待ち...
                  </button>
                ) : failedUrls.includes(id) ? (
                  <span className="text-gray-500">損傷判定</span>
                ) : (
                  <button
                    onClick={() => handleFailScan(id)}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-2 mb-2"
                  >
                    URL代替
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
