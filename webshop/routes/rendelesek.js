import express from 'express';
import pool from '../data/db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  const { tol, ig, statusz } = req.query;

  try {
   
    if (tol && ig) {
      const kezdoDatum = new Date(tol);
      kezdoDatum.setHours(0, 0, 0, 0);

      const vegDatum = new Date(ig);
      vegDatum.setHours(23, 59, 59, 999);

      const [Rendelesek] = await pool.query(
        'SELECT * FROM rendelesek WHERE datum BETWEEN ? AND ?',
        [kezdoDatum, vegDatum]
      );
      return res.json(Rendelesek);
    }

    
    if (statusz) {
      const [Rendelesek] = await pool.query(
        'SELECT * FROM rendelesek WHERE statusz = ?',
        [statusz]
      );
      return res.json(Rendelesek);
    }

   
    const [Rendelesek] = await pool.query('SELECT * FROM rendelesek');
    res.json(Rendelesek);

  } catch (error) {
    console.error('Nem található rendelés:', error);
    res.status(500).json({ error: 'Belső szerver hiba', details: error.message });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [Rendelesek] = await pool.query('SELECT * FROM rendelesek WHERE id = ?', [id]);
    if (Rendelesek.length === 0) {
      return res.status(404).json({ error: 'Nem található rendelés' });
    }
    res.json(Rendelesek[0]);
  } catch (error) {
    console.error('Nem található rendelés:', error);
    res.status(500).json({ error: 'Belső szerver hiba' });
  }
});

export default router;
