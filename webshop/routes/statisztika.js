import express from 'express';
import pool from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [Statisztika] = await pool.query('SELECT * FROM statisztika');
    res.json(Statisztika);
  } catch (error) {
    console.error('Nem található statisztika:', error);
    res.status(500).json({ error: 'Belső szerver hiba' });
  }
});


router.get('/havi', async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(r.datum, '%Y-%m') AS honap, 
                COUNT(DISTINCT r.id) AS rendelesek_szama, 
                SUM(t.db * t.egysegar) AS osszes_osszeg
            FROM rendelesek r
            JOIN tetelek t ON r.id = t.rendeles_id
            GROUP BY DATE_FORMAT(r.datum, '%Y-%m')
            ORDER BY honap DESC;
        `;
       
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
        
    } catch (error) {
        console.error('Hiba a lekérdezés során:', error);
        res.status(500).json({ error: 'Szerver hiba történt.' });
    }
});

router.get('/top-termekek', async (req, res) => {
   
    const n = parseInt(req.query.n) || 3;
    
    try {
        const query = `
            SELECT 
                term.id AS termek_id,
                term.nev AS termek_nev, 
                SUM(tet.db) AS osszes_eladas
            FROM tetelek tet
            JOIN termekek term ON tet.termek_id = term.id
            GROUP BY term.id, term.nev
            ORDER BY osszes_eladas DESC
            LIMIT ?;
        `;
        
        const [rows] = await pool.query(query, [n]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a lekérdezés során:', error);
        res.status(500).json({ error: 'Szerver hiba történt.' });
    }
});


router.get('/kategoria', async (req, res) => {
    try {
        const query = `
            SELECT 
                t.kategoria,
                COUNT(DISTINCT t.id) AS egyedi_termekek_szama,
                SUM(tet.db) AS osszes_eladott_darab,
                SUM(tet.db * tet.egysegar) AS teljes_bevetel
            FROM termekek t
            LEFT JOIN tetelek tet ON t.id = tet.termek_id
            GROUP BY t.kategoria
            ORDER BY teljes_bevetel DESC;
        `;
        
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a kategória statisztika során:', error);
        res.status(500).json({ error: 'Szerver hiba történt.' });
    }
});

export default router;