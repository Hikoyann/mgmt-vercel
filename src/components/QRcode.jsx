import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/router";

export default function QRcode() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [loadingUrls, setLoadingUrls] = useState([1, 2, 3, 4]); // スキャン待ちのQRコードIDを管理
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef(null);
  const router = useRouter();
  const [firstUrl, setFirstUrl] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const constraints = {
      video: {
        facingMode: "environment",
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

    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (result) {
          const scannedUrl = result.getText();
          const urlParams = new URLSearchParams(new URL(scannedUrl).search);
          const id = urlParams.get("id");

          if (id && id >= 1 && id <= 4) {
            setUrls((prevUrls) => {
              const updatedUrls = { ...prevUrls, [id]: scannedUrl };
              setLoadingUrls((prev) => prev.filter((item) => item !== id)); // スキャン待ちのQRコードIDから削除

              if (!firstUrl) {
                setFirstUrl(scannedUrl); // 最初のURLを保存
              }

              const allScanned =
                Object.values(updatedUrls).filter(Boolean).length === 4;

              if (allScanned) {
                // 4つのQRコードがすべてURLでない場合、"/"へ移動
                const allValidUrls = Object.values(updatedUrls).every((url) =>
                  isValidUrl(url)
                );

                setScanning(false); // スキャン終了

                if (!allValidUrls) {
                  console.log(
                    "すべてのQRコードがURLでないため、ホームに戻ります。"
                  );
                  router.push("/"); // すべてURLでない場合はホームに移動
                } else {
                  if (firstUrl) {
                    console.log("最初のURLに移動します:", firstUrl);
                    router.push(firstUrl); // 最初のURLに移動
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
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [firstUrl, urls, router]);

  // URLの有効性を確認する関数
  const isValidUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl relative">
        <div className="relative w-1/3 h-auto mx-auto">
          <video
            ref={videoRef}
            className="bg-black rounded object-cover w-full h-full"
            style={{ margin: "0 auto" }}
          />
        </div>

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
