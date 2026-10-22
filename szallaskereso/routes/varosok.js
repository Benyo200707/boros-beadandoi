import express from "express"
const router = express.Router();
import db from "../data/db.js"


router.get("/", async (req, res) => {
    try {
        const { minSzallas } = req.query;

        if (
            minSzallas !== undefined &&
            (minSzallas.trim() === "" ||
                !Number.isInteger(Number(minSzallas)) ||
                Number(minSzallas) < 0)
        ) {
            return res.status(400).json({
                hiba: "Hibás minSzallas paraméter!"
            });
        }

        let sql = `
            SELECT v.id,v.nev, v.orszag,COUNT(s.id) AS szallasDb,MIN(s.ar) AS legolcsobb, ROUND(AVG(s.ar)) AS atlagAr 
            FROM varosok v LEFT JOIN szallasok s ON v.id = s.varos_id
            GROUP BY v.id, v.nev, v.orszag`;

        const params = [];

        if (minSzallas !== undefined) {
            sql += " HAVING COUNT(s.id) >= ?";
            params.push(Number(minSzallas));
        }

        sql += " ORDER BY v.nev ASC";

        const [rows] = await db.query(sql, params);

        res.json(rows.map(v => ({
            ...v,
            szallasDb: Number(v.szallasDb),
            legolcsobb: v.legolcsobb === null
                ? null : Number(v.legolcsobb),
            atlagAr: v.atlagAr === null
                ? null : Number(v.atlagAr)
        })));

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


router.get("/:id/szallasok", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ hiba: "Hibás ID!" });
        }

        const [varos] = await db.query(
            "SELECT * FROM varosok WHERE id = ?",
            [id]
        );

        if (varos.length === 0) {
            return res.status(404).json({
                hiba: "A város nem található!"
            });
        }

        const [rows] = await db.query(`
            SELECT s.id, s.nev, v.nev AS varos, v.orszag, s.csillag, s.ar, s.medence, s.ertekeles 
            FROM szallasok s JOIN varosok v ON s.varos_id = v.id WHERE v.id = ? ORDER BY s.ar ASC`, [id]);

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