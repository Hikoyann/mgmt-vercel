import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import Head from "next/head";
import { Header } from "@/components/Header";

const App = () => {
  const [qrCount, setQrCount] = useState(0);
  const [detectedBars, setDetectedBars] = useState([
    false,
    false,
    false,
    false,
  ]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const targetURL = "https://example.com"; // QRコードURL

  useEffect(() => {
    const constraints = { video: { facingMode: "environment" } };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          processVideo();
        }
      })
      .catch((err) => console.error("カメラの取得エラー:", err));
  }, []);

  const processVideo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const checkBarcodePosition = (location, codeData) => {
      const bars = [
        { id: 0, detected: detectedBars[0] },
        { id: 1, detected: detectedBars[1] },
        { id: 2, detected: detectedBars[2] },
        { id: 3, detected: detectedBars[3] },
      ];

      bars.forEach((bar, index) => {
        const barElement = document.getElementById(`bar${index}`);
        const barRect = barElement.getBoundingClientRect();

        if (isCodeInArea(location, barRect) && codeData === targetURL) {
          if (!detectedBars[index]) {
            setDetectedBars((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
            setQrCount((prev) => prev + 1);

            if (qrCount + 1 === 4) {
              window.location.href = targetURL;
            }
          }
        }
      });
    };

    const isCodeInArea = (codeLocation, barRect) => {
      const [topLeft, , bottomRight] = codeLocation;
      return (
        topLeft.x >= barRect.left &&
        topLeft.x <= barRect.right &&
        topLeft.y >= barRect.top &&
        topLeft.y <= barRect.bottom &&
        bottomRight.x >= barRect.left &&
        bottomRight.x <= barRect.right &&
        bottomRight.y >= barRect.top &&
        bottomRight.y <= barRect.bottom
      );
    };

    const scanForQrCode = () => {
      if (!canvas || !videoRef.current) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        checkBarcodePosition(code.location, code.data);
      }

      requestAnimationFrame(scanForQrCode);
    };

    scanForQrCode();
  };

  return (
    <div>
      <Head>
        <title>QRコード読み取り</title>
      </Head>
      <div>
        <Header />
        <div className="relative w-full h-screen">
          {/* カメラ映像 */}
          <video ref={videoRef} className="w-full h-full object-cover"></video>

          {/* QRコード検出バー（正方形配置、サイズ調整済み） */}
          <div
            id="bar0"
            className="absolute border-4 border-red-500 bg-blue-500 bg-opacity-30 top-1/4 left-1/4 w-1/5 h-1/5"
          ></div>
          <div
            id="bar1"
            className="absolute border-4 border-red-500 bg-blue-500 bg-opacity-30 top-1/4 right-1/4 w-1/5 h-1/5"
          ></div>
          <div
            id="bar2"
            className="absolute border-4 border-red-500 bg-blue-500 bg-opacity-30 bottom-1/4 left-1/4 w-1/5 h-1/5"
          ></div>
          <div
            id="bar3"
            className="absolute border-4 border-red-500 bg-blue-500 bg-opacity-30 bottom-1/4 right-1/4 w-1/5 h-1/5"
          ></div>

          {/* 読み取りステータス */}
          <div className="absolute bottom-10 left-10 bg-gray-800 text-white p-4 rounded-lg">
            <p>QRコード読み取りカウント: {qrCount}/4</p>
          </div>

          {/* Canvas (非表示) */}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
