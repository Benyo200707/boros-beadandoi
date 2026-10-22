import express from 'express'
const router = express.Router();
import db from "../data/db.js";


router.get("/orszagok", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.orszag, COUNT(DISTINCT v.id) AS varosDb, COUNT(s.id) AS szallasDb, ROUND(AVG(s.ertekeles), 2) 
            AS atlagErtekeles
            FROM varosok v LEFT JOIN szallasok s ON v.id = s.varos_id GROUP BY v.orszag
            ORDER BY v.orszag ASC
        `);

        res.json(rows.map(o => ({
            orszag: o.orszag,
            varosDb: Number(o.varosDb),
            szallasDb: Number(o.szallasDb),
            atlagErtekeles: o.atlagErtekeles === null
                ? null : Number(o.atlagErtekeles)
        })));

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


router.get("/ajanlat", async (req, res) => {
    try {
        const { varos, ej, fo } = req.query;
        const hibak = [];

        if (!varos || !varos.trim()) {
            hibak.push("A város megadása kötelező!");
        }

        if (
            ej === undefined ||
            ej.trim() === "" ||
            !Number.isInteger(Number(ej)) ||
            Number(ej) <= 0
        ) {
            hibak.push("Az éjszakák száma pozitív egész szám legyen!");
        }

        if (
            fo === undefined ||
            fo.trim() === "" ||
            !Number.isInteger(Number(fo)) ||
            Number(fo) <= 0
        ) {
            hibak.push("A személyek száma pozitív egész szám legyen!");
        }

        if (hibak.length > 0) {
            return res.status(400).json({ hibak });
        }

        const [varosok] = await db.query(
            "SELECT id FROM varosok WHERE nev = ?",
            [varos]
        );

        if (varosok.length === 0) {
            return res.status(404).json({
                hiba: "A város nem található!"
            });
        }

        const [rows] = await db.query(`
            SELECT nev AS szallas, csillag, ar AS arFoEj,  ar * ? * ? AS osszesen
            FROM szallasok  WHERE varos_id = ?ORDER BY ar ASC
            `, [Number(ej), Number(fo), varosok[0].id]);

        res.json({
            varos,
            ej: Number(ej),
            fo: Number(fo),
            ajanlatok: rows.map(s => ({
                ...s,
                arFoEj: Number(s.arFoEj),
                osszesen: Number(s.osszesen)
            }))
        });

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

router.get("/legjobb/:n", async (req, res) => {
    try {
        const n = Number(req.params.n);

        if (!Number.isInteger(n) || n <= 0) {
            return res.status(400).json({
                hiba: "Pozitív egész számot adj meg!"
            });
        }

        const [rows] = await db.query(`
            SELECT s.id,s.nev,v.nev AS varos, v.orszag,s.csillag, s.ar, s.medence, s.ertekeles
            FROM szallasok s JOIN varosok v ON s.varos_id = v.id
            ORDER BY s.ertekeles DESC, s.id ASC LIMIT ?`, [n]);

        res.json(rows.map(s => ({
            ...s,
            medence: Boolean(s.medence),
            ertekeles: Number(s.ertekeles)
        })));

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

export default router;