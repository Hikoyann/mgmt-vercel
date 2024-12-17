import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Header } from "@/components/Header";

export default function MultiQRCodeScanner() {
  const [scanCount, setScanCount] = useState({});
  const [scannedUrls, setScannedUrls] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // 再利用可能なcanvas
  const router = useRouter();
  const [opencvLoaded, setOpencvLoaded] = useState(false);

  useEffect(() => {
    const checkOpenCV = () => {
      if (window.cv) {
        setOpencvLoaded(true);
        startCamera(window.cv);
      } else {
        setTimeout(checkOpenCV, 100); // OpenCVロード確認
      }
    };
    checkOpenCV();
  }, []);

  const handleResult = (decodedText) => {
    const urlPattern = /equipmentRegistry\/(\d+)\?id=(\d+)/;
    const match = decodedText.match(urlPattern);

    if (match) {
      const pathId = match[1];
      const queryId = match[2];

      setScannedUrls((prev) => {
        const exists = prev.some(
          (entry) => entry.pathId === pathId && entry.queryId === queryId
        );
        if (!exists) {
          return [...prev, { pathId, queryId }];
        }
        return prev;
      });

      setScanCount((prev) => {
        const updatedCount = { ...prev };
        if (!updatedCount[pathId]) {
          updatedCount[pathId] = new Set();
        }
        updatedCount[pathId].add(queryId);
        return updatedCount;
      });
    }
  };

  const startCamera = (cv) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const qrCodeDetector = new cv.QRCodeDetector();

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();

        const processFrame = () => {
          if (!opencvLoaded || video.videoWidth === 0) {
            requestAnimationFrame(processFrame);
            return;
          }

          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const src = cv.matFromImageData(imageData);

          const points = new cv.Mat();
          const decodedText = qrCodeDetector.detectAndDecode(src, points);

          if (decodedText) {
            console.log("QR Code detected:", decodedText);
            handleResult(decodedText);
          }

          src.delete();
          points.delete();
          requestAnimationFrame(processFrame);
        };

        requestAnimationFrame(processFrame);
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };

  useEffect(() => {
    for (const [pathId, ids] of Object.entries(scanCount)) {
      if (ids.size === 4) {
        const redirectUrl = `https://mgmt-vercel.vercel.app/equipmentRegistry/${pathId}`;
        alert(`全てのQRコードが揃いました！${redirectUrl} へ移動します。`);
        router.push(redirectUrl);
        break;
      }
    }
  }, [scanCount, router]);

  return (
    <div>
      <Head>
        <title>QRコードスキャナー</title>
      </Head>
      <Header />
      <div className="text-center mt-12">
        <h1 className="text-2xl font-bold">QRコードスキャナー</h1>
        <p className="text-gray-600">
          カメラでQRコードをスキャンしてください。
        </p>

        {/* Camera Feed */}
        <div className="relative mx-auto" style={{ maxWidth: "640px" }}>
          <video ref={videoRef} style={{ width: "100%" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {!opencvLoaded && <p>Loading OpenCV...</p>}

        {/* Recognized URLs */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold">認識したQRコード一覧</h3>
          <ul className="list-disc list-inside">
            {scannedUrls.map((entry, index) => (
              <li key={index} className="text-gray-700">
                パスID: <span className="font-semibold">{entry.pathId}</span> -
                クエリID: <span className="text-blue-600">{entry.queryId}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scan State */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold">スキャン状況</h3>
          {Object.entries(scanCount).map(([pathId, ids]) => (
            <div key={pathId} className="mt-2">
              <p>
                パスID: <span className="font-bold">{pathId}</span> - 認識ID:{" "}
                {[...ids].sort().join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
