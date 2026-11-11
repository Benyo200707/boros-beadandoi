import express from 'express';
import db from '../data/db.js';

const router = express.Router();

function isValidDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}


router.get('/', async (req, res) => {
    const { tol, ig, faj } = req.query;


    if (tol && !isValidDate(tol)) {
        return res.status(400).json({ error: "Érvénytelen 'tol' dátum." });
    }

    if (ig && !isValidDate(ig)) {
        return res.status(400).json({ error: "Érvénytelen 'ig' dátum." });
    }

    try {
        let sql = `
            SELECT 
                kezelesek.id,
                DATE_FORMAT(kezelesek.datum, '%Y-%m-%d') AS datum,
                allatok.nev AS allat,
                allatok.faj,
                gazdak.nev AS gazda,
                kezelesek.leiras,
                kezelesek.dij
            FROM kezelesek
            INNER JOIN allatok ON kezelesek.allat_id = allatok.id
            INNER JOIN gazdak ON allatok.gazda_id = gazdak.id
        `;

        const conditions = [];
        const params = [];

        if (tol) {
            conditions.push("DATE(kezelesek.datum) >= ?");
            params.push(tol);
        }

        if (ig) {
            conditions.push("DATE(kezelesek.datum) <= ?");
            params.push(ig);
        }

        if (faj) {
            conditions.push("allatok.faj = ?");
            params.push(faj);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY kezelesek.datum ASC";

        const [rows] = await db.execute(sql, params);

        const formattedRows = rows.map(row => ({
            id: row.id,
            datum: row.datum,
            allat: row.allat,
            faj: row.faj,
            gazda: row.gazda,
            leiras: row.leiras,
            dij: Number(row.dij)
        }));

        res.json(formattedRows);

    } catch (error) {
        console.error("Adatbázis hiba:", error);
        res.status(500).json({ error: "Hiba történt a kezelések lekérdezése során." });
    }
});




router.post('/', async (req, res) => {
    const { allatId, leiras, dij, datum } = req.body;

  
    if (!allatId || !leiras || dij === undefined || dij === null) {
        return res.status(400).json({ error: "Az allatId, leiras és dij megadása kötelező." });
    }

    const numericAllatId = Number(allatId);
    const numericDij = Number(dij);

    if (!Number.isInteger(numericAllatId) || numericAllatId <= 0) {
        return res.status(400).json({ error: "Érvénytelen allatId." });
    }

    if (typeof leiras !== 'string' || leiras.trim() === '') {
        return res.status(400).json({ error: "A leírás nem lehet üres." });
    }

    if (isNaN(numericDij) || numericDij < 0) {
        return res.status(400).json({ error: "A díjnak nemnegatív számnak kell lennie." });
    }

    
    let veglegesDatum;
    if (datum) {
        if (!isValidDate(datum)) {
            return res.status(400).json({ error: "Érvénytelen dátumformátum (elvárt: ÉÉÉÉ-HH-NN)." });
        }
        veglegesDatum = datum;
    } else {
       
        const ma = new Date();
        const ev = ma.getFullYear();
        const honap = String(ma.getMonth() + 1).padStart(2, '0');
        const nap = String(ma.getDate()).padStart(2, '0');
        veglegesDatum = `${ev}-${honap}-${nap}`;
    }

    try {
      
        const [allatCheck] = await db.execute("SELECT id FROM allatok WHERE id = ?", [numericAllatId]);
        if (allatCheck.length === 0) {
            return res.status(404).json({ error: "A megadott azonosítóval nem található állat." });
        }


        const insertSql = `
            INSERT INTO kezelesek (allat_id, leiras, dij, datum)
            VALUES (?, ?, ?, ?)
        `;
        const [insertResult] = await db.execute(insertSql, [
            numericAllatId,
            leiras.trim(),
            numericDij,
            veglegesDatum
        ]);

        const ujId = insertResult.insertId;

     
        const selectSql = `
            SELECT 
                kezelesek.id,
                DATE_FORMAT(kezelesek.datum, '%Y-%m-%d') AS datum,
                allatok.nev AS allat,
                allatok.faj,
                gazdak.nev AS gazda,
                kezelesek.leiras,
                kezelesek.dij
            FROM kezelesek
            INNER JOIN allatok ON kezelesek.allat_id = allatok.id
            INNER JOIN gazdak ON allatok.gazda_id = gazdak.id
            WHERE kezelesek.id = ?
        `;
        const [rows] = await db.execute(selectSql, [ujId]);
        const ujKezeles = rows[0];

    
        res.status(201).json({
            id: ujKezeles.id,
            datum: ujKezeles.datum,
            allat: ujKezeles.allat,
            faj: ujKezeles.faj,
            gazda: ujKezeles.gazda,
            leiras: ujKezeles.leiras,
            dij: Number(ujKezeles.dij)
        });

    } catch (error) {
        console.error("Adatbázis hiba a kezelés rögzítésekor:", error);
        res.status(500).json({ error: "Hiba történt az új kezelés mentése során." });
    }
});


export default router;
