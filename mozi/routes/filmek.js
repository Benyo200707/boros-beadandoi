import express from 'express';
import pool from '../data/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let sql = 'SELECT * FROM filmek ORDER BY cim ASC';
        const params = [];

        const [rows] = await pool.query(sql, params);
        res.status(200).json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


router.get('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const sql = 'SELECT * FROM filmek WHERE id = ?';
        const params = [id];

        const [rows] = await pool.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ vetitesek: '[]' });
        }

        res.status(200).json(rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


export default router;
