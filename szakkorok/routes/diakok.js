import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/szakkor-nelkul", async (req, res) => {
    try {
        const [diakok] = await db.query(`
            SELECT d.id, d.nev, d.osztaly
            FROM diakok d
            LEFT JOIN jelentkezesek j
                ON d.id = j.diak_id
            WHERE j.diak_id IS NULL
            ORDER BY d.nev
        `);

        res.json(diakok);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a diákok lekérésekor."
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const { osztaly } = req.query;

        let sql = `
            SELECT
                d.id,
                d.nev,
                d.osztaly,
                COUNT(j.szakkor_id) AS szakkorDb
            FROM diakok d
            LEFT JOIN jelentkezesek j
                ON d.id = j.diak_id
        `;

        const parameterek = [];

        if (osztaly !== undefined) {
            if (osztaly.trim() === "") {
                return res.status(400).json({
                    hibak: ["Az osztály nem lehet üres."]
                });
            }

            sql += " WHERE d.osztaly = ?";
            parameterek.push(osztaly);
        }

        sql += `
            GROUP BY d.id, d.nev, d.osztaly
            ORDER BY d.nev
        `;

        const [diakok] = await db.query(sql, parameterek);

        res.json(diakok);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a diákok lekérésekor."
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                hibak: ["Az azonosító pozitív egész szám legyen."]
            });
        }

        const [diakok] = await db.query(
            "SELECT id, nev, osztaly FROM diakok WHERE id = ?",
            [id]
        );

        if (diakok.length === 0) {
            return res.status(404).json({
                hiba: "A diák nem található."
            });
        }

        const [szakkorok] = await db.query(`
            SELECT
                s.id,
                s.nev,
                s.tanar,
                s.nap,
                j.datum AS jelentkezett
            FROM jelentkezesek j
            INNER JOIN szakkorok s
                ON s.id = j.szakkor_id
            WHERE j.diak_id = ?
            ORDER BY
                FIELD(s.nap, 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek'),
                s.nev
        `, [id]);

        res.json({
            ...diakok[0],
            szakkorok
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a diák lekérésekor."
        });
    }
});

export default router;