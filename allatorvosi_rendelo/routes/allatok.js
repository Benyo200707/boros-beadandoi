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


router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    try {
      
        const allatSql = `
            SELECT 
                allatok.id,
                allatok.nev,
                allatok.faj,
                DATE_FORMAT(allatok.szuletes, '%Y-%m-%d') AS szuletes,
                gazdak.id AS gazda_id,
                gazdak.nev AS gazda_nev,
                gazdak.telefon AS gazda_telefon
            FROM allatok
            INNER JOIN gazdak ON allatok.gazda_id = gazdak.id
            WHERE allatok.id = ?
        `;

        const [allatRows] = await db.execute(allatSql, [id]);

        if (allatRows.length === 0) {
            return res.status(404).json({ error: "A megadott azonosítóval nem található állat." });
        }

        const allatData = allatRows[0];

        
        const kezelesekSql = `
            SELECT 
                id,
                DATE_FORMAT(datum, '%Y-%m-%d') AS datum,
                leiras,
                dij
            FROM kezelesek
            WHERE allat_id = ?
            ORDER BY datum ASC
        `;

        const [kezelesRows] = await db.execute(kezelesekSql, [id]);

       
        const kezelesek = kezelesRows.map(k => ({
            id: k.id,
            datum: k.datum,
            leiras: k.leiras,
            dij: Number(k.dij)
        }));

        const osszesDij = kezelesek.reduce((osszeg, k) => osszeg + k.dij, 0);

       
        res.json({
            id: allatData.id,
            nev: allatData.nev,
            faj: allatData.faj,
            szuletes: allatData.szuletes,
            gazda: {
                id: allatData.gazda_id,
                nev: allatData.gazda_nev,
                telefon: allatData.gazda_telefon
            },
            kezelesek: kezelesek,
            osszesDij: osszesDij
        });

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Szerverhiba történt a lekérdezés során." });
    }
});


export default router;
