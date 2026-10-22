import express from "express";
const router = express.Router();
import db from "../data/db.js"


router.get("/", async (req, res) => {
    try {
        const { varos, minCsillag, maxAr, medence } = req.query;

        if (
            (minCsillag !== undefined &&
                (!/^[1-5]$/.test(minCsillag))) ||
            (maxAr !== undefined &&
                (maxAr.trim() === "" || !Number.isFinite(Number(maxAr)) || Number(maxAr) < 0)) ||
            (medence !== undefined &&
                medence !== "true" &&
                medence !== "false")
        ) {
            return res.status(400).json({
                hiba: "Hibás szűrési paraméter!"
            });
        }

        let sql = `
            SELECT
                s.id,
                s.nev,
                v.nev AS varos,
                v.orszag,
                s.csillag,
                s.ar,
                s.medence,
                s.ertekeles
            FROM szallasok s
            JOIN varosok v ON s.varos_id = v.id
            WHERE 1=1
        `;

        const params = [];

        if (varos !== undefined) {
            sql += " AND v.nev = ?";
            params.push(varos);
        }

        if (minCsillag !== undefined) {
            sql += " AND s.csillag >= ?";
            params.push(Number(minCsillag));
        }

        if (maxAr !== undefined) {
            sql += " AND s.ar <= ?";
            params.push(Number(maxAr));
        }

        if (medence !== undefined) {
            sql += " AND s.medence = ?";
            params.push(medence === "true" ? 1 : 0);
        }

        sql += " ORDER BY s.ar ASC";

        const [rows] = await db.query(sql, params);

        const eredmeny = rows.map(s => ({
            ...s,
            medence: Boolean(s.medence),
            ertekeles: Number(s.ertekeles)
        }));

        res.json(eredmeny);

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

// Egy szállás ID alapján
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ hiba: "Hibás ID!" });
        }

        const [rows] = await db.query(`
            SELECT
                s.id,
                s.nev,
                v.nev AS varos,
                v.orszag,
                s.csillag,
                s.ar,
                s.medence,
                s.ertekeles
            FROM szallasok s
            JOIN varosok v ON s.varos_id = v.id
            WHERE s.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                hiba: "A szállás nem található!"
            });
        }

        const szallas = rows[0];

        szallas.medence = Boolean(szallas.medence);
        szallas.ertekeles = Number(szallas.ertekeles);

        res.json(szallas);

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

export default router;