import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get(`/`, async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM repuloterek`);
    res.json(rows);
  } catch (error) {
    console.error("Adatbázis hiba:", error);
    res.status(400).json({ error: "Hiba történt a repülőterek lekérdezése közben." });
  }
});


router.get(`/:kod`, async (req, res) => {
  const kod = req.params.kod;

  try {
    const [rows] = await db.execute(`SELECT * FROM repuloterek WHERE kod = ?`, [kod]);
    res.json(rows);
  } catch (error) {
    console.error("Adatbázis hiba:", error);
    res.status(404).json({ error: "A keresett repülőtér nem található." });
  }
});

router.get (`/:kod/indulasok`, async (req, res) => {
    const kod = req.params.kod;
    try {
        const [rows] = await db.execute(`
            SELECT j.id, j.jaratszam, j.indulas, j.idotartam, j.ar,
                   r.kod AS repuloterek_kod
            FROM jaratok j
            JOIN repuloterek r ON j.honnan_id = r.id
            WHERE r.kod = ?`, 
            [kod]);
        res.json(rows);
    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(400).json({ error: "Hiba történt a repülőtér indulásainak lekérdezése közben." });
    }
});

export default router;
