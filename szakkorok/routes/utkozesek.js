import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [utkozesek] = await db.query(`
            SELECT
                d.id AS diakId,
                d.nev AS diak,
                s.nap,
                GROUP_CONCAT(
                    s.nev
                    ORDER BY s.nev
                    SEPARATOR ', '
                ) AS szakkorLista,
                COUNT(*) AS darab
            FROM jelentkezesek j
            INNER JOIN diakok d
                ON d.id = j.diak_id
            INNER JOIN szakkorok s
                ON s.id = j.szakkor_id
            GROUP BY d.id, d.nev, s.nap
            HAVING COUNT(*) >= 2
            ORDER BY d.nev, FIELD(
                s.nap,
                'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek'
            )
        `);

        const eredmeny = utkozesek.map(sor => ({
            diak: sor.diak,
            nap: sor.nap,
            szakkorok: sor.szakkorLista.split(", ")
        }));

        res.json(eredmeny);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt az ütközések lekérésekor."
        });
    }
});

export default router;