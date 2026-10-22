import express from "express";
import db from "../data/db.js";

export const albumokRouter = express.Router();


albumokRouter.get("/kereses", async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: "A keresési kifejezésnek legalább 2 karakterből kell állnia!" });
    }

    try {
        const sql = `
            SELECT a.id, a.cim, e.nev AS eloado, a.ev, a.mufaj, a.hossz 
            FROM albumok a
            JOIN eloadok e ON a.eloado_id = e.id
            WHERE LOWER(a.cim) LIKE LOWER(?) OR LOWER(e.nev) LIKE LOWER(?)
            ORDER BY a.ev ASC, a.cim ASC
        `;
        const searchPattern = `%${q}%`;
        const [rows] = await db.query(sql, [searchPattern, searchPattern]);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


albumokRouter.get("/", async (req, res) => {
    const { mufaj, tol, ig } = req.query;
    
    if ((tol && isNaN(parseInt(tol))) || (ig && isNaN(parseInt(ig)))) {
        return res.status(400).json({ error: "Az évszámnak érvényes számnak kell lennie!" });
    }

    try {
        let sql = `
            SELECT a.id, a.cim, e.nev AS eloado, a.ev, a.mufaj, a.hossz 
            FROM albumok a
            JOIN eloadok e ON a.eloado_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (mufaj) {
            sql += " AND a.mufaj = ?";
            params.push(mufaj);
        }
        if (tol) {
            sql += " AND a.ev >= ?";
            params.push(parseInt(tol));
        }
        if (ig) {
            sql += " AND a.ev <= ?";
            params.push(parseInt(ig));
        }

        sql += " ORDER BY a.ev ASC, a.cim ASC";

        const [rows] = await db.query(sql, params);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
