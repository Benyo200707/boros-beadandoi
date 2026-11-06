import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM legitarsasagok ORDER BY kod DESC");
    res.json(rows);
  } catch (error) {
    console.error("Adatbázis hiba:", error);
    res.status(400).json({ error: "Hiba történt a legitimációk lekérdezése közben." });
  }
});

export default router;
