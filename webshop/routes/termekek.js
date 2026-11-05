import express from 'express';
import pool from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [termekek] = await pool.query('SELECT * FROM termekek');
    res.json(termekek);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Belső szerver hiba' });
  }
});



router.get('/sosem-rendelt', async (req, res) => {
    try {
        
        const query = `
            SELECT t.id, t.nev, t.ar 
            FROM termekek t
            LEFT JOIN tetelek t_elem ON t.id = t_elem.termek_id
            WHERE t_elem.termek_id IS NULL
        `;
        
        const [rows] = await pool.query(query);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Hiba a lekérdezés során:', error);
        res.status(500).json({ error: 'Szerver hiba történt.' });
    }
});

export default router;
