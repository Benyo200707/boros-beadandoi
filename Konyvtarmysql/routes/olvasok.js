import express from 'express';
import db from './db.js';

const router = express.Router();

router.get('/:id/kolcsonzesek', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [olvasok] = await db.query('SELECT * FROM olvasok WHERE id = ?', [id]);
    if (olvasok.length === 0) {
      return res.status(404).json({ error: 'Olvasó nem található!' });
    }

    const [kolcsonzesek] = await db.query('SELECT * FROM kolcsonzesek WHERE olvasoId = ?', [id]);
    const [konyvek] = await db.query('SELECT * FROM konyvek');

    const formázottKolcsonzesek = kolcsonzesek.map(k => ({
      id: k.id,
      konyvId: k.konyvId,
      konyvCim: konyvek.find(kv => kv.id === k.konyvId)?.cim,
      datum: k.datum,
      visszahozva: k.visszahozva
    }));

    res.json({
      olvaso: olvasok[0].nev,
      kolcsonzesek: formázottKolcsonzesek
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
