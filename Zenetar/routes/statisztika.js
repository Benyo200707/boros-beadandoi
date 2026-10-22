import express from "express";
import db from "../data/db.js";

export const statisztikaRouter = express.Router();

statisztikaRouter.get("/mufajok", async (req, res) => {
    try {
        const sql = `
            SELECT mufaj, COUNT(id) AS albumDb, SUM(hossz) AS osszHossz 
            FROM albumok 
            GROUP BY mufaj
            ORDER BY mufaj ASC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

statisztikaRouter.get("/statisztika/eloadok", async (req, res) => {
    try {
        const sql = `
            SELECT e.nev AS eloado, COUNT(a.id) AS albumDb, MIN(a.ev) AS elso, MAX(a.ev) AS utolso
            FROM eloadok e
            LEFT JOIN albumok a ON e.id = a.eloado_id
            GROUP BY e.id, e.nev
            ORDER BY albumDb DESC, e.nev ASC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


statisztikaRouter.get("/orszagok", async (req, res) => {
    try {
        const sql = `
            SELECT e.orszag, COUNT(DISTINCT e.id) AS eloadoDb, COUNT(a.id) AS albumDb
            FROM eloadok e
            LEFT JOIN albumok a ON e.id = a.eloado_id
            GROUP BY e.orszag
            ORDER BY e.orszag ASC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
