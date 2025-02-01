import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { BrowserMultiFormatReader } from "@zxing/library";
import { getAuth } from "firebase/auth"; // Firebaseの認証をインポート

export default function QRCode() {
  const [urls, setUrls] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [firstUrl, setFirstUrl] = useState(null);
  const [loadingUrls, setLoadingUrls] = useState([1, 2, 3, 4]);
  const videoRef = useRef(null);
  const router = useRouter();

  // QRコードが全て損傷判定に変わったかどうかをチェックする
  const allDamaged = Object.values(urls).every((url) => url === "損傷判定URL");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const constraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

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
  }, [firstUrl, urls]);

  const handleFailScan = (id) => {
    setUrls((prev) => ({ ...prev, [id]: "損傷判定URL" }));
    setLoadingUrls((prev) => prev.filter((item) => item !== id));
  };

  // ページリロード関数
  const handleReload = () => {
    window.location.reload();
  };

  // Discord通知関数
  const sendToDiscord = (message) => {
    fetch("/api/discord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });
  };

  // リンク先ボタンを押した時の処理
  const handleLinkClick = () => {
    const damagedIds = Object.entries(urls)
      .filter(([id, url]) => url === "損傷判定URL")
      .map(([id]) => id);

    if (damagedIds.length > 0) {
      const auth = getAuth(); // Firebaseの認証インスタンスを取得
      const user = auth.currentUser; // 現在ログインしているユーザー情報を取得

      if (user) {
        const userName = user.displayName || user.email; // displayNameがあればそれを使い、なければemailを使用
        const message = `${userName} さんが以下のQRコードIDを損傷と判定しました: ${damagedIds.join(
          ", "
        )}`;
        sendToDiscord(message); // Discordに通知を送信
      } else {
        console.error("ユーザーがログインしていません");
      }
    }

    window.open(firstUrl, "_blank");
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

        {/* 全てが損傷判定になった場合にリロードボタンを表示 */}
        {allDamaged && (
          <div className="mt-4">
            <button
              onClick={handleReload}
              className="bg-blue-500 text-white px-6 py-3 rounded"
            >
              リロード
            </button>
          </div>
        )}

        {/* 4つのQRコードがスキャンされてから最初のURLを表示 */}
        {Object.values(urls).filter(Boolean).length === 4 && firstUrl && (
          <div className="mt-4 bg-white shadow rounded p-4">
            <h2 className="text-lg font-bold">最初に取得したURL:</h2>
            <button
              onClick={handleLinkClick}
              className="text-blue-500 underline px-4 py-2 bg-white border border-blue-500 rounded"
            >
              リンク先
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
