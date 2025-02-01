import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/router";

export default function QRcode() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [damagedUrls, setDamagedUrls] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  }); // 損傷判定の管理
  const [scanning, setScanning] = useState(true);
  const [firstUrl, setFirstUrl] = useState(null); // 最初に取得したURL
  const [loadingUrls, setLoadingUrls] = useState([1, 2, 3, 4]); // スキャン待ち
  const [allUrlsScanned, setAllUrlsScanned] = useState(false); // QRコード全ての情報が揃ったかどうか
  const videoRef = useRef(null);
  const router = useRouter(); // Next.jsのrouter

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // カメラの設定
    const constraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 640 },
        height: { ideal: 480 },
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

    // QRコードの読み取り設定
    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (result) {
          const scannedUrl = result.getText();
          const urlParams = new URLSearchParams(new URL(scannedUrl).search);
          const id = urlParams.get("id");

          // 最初に読み取ったURLを保存
          if (!firstUrl) {
            setFirstUrl(scannedUrl); // 最初に読み取ったURLを保存
          }

          // IDが1〜4の範囲であれば、そのURLを保存
          if (id && id >= 1 && id <= 4) {
            // すでにそのIDが読み取られている場合はスキップ
            if (!urls[id]) {
              setUrls((prevUrls) => {
                const updatedUrls = { ...prevUrls, [id]: scannedUrl };

                // スキャン結果待ちのIDを削除
                setLoadingUrls((prev) => prev.filter((item) => item !== id));

                // すべてのQRコードが読み取れたらスキャンを停止
                const scannedCount =
                  Object.values(updatedUrls).filter(Boolean).length;
                if (scannedCount === 4) {
                  setScanning(false);
                  codeReader.reset(); // QRコード読み取りを停止

                  setAllUrlsScanned(true); // 全てのQRコードが読み取られたフラグを立てる
                }

                return updatedUrls;
              });
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
  }, [firstUrl, urls, router]);

  // URL読み取りに失敗したQRコードのIDを管理
  const handleFailScan = (id) => {
    setDamagedUrls((prev) => ({ ...prev, [id]: true })); // 損傷判定URLとして設定
    setLoadingUrls((prev) => prev.filter((item) => item !== id)); // スキャン待ちIDから削除

    // 損傷判定URLとして設定
    setUrls((prevUrls) => {
      const updatedUrls = { ...prevUrls, [id]: "損傷判定URL" };
      return updatedUrls;
    });

    // すべてが損傷判定URLの場合にホームに戻る
    if (Object.values(urls).every((url) => url === "損傷判定URL")) {
      router.push("/"); // Next.jsのrouter.pushでホームに戻る
    }
  };

  // スキャン停止と結果の処理
  const handleStopScan = () => {
    setScanning(false); // スキャン停止
    if (firstUrl) {
      router.push(firstUrl); // 最初のURLに移動
    } else {
      alert("QRコードが読み取られませんでした。");
    }
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

        {/* 完了ボタンをQRコードがすべて読み取られた後に表示 */}
        {allUrlsScanned && (
          <button
            onClick={handleStopScan}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 mb-4"
          >
            完了
          </button>
        )}

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
                ) : loadingUrls.includes(id) ? (
                  <button
                    onClick={() => handleFailScan(id)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mt-2 mb-2"
                    disabled
                  >
                    スキャン結果待ち...
                  </button>
                ) : damagedUrls[id] ? (
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
