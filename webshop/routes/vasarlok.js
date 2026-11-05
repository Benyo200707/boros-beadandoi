import express from 'express';
import pool from '../data/db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const [Vasarlok] = await pool.query('SELECT * FROM vasarlok');
    console.log(Vasarlok);

    res.json(Vasarlok);
  } catch (error) {
    console.error('Nem található vásárló:', error);
    res.status(500).json({ error: 'Belső szerver hiba' });
  }
});


router.get('/:id/rendelesek', async (req, res) => {
  const { id } = req.params;

  try {
    const [VevoRendelesei] = await pool.query(
      'SELECT * FROM rendelesek WHERE vasarlo_id = ?', 
      [id]
    );
    res.json(VevoRendelesei);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Belső szerver hiba' });
  }
});


export default router;