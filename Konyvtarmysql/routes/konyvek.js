import express from 'express';
import db from './db.js';

const router = express.Router();

router.get('/elerheto', async (req, res) => {
  try {
    const [konyvek] = await db.query('SELECT * FROM konyvek');
    const [kolcsonzesek] = await db.query('SELECT * FROM kolcsonzesek');

    const elerhetoKonyvek = konyvek.filter(kv => 
      !kolcsonzesek.some(k => k.konyvId === kv.id && (k.visszahozva === false || k.visszahozva === 'false'))
    );

    res.json(elerhetoKonyvek);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
