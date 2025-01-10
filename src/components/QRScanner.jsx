import { useEffect, useRef, useState } from "react";

export default function QRScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [opencvLoaded, setOpencvLoaded] = useState(false);

  useEffect(() => {
    // OpenCV.jsをロード
    const loadOpenCV = () => {
      const script = document.createElement("script");
      script.src = "/js/opencv.js"; // 公開ディレクトリのパス
      script.async = true;
      script.onload = () => {
        setOpencvLoaded(true);
      };
      script.onerror = () => {
        console.error("OpenCV.jsの読み込みに失敗しました");
      };
      document.body.appendChild(script);
    };

    loadOpenCV();
  }, []);

  useEffect(() => {
    if (!opencvLoaded) return;

    let videoStream = null;

    // カメラ映像を取得
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
        videoStream = stream;
        videoRef.current.play();
      } catch (error) {
        console.error("カメラの取得に失敗しました:", error);
      }
    };

    // QRコード検出
    const detectQRCode = () => {
      const qrCodeDetector = new cv.QRCodeDetector();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const processFrame = () => {
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          let src = cv.imread(canvas);
          let points = new cv.Mat();

          try {
            if (qrCodeDetector.detect(src, points)) {
              let decoded = new cv.Mat();
              qrCodeDetector.decode(src, points, decoded);

              if (decoded.size().height > 0) {
                setResult(decoded.string());
              }

              // 赤枠でQRコードを囲む
              const color = new cv.Scalar(255, 0, 0, 255); // 赤色
              cv.polylines(src, points, true, color, 2, cv.LINE_AA);
              cv.imshow(canvas, src);
            }
          } catch (error) {
            console.error("QRコード検出エラー:", error);
          } finally {
            src.delete();
            points.delete();
          }
        }
        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startCamera().then(detectQRCode);

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [opencvLoaded]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl">
        {/* カメラ映像 */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        ></video>

        {/* QRコードの検出用キャンバス */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width="640"
          height="480"
        ></canvas>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow text-center w-full max-w-2xl">
        {result ? (
          <>
            <h2 className="text-lg font-bold">QRコード内容:</h2>
            <p className="text-blue-500">
              <a href={result} target="_blank" rel="noopener noreferrer">
                {result}
              </a>
            </p>
          </>
        ) : (
          <p className="text-gray-500">QRコードをスキャンしてください...</p>
        )}
      </div>
    </div>
  );
}
