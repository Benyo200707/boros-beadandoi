import express from 'express';
import db from '../data/db.js';

const router = express.Router();

router.get('/filmek', async (req, res) => {
  try {
    const sql = `
     SELECT f.id, f.cim, COALESCE(SUM(v_stat.eladott_jegyek), 0) AS eladott_jegyek,
    COALESCE(SUM(v_stat.bevetel), 0) AS bevetel,ROUND( SUM(v_stat.eladott_jegyek) / SUM(v_stat.kapacitas) * 100, 1) AS telitettseg
    FROM filmek f LEFT JOIN ( SELECT  v.id AS vetites_id, v.film_id,
    (t.sorok * t.szekek) AS kapacitas, COUNT(fg.id) AS eladott_jegyek, COUNT(fg.id) * v.jegyar AS bevetel FROM vetitesek v
    JOIN termek t ON v.terem_id = t.id LEFT JOIN foglalasok fg ON v.id = fg.vetites_id
    GROUP BY v.id, v.film_id, t.sorok, t.szekek, v.jegyar ) v_stat ON f.id = v_stat.film_id
    GROUP BY f.id, f.cim ORDER BY bevetel DESC, f.cim DESC; `;

    const [rows] = await db.query(sql);

    const formattedRows = rows.map(row => ({
      ...row,
      eladott_jegyek: Number(row.eladott_jegyek),
      bevetel: Number(row.bevetel),
      telitettseg: row.telitettseg !== null ? Number(row.telitettseg) : null
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Adatbázis hiba történt' });
  }
});

export default router;
