import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { useRouter } from "next/router";

export default function MultiFrameScanner() {
  const [scannedData, setScannedData] = useState([null, null, null, null]); // 各枠のスキャン結果
  const [scanCount, setScanCount] = useState(0); // スキャンした回数
  const router = useRouter();

  const handleResult = (result) => {
    if (result?.text) {
      const detectedArea = detectArea(result); // スキャン結果がどの枠に属するかを判定する
      if (detectedArea !== null && scannedData[detectedArea] === null) {
        setScannedData((prevData) => {
          const updatedData = [...prevData];
          updatedData[detectedArea] = result.text; // 対応する枠に結果を保存
          return updatedData;
        });

        setScanCount((prevCount) => prevCount + 1); // スキャンカウントを増加
      }
    }
  };

  const detectArea = (result) => {
    // QRコードの位置を解析して、どの枠に属するか判定するロジックを実装
    return null;
  };

  useEffect(() => {
    if (scannedData.every((data) => data !== null)) {
      const uniqueData = [...new Set(scannedData)]; // ユニークな値を抽出

      if (uniqueData.length === 1) {
        alert(`移動します: ${uniqueData[0]}`);
        router.push(uniqueData[0]); // URLに移動
      } else {
        alert("スキャンしたQRコードが一致していません。再試行してください。");
        setScannedData([null, null, null, null]); // リセット
        setScanCount(0); // スキャンカウントもリセット
      }
    }
  }, [scannedData, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Single Camera with Multi Frames</h1>
      <p>カメラビュー内の4つの枠にQRコードを配置してください。</p>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
          margin: "auto",
          paddingTop: "100%",
          border: "2px solid black",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* カメラビュー */}
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <QrReader
            onResult={handleResult}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* スキャン枠のオーバーレイ */}
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                border: "2px solid red",
                boxSizing: "border-box",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                width: "30%", // 小さく調整
                height: "30%",
                left: index % 2 === 0 ? "10%" : "60%", // 配置位置を調整
                top: index < 2 ? "10%" : "60%",
              }}
            ></div>
          ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>スキャン結果</h3>
        <ul>
          {scannedData.map((data, index) => (
            <li key={index}>
              枠 {index + 1}: {data || "未スキャン"}
            </li>
          ))}
        </ul>

        <h4>スキャン済み: {scanCount} / 4</h4>
      </div>
    </div>
  );
}
