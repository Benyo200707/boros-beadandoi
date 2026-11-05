import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { diakId, szakkorId } = req.body;

    if (
        !Number.isInteger(diakId) ||
        !Number.isInteger(szakkorId) ||
        diakId <= 0 ||
        szakkorId <= 0
    ) {
        return res.status(400).json({
            hibak: [
                "A diakId és a szakkorId kötelező, pozitív egész szám legyen."
            ]
        });
    }

    let kapcsolat;

    try {
        kapcsolat = await db.getConnection();
        await kapcsolat.beginTransaction();

        const [diakok] = await kapcsolat.query(
            "SELECT id, nev FROM diakok WHERE id = ?",
            [diakId]
        );

        if (diakok.length === 0) {
            await kapcsolat.rollback();

            return res.status(404).json({
                hiba: "A diák nem található."
            });
        }

        const [szakkorok] = await kapcsolat.query(
            "SELECT id, nev, nap, max_letszam FROM szakkorok WHERE id = ? FOR UPDATE",
            [szakkorId]
        );

        if (szakkorok.length === 0) {
            await kapcsolat.rollback();

            return res.status(404).json({
                hiba: "A szakkör nem található."
            });
        }

        const diak = diakok[0];
        const szakkor = szakkorok[0];

        const [meglevo] = await kapcsolat.query(
            "SELECT diak_id FROM jelentkezesek WHERE diak_id = ? AND szakkor_id = ?",
            [diakId, szakkorId]
        );

        if (meglevo.length > 0) {
            await kapcsolat.rollback();

            return res.status(409).json({
                hiba: "A diák már jelentkezett erre a szakkörre."
            });
        }

        const [letszam] = await kapcsolat.query(
            "SELECT COUNT(*) AS darab FROM jelentkezesek WHERE szakkor_id = ?",
            [szakkorId]
        );

        if (Number(letszam[0].darab) >= Number(szakkor.max_letszam)) {
            await kapcsolat.rollback();

            return res.status(409).json({
                hiba: `${szakkor.nev} szakkör betelt.`
            });
        }

        const [utkozes] = await kapcsolat.query(`
            SELECT s.nev
            FROM jelentkezesek j
            INNER JOIN szakkorok s
                ON s.id = j.szakkor_id
            WHERE j.diak_id = ?
              AND s.nap = ?
            LIMIT 1
        `, [diakId, szakkor.nap]);

        if (utkozes.length > 0) {
            await kapcsolat.rollback();

            return res.status(409).json({
                hiba: `${diak.nev} már jár ezen a napon a következő szakkörre: ${utkozes[0].nev}.`
            });
        }

        await kapcsolat.query(`
            INSERT INTO jelentkezesek (diak_id, szakkor_id, datum)
            VALUES (?, ?, CURDATE())
        `, [diakId, szakkorId]);

        await kapcsolat.commit();

        const [datumEredmeny] = await kapcsolat.query(
            "SELECT CURDATE() AS datum"
        );

        res.status(201).json({
            diakId,
            szakkorId,
            datum: datumEredmeny[0].datum,
            diak: diak.nev,
            szakkor: szakkor.nev,
            nap: szakkor.nap
        });
    } catch (error) {
        if (kapcsolat) {
            await kapcsolat.rollback();
        }

        console.error(error);

        res.status(500).json({
            hiba: "Hiba történt a jelentkezés mentésekor."
        });
    } finally {
        if (kapcsolat) {
            kapcsolat.release();
        }
    }
});

router.delete("/:diakId/:szakkorId", async (req, res) => {
    try {
        const diakId = Number(req.params.diakId);
        const szakkorId = Number(req.params.szakkorId);

        if (
            !Number.isInteger(diakId) ||
            !Number.isInteger(szakkorId) ||
            diakId <= 0 ||
            szakkorId <= 0
        ) {
            return res.status(400).json({
                hibak: ["Mindkét azonosító pozitív egész szám legyen."]
            });
        }

        const [eredmeny] = await db.query(`
            DELETE FROM jelentkezesek
            WHERE diak_id = ? AND szakkor_id = ?
        `, [diakId, szakkorId]);

        if (eredmeny.affectedRows === 0) {
            return res.status(404).json({
                hiba: "A jelentkezés nem található."
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a jelentkezés törlésekor."
        });
    }
});

export default router;