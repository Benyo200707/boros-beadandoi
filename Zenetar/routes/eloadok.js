import express from "express";
import db from "../data/db.js";

export const eloadokRouter = express.Router();


eloadokRouter.get("/", async (req, res) => {
    const { orszag } = req.query;
    try {
        let sql = "SELECT * FROM eloadok";
        const params = [];

        if (orszag) {
            sql += " WHERE orszag = ?";
            params.push(orszag);
        }
        sql += " ORDER BY nev ASC";

        const [rows] = await db.query(sql, params);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


eloadokRouter.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Az ID-nak számnak kell lennie!" });
    }

    try {
        const [[eloado]] = await db.query("SELECT * FROM eloadok WHERE id = ?", [id]);
        
        if (!eloado) {
            return res.status(404).json({ error: "Az előadó nem található!" });
        }

        const [albumRows] = await db.query(
            "SELECT id, cim, ev, mufaj, hossz FROM albumok WHERE eloado_id = ? ORDER BY ev ASC", 
            [id]
        );

        res.status(200).json({
            ...eloado,
            albumok: albumRows
        });
    }   catch (e) {
        console.error("Adatbázis hiba történt:", e);
        res.status(500).json({ error: e.message });
    }
    
});
