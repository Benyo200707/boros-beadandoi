import express from 'express';
import db from '../data/db.js';

const router = express.Router();

router.get('/fajok', async (req, res) => {
    try {
        const sql = `
            SELECT 
                allatok.faj AS faj,
                COUNT(DISTINCT allatok.id) AS allatDb,
                COUNT(kezelesek.id) AS kezelesDb,
                COALESCE(SUM(kezelesek.dij), 0) AS bevetel
            FROM allatok
            LEFT JOIN kezelesek ON allatok.id = kezelesek.allat_id
            GROUP BY allatok.faj
            ORDER BY bevetel DESC
        `;

        const [rows] = await db.execute(sql);
        
       
        
        const formattedRows = rows.map(row => ({
            faj: row.faj,
            allatDb: Number(row.allatDb),
            kezelesDb: Number(row.kezelesDb),
            bevetel: Number(row.bevetel)
        }));

        res.json(formattedRows);

    } catch (error) {
        console.error("Faj statisztika lekérdezési hiba:", error);
        res.status(500).json({ error: "Hiba történt a fajonkénti statisztika lekérdezése során." });
    }
});


router.get('/havi', async (req, res) => {
    try {
        const sql = `
            SELECT 
                DATE_FORMAT(datum, '%Y-%m') AS honap,
                COUNT(id) AS kezelesDb,
                SUM(dij) AS bevetel
            FROM kezelesek
            WHERE datum IS NOT NULL
            GROUP BY honap
            ORDER BY honap ASC
        `;

        const [rows] = await db.execute(sql);

        const formattedRows = rows.map(row => ({
            honap: row.honap,
            kezelesDb: Number(row.kezelesDb),
            bevetel: Number(row.bevetel)
        }));

        res.json(formattedRows);

    } catch (error) {
        console.error("Havi statisztika lekérdezési hiba:", error);
        res.status(500).json({ error: "Hiba történt a havi statisztika lekérdezése során." });
    }
});



router.get('/gazdak', async (req, res) => {
    try {
        const sql = `
            SELECT 
                gazdak.nev AS gazda,
                COUNT(DISTINCT allatok.id) AS allatDb,
                COALESCE(SUM(kezelesek.dij), 0) AS osszKoltes
            FROM gazdak
            LEFT JOIN allatok ON gazdak.id = allatok.gazda_id
            LEFT JOIN kezelesek ON allatok.id = kezelesek.allat_id
            GROUP BY gazdak.id, gazdak.nev
            ORDER BY osszKoltes DESC
        `;

        const [rows] = await db.execute(sql);

        
        const formattedRows = rows.map(row => ({
            gazda: row.gazda,
            allatDb: Number(row.allatDb),
            osszKoltes: Number(row.osszKoltes)
        }));

        res.json(formattedRows);

    } catch (error) {
        console.error("Gazda statisztika lekérdezési hiba:", error);
        res.status(500).json({ error: "Hiba történt a gazdák statisztikájának lekérdezése során." });
    }
});







export default router;
