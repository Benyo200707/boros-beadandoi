import express from 'express';
import db from '../data/db.js'; 

const router = express.Router();

router.get('/', async (req, res) => {
    const faj = req.query.faj;

    try {
        let rows;

        if (faj) {
           
            const sql = "SELECT * FROM allatok WHERE faj = ?";
            [rows] = await db.execute(sql, [faj]);
            
            
            if (rows.length === 0) {
                return res.status(404).json({ error: `A megadott fajjal (${faj}) nem található állat.` });
            }
        } else {
           
            const sql = "SELECT * FROM allatok";
            [rows] = await db.execute(sql);
        }

        
        res.json(rows);

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt a lekérdezés közben." });
    }
});





router.get('/kezeles-nelkul', async (req, res) => {
    try {
 
        const sql = `
            SELECT allatok.* 
            FROM allatok 
            LEFT JOIN kezelesek ON allatok.id = kezelesek.allat_id 
            WHERE kezelesek.id IS NULL
        `;
        
        const [rows] = await db.execute(sql);
        
        res.json(rows);

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt a kezelés nélküli állatok lekérdezése közben." });
    }
});


export default router;
