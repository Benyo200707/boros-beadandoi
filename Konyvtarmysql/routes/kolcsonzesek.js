import express from 'express';
import db from './db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const [kolcsonzesek] = await db.query('SELECT * FROM kolcsonzesek').catch(e => { throw new Error("Hiba a kolcsonzesek tabla lekeresekor: " + e.message) });
    const [konyvek] = await db.query('SELECT * FROM konyvek').catch(e => { throw new Error("Hiba a konyvek tabla lekeresekor: " + e.message) });
    const [olvasok] = await db.query('SELECT * FROM olvasok').catch(e => { throw new Error("Hiba a olvasok tabla lekeresekor: " + e.message) });

    if (!kolcsonzesek || !Array.isArray(kolcsonzesek)) {
      return res.json([]);
    }

    let eredmeny = kolcsonzesek.map(k => ({
      ...k,
      konyvCim: konyvek && Array.isArray(konyvek) ? konyvek.find(kv => kv.id === k.konyvId)?.cim : "Ismeretlen könyv",
      olvasoNev: olvasok && Array.isArray(olvasok) ? olvasok.find(o => o.id === k.olvasoId)?.nev : "Ismeretlen olvasó"
    }));

    if (req.query.aktiv === 'true') {
      eredmeny = eredmeny.filter(k => k.visszahozva === false || k.visszahozva === 'false');
    }

    res.json(eredmeny);
  } catch (err) {
    // Kiírjuk a VS Code termináljába is a pontos hibát, hogy lásd!
    console.error("Szerver hiba:", err.message);
    res.status(500).json({ error: err.message || "Ismeretlen hiba tortent az adatbazisban" });
  }
});


router.post('/', async (req, res) => {
  const { konyvId, olvasoId } = req.body;

  if (!Number.isInteger(konyvId) || !Number.isInteger(olvasoId)) {
    return res.status(400).json({ error: 'Helytelen vagy hiányzó konyvId vagy olvasoId!' });
  }

  try {
    const [konyvek] = await db.query('SELECT * FROM konyvek');
    const [olvasok] = await db.query('SELECT * FROM olvasok');

    const konyvLetezik = konyvek.some(k => k.id === konyvId);
    const olvasoLetezik = olvasok.some(o => o.id === olvasoId);

    if (!konyvLetezik || !olvasoLetezik) {
      return res.status(404).json({ error: 'A könyv vagy az olvasó nem létezik!' });
    }

    const [kolcsonzesek] = await db.query('SELECT * FROM kolcsonzesek');
    const marKikolcsonozve = kolcsonzesek.some(k => k.konyvId === konyvId && (k.visszahozva === false || k.visszahozva === 'false'));

    if (marKikolcsonozve) {
      return res.status(409).json({ error: 'A könyv jelenleg ki van kölcsönözve!' });
    }

    const maiDatum = new Date().toISOString().split('T')[0];
    await db.query(
      'INSERT INTO kolcsonzesek (konyvId, olvasoId, datum, visszahozva) VALUES (?, ?, ?, ?)',
      [konyvId, olvasoId, maiDatum, 'false']
    );

    res.status(201).json({ message: 'Kölcsönzés sikeresen létrehozva.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/visszahoz', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [találatok] = await db.query('SELECT * FROM kolcsonzesek WHERE id = ?', [id]);
    
    if (találatok.length === 0) {
      return res.status(404).json({ error: 'A kölcsönzés nem található!' });
    }

    const kolcsonzes = találatok[0];

    if (kolcsonzes.visszahozva === true || kolcsonzes.visszahozva === 'true') {
      return res.status(409).json({ error: 'Ezt a könyvet már korábban visszahozták!' });
    }

    const maiDatum = new Date().toISOString().split('T')[0];
    await db.query(
      'UPDATE kolcsonzesek SET visszahozva = ?, visszahozasDatum = ? WHERE id = ?',
      ['true', maiDatum, id]
    );

    res.json({ message: 'Könyv sikeresen visszahozva.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
