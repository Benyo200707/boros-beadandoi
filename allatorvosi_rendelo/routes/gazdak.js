import express from 'express';
import db from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    
    const varos = req.query.varos;

    try {
        let rows;

        if (varos) {
            
            const sql = "SELECT nev FROM gazdak WHERE varos = ? ORDER BY nev ASC";
            [rows] = await db.execute(sql, [varos]);
        } else {
            
            const sql = "SELECT * FROM gazdak ORDER BY nev ASC";
            [rows] = await db.execute(sql);
        }

        
        res.json(rows);

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt a lekérdezés közben." });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const sql = "SELECT * FROM gazdak WHERE id = ?";
        const [rows] = await db.execute(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ gazdak:"[]"});
        }

        res.json(rows[0]);

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt a lekérdezés közben." });
    }
});






export default router;