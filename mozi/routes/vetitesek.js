import express from 'express';
import pool from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const datum = req.query.datum;

    try {
        let sql = `
            SELECT v.id, f.cim AS film, t.nev AS terem, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes,
            DATE_FORMAT(DATE_ADD(v.kezdes, INTERVAL f.hossz MINUTE), '%H:%i') AS veg, v.jegyar,
            ((t.sorok * t.szekek) - COUNT(fg.id)) AS szabadHely FROM vetitesek v
            INNER JOIN filmek f ON v.film_id = f.id INNER JOIN termek t ON v.terem_id = t.id
            LEFT JOIN foglalasok fg ON fg.vetites_id = v.id
        `;

        const params = [];

        if (datum) {
            sql += ' WHERE DATE(v.kezdes) = ?';
            params.push(datum);
        }

        sql += ' GROUP BY v.id ORDER BY v.kezdes ASC';

        const [rows] = await pool.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json([]);
        }

        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
      
        const vetitesSql = `
            SELECT  v.id, f.cim AS film, t.nev AS terem, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes,
            v.jegyar, t.sorok, t.szekek FROM vetitesek v INNER JOIN filmek f ON v.film_id = f.id
            INNER JOIN termek t ON v.terem_id = t.id WHERE v.id = ?
        `;

        const [vetitesRows] = await pool.query(vetitesSql, [id]);

        if (vetitesRows.length === 0) {
            return res.status(404).json({ error: 'A megadott vetítés nem található!' });
        }

        const vetites = vetitesRows[0];

     
        const foglaltSql = `
            SELECT sor, szek
            FROM foglalasok
            WHERE vetites_id = ?
            ORDER BY sor ASC, szek ASC
        `;

        const [foglaltRows] = await pool.query(foglaltSql, [id]);

     
        const foglaltDb = foglaltRows.length;
        const szabadHely = (vetites.sorok * vetites.szekek) - foglaltDb;

        res.status(200).json({
            id: vetites.id,
            film: vetites.film,
            terem: vetites.terem,
            kezdes: vetites.kezdes,
            jegyar: vetites.jegyar,
            sorok: vetites.sorok,
            szekek: vetites.szekek,
            foglaltDb: foglaltDb,
            szabadHely: szabadHely,
            foglalt: foglaltRows
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});





export default router;
