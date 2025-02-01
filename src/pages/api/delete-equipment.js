// `pages/api/delete-equipment.js`
import { database } from "../../lib/firebase";
import { ref, remove } from "firebase/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await remove(ref(database, `equipmentRegistry/${id}`));
    res.status(200).json({ message: "削除しました", equipmentName: "備品名" }); // 実際のデータを取得して equipmentName を返す
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ error: "削除に失敗しました" });
  }
}
