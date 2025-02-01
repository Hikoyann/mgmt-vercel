// // api/discord.js
// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     const { message } = req.body;

//     const webhookURL = process.env.DISCORD_WEBHOOK_URL;
//     if (!webhookURL) {
//       return res.status(500).json({ error: "Webhook URL is not defined" });
//     }

//     try {
//       const response = await fetch(webhookURL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: message }),
//       });

//       if (!response.ok) {
//         return res.status(500).json({ error: "Failed to send notification" });
//       }

//       res.status(200).json({ message: "Notification sent" });
//     } catch (error) {
//       res.status(500).json({ error: "Error sending notification" });
//     }
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id, equipmentName } = req.body;
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookURL) {
    return res.status(500).json({ error: "Webhook URL is not defined" });
  }

  try {
    const discordMessage = {
      content: `🛑 **備品削除リクエスト** 🛑\n\n**備品名:** ${equipmentName}\n**備品 ID:** ${id}\n\nこの備品を削除しますか？`,
      components: [
        {
          type: 1, // Action Row (ボタンを配置するためのコンテナ)
          components: [
            {
              type: 2, // ボタン
              style: 4, // 赤色（Danger）
              label: "✅ 削除する",
              custom_id: `delete_${id}`,
            },
            {
              type: 2, // キャンセルボタン
              style: 2, // グレー（Secondary）
              label: "❌ キャンセル",
              custom_id: `cancel`,
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord Webhook Error:", errorText);
      return res.status(500).json({ error: "Failed to send notification" });
    }

    res
      .status(200)
      .json({ message: "削除リクエストを Discord に送信しました。" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
}
