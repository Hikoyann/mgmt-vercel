import { Client, Intents } from "discord.js";
import fetch from "node-fetch"; // ESM モジュール形式でのインポート

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// ボタンがクリックされた時の処理
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("delete_")) {
    // クリックされたボタンが削除ボタンの場合
    const id = interaction.customId.split("_")[1]; // IDを取得

    // Firebase の削除 API を呼び出す
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delete-equipment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Discord へのリクエスト送信
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, equipmentName: data.equipmentName }), // equipmentNameも一緒に送信
        });
        interaction.reply({
          content: "備品が削除されました。",
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `エラー: ${data.error}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      interaction.reply({
        content: "削除処理中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  } else if (interaction.customId === "cancel") {
    // キャンセルボタンが押された場合
    interaction.reply({
      content: "削除がキャンセルされました。",
      ephemeral: true,
    });
  }
});

// Discord Bot ログイン
client.login(process.env.DISCORD_BOT_TOKEN);
