import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const honnan = req.query.honnan;
    const hova = req.query.hova;

    if (honnan === hova) {
        return res.status(400).json({ error: "Az indulási és érkezési hely nem lehet ugyanaz." });
    } else if (!honnan || !hova) {
        return res.status(404).json({ error: "Kérlek add meg az indulási és érkezési helyet." });
    }

    try {

        const sqlkozvetlen = `
            SELECT j.jaratszam, TIME_FORMAT(j.indulas, '%H:%i') AS indulas,
            TIME_FORMAT(ADDTIME(j.indulas, SEC_TO_TIME(j.idotartam * 60)), '%H:%i') AS erkezes,
            j.ar FROM jaratok j JOIN repuloterek h ON h.id = j.honnan_id
            JOIN repuloterek c ON c.id = j.hova_id WHERE h.kod = ? AND c.kod = ?
            ORDER BY j.ar ASC;`;
        const [kozvetlensorok] = await db.execute(sqlkozvetlen, [honnan, hova]);

        const sqlatszallas = ` 
            SELECT j1.jaratszam AS elso, j2.jaratszam AS masodik, a.kod AS atszallas,
            TIME_FORMAT(j1.indulas, '%H:%i') AS indulas,
            TIME_FORMAT(ADDTIME(j2.indulas, SEC_TO_TIME(j2.idotartam * 60)), '%H:%i') AS erkezes,
            TIMESTAMPDIFF(MINUTE, ADDTIME(j1.indulas, SEC_TO_TIME(j1.idotartam * 60)), j2.indulas) AS varakozas,
            (j1.ar + j2.ar) AS osszAr FROM jaratok j1 JOIN jaratok j2 ON j2.honnan_id = j1.hova_id
            JOIN repuloterek h ON h.id = j1.honnan_id JOIN repuloterek c ON c.id = j2.hova_id
            JOIN repuloterek a ON a.id = j1.hova_id WHERE h.kod = ? AND c.kod = ?
            AND TIMESTAMPDIFF(MINUTE, ADDTIME(j1.indulas, SEC_TO_TIME(j1.idotartam * 60)), j2.indulas) BETWEEN 60 AND 300
            ORDER BY osszAr ASC;`;

        const [sqlatszallasSorok] = await db.execute(sqlatszallas, [honnan, hova]);

        res.json({
            honnan: honnan,
            hova: hova,
            kozvetlen: kozvetlensorok,
            atszallassal: sqlatszallasSorok
        });

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt az útvonal lekérdezése közben." });
    }
});

export default router;
