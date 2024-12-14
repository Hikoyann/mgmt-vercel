import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { useRouter } from "next/router";

export default function MultiFrameScanner() {
  const [scannedData, setScannedData] = useState([null, null, null, null]); // 4つの枠のスキャン結果を保持
  const router = useRouter();

  const handleResult = (result, frameIndex) => {
    if (result?.text) {
      setScannedData((prevData) => {
        const updatedData = [...prevData];
        updatedData[frameIndex] = result.text; // 対応する枠に結果を保存
        return updatedData;
      });
    }
  };

  // 全ての枠が同じQRコードをスキャンした場合の処理
  useEffect(() => {
    if (scannedData.every((data) => data !== null)) {
      const uniqueData = [...new Set(scannedData)]; // ユニークな値を抽出

      if (uniqueData.length === 1) {
        alert(`移動します: ${uniqueData[0]}`);
        router.push(uniqueData[0]); // URLに移動
      } else {
        alert("スキャンしたQRコードが一致していません。再試行してください。");
        setScannedData([null, null, null, null]); // リセット
      }
    }
  }, [scannedData, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Multi-Frame QR Code Scanner</h1>
      <p>4つの枠にQRコードをスキャンしてください。</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          maxWidth: "600px",
          margin: "auto",
        }}
      >
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "100%",
                border: "2px solid black",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <QrReader
                  onResult={(result) => handleResult(result, index)}
                  constraints={{ facingMode: "environment" }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
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
      </div>
    </div>
  );
}


