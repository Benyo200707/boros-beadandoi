import express from 'express';
import db from '../data/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { vetitesId, nev, sor, szek } = req.body;
  const errors = [];

  if (!Number.isInteger(vetitesId) || vetitesId <= 0) {
    errors.push('Érvénytelen vetítés azonosító!');
  }
  if (typeof nev !== 'string' || nev.trim() === '') {
    errors.push('A név megadása kötelező!');
  }
  if (!Number.isInteger(sor) || sor <= 0) {
    errors.push('A sor csak pozitív egész szám lehet!');
  }
  if (!Number.isInteger(szek) || szek <= 0) {
    errors.push('A szék csak pozitív egész szám lehet!');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [vetitesRows] = await db.query(
      `SELECT v.id, v.jegyar, DATE_FORMAT(v.kezdes, '%Y-%m-%d %H:%i') AS kezdes,
       f.cim AS film, t.nev AS terem, t.sorok, t.szekek FROM vetitesek v
      JOIN filmek f ON v.film_id = f.id
      JOIN termek t ON v.terem_id = t.id
      WHERE v.id = ?`,
      [vetitesId]
    );

    if (vetitesRows.length === 0) {
      return res.status(404).json({ error: 'A megadott vetítés nem található!' });
    }

    const vetites = vetitesRows[0];

   
    if (sor > vetites.sorok || szek > vetites.szekek) {
      return res.status(400).json({ 
        error: `A(z) ${vetites.terem} csak ${vetites.sorok} soros és soronként ${vetites.szekek} székes!` 
      });
    }

    
    const [foglaltRows] = await db.query(
      'SELECT COUNT(*) AS foglalt FROM foglalasok WHERE vetites_id = ?',
      [vetitesId]
    );
    const kapacitas = vetites.sorok * vetites.szekek;

    if (foglaltRows[0].foglalt >= kapacitas) {
      return res.status(409).json({ error: 'A vetítésre minden hely elkelt (telt ház)!' });
    }

    const [result] = await db.query(
      'INSERT INTO foglalasok (vetites_id, nev, sor, szek) VALUES (?, ?, ?, ?)',
      [vetitesId, nev.trim(), sor, szek]
    );

    return res.status(201).json({
      id: result.insertId,
      film: vetites.film,
      terem: vetites.terem,
      kezdes: vetites.kezdes,
      nev: nev.trim(),
      sor,
      szek,
      jegyar: vetites.jegyar
    });

  } catch (error) {
   
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A megadott hely már foglalt!' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Adatbázis hiba történt!' });
  }
});


router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Érvénytelen foglalás azonosító!' });
  }

  try {
    const [result] = await db.query('DELETE FROM foglalasok WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'A megadott foglalás nem található!' });
    }

   
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Adatbázis hiba történt!' });
  }
});

export default router;
