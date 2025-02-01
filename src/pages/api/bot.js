// `bot.js`
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("delete_")) {
    const id = interaction.customId.split("_")[1];

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
    interaction.reply({
      content: "削除がキャンセルされました。",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
