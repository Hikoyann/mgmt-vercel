import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function QRCode() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [firstUrl, setFirstUrl] = useState(null);
  const [loadingUrls, setLoadingUrls] = useState([1, 2, 3, 4]);
  const [failedUrls, setFailedUrls] = useState([]);
  const videoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const constraints = { video: { facingMode: "environment" } };

    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (error) {
        console.error("カメラの取得に失敗:", error);
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

          if (!firstUrl) setFirstUrl(scannedUrl);

          if (id && id >= 1 && id <= 4 && !urls[id]) {
            setUrls((prev) => {
              const updatedUrls = { ...prev, [id]: scannedUrl };
              setLoadingUrls((prev) => prev.filter((item) => item !== id));

              if (Object.values(updatedUrls).filter(Boolean).length === 4) {
                codeReader.reset();
                router.push(firstUrl || "/");
              }
              return updatedUrls;
            });
          }
        }

        if (error && error !== "NotFoundError") {
          console.error("QRコード読み取りエラー:", error);
        }
      }
    );

    return () => {
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [firstUrl, urls, router]);

  useEffect(() => {
    if (Object.values(urls).every((url) => url === "損傷判定URL")) {
      router.push("/");
    }
  }, [urls, router]);

  const handleFailScan = (id) => {
    setFailedUrls((prev) => [...prev, id]);
    setLoadingUrls((prev) => prev.filter((item) => item !== id));
    setUrls((prev) => ({ ...prev, [id]: "損傷判定URL" }));
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl relative">
        <div className="relative w-1/3 h-auto mx-auto">
          <video
            ref={videoRef}
            className="bg-black rounded object-cover w-full h-full"
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
                    損傷ボタン
                  </button>
                ) : (
                  <span className="text-gray-500">損傷判定</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
