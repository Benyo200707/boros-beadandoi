import express from 'express';
import db from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {

  const honnan = req.query.honnan;
  const hova = req.query.hova;
  const legitarsasag = req.query.legitarsasag;

  try {
   
    let sql = `
      SELECT j.id, j.jaratszam, j.indulas, j.idotartam, j.ar, r_honnan.kod AS honnan_kod,
      r_hova.kod AS hova_kod, r_legitarsasag.kod AS legitarsasag_kod FROM jaratok j
      JOIN repuloterek r_honnan ON j.honnan_id = r_honnan.id 
      JOIN repuloterek r_hova ON j.hova_id = r_hova.id
      JOIN legitarsasagok r_legitarsasag ON j.legitarsasag_id = r_legitarsasag.id`;
    
    const params = [];
    const conditions = [];
    
    if (honnan && honnan.trim() !== '') {
      conditions.push('r_honnan.kod = ?');
      params.push(honnan.trim().toUpperCase());
    }

    if (hova && hova.trim() !== '') {
      conditions.push('r_hova.kod = ?');
      params.push(hova.trim().toUpperCase());
    }

    if (legitarsasag && legitarsasag.trim() !== '') {
      conditions.push('r_legitarsasag.kod = ?');
      params.push(legitarsasag.trim().toUpperCase());
    }


    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await db.execute(sql, params);
    res.json(rows);
    
  } catch (error) {
    console.error('Adatbázis hiba:', error);
    res.status(400).json({ error: 'Hiba történt a járatok lekérdezése közben.' });
  }
});

router.get('/:jaratszam', async (req, res) => {
    const jaratszam = req.params.jaratszam;

    try {
        let sql = `
            SELECT j.id, j.jaratszam, j.indulas, j.idotartam, j.ar, r_honnan.kod AS honnan_kod,
            r_hova.kod AS hova_kod,r_legitarsasag.kod AS legitarsasag_kod
            FROM jaratok j JOIN repuloterek r_honnan ON j.honnan_id = r_honnan.id
            JOIN repuloterek r_hova ON j.hova_id = r_hova.id
            JOIN legitarsasagok r_legitarsasag ON j.legitarsasag_id = r_legitarsasag.id `;
        

                const params = [];
                const conditions = [];

                if (jaratszam && jaratszam.trim() !== '') {
                    conditions.push('j.jaratszam = ?');
                    params.push(jaratszam.trim().toUpperCase());
                }

                if (conditions.length > 0) {
                    sql += ' WHERE ' + conditions.join(' AND ');
                }

                const [rows] = await db.execute(sql, params);
                res.json(rows);
            } catch (error) {
                console.error('Adatbázis hiba:', error);
                res.status(400).json({ error: 'Hiba történt a járatok lekérdezése közben.' });
            }
        });

export default router;
