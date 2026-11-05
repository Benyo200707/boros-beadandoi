import express from "express";
import db from "../data/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { nap, vanHely } = req.query;

        const [szakkorok] = await db.query(`
            SELECT
                s.id,
                s.nev,
                s.tanar,
                s.nap,
                s.max_letszam AS maxLetszam,
                COUNT(j.diak_id) AS jelentkezett,
                GREATEST(
                    s.max_letszam - COUNT(j.diak_id),
                    0
                ) AS szabadHely
            FROM szakkorok s
            LEFT JOIN jelentkezesek j
                ON s.id = j.szakkor_id
            GROUP BY
                s.id, s.nev, s.tanar, s.nap, s.max_letszam
            ORDER BY
                FIELD(s.nap, 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek'),
                s.nev
        `);

        let eredmeny = szakkorok;

        if (nap !== undefined) {
            const ervenyesNapok = [
                "hétfő", "kedd", "szerda", "csütörtök", "péntek"
            ];

            if (!ervenyesNapok.includes(nap)) {
                return res.status(400).json({
                    hibak: ["Érvénytelen nap."]
                });
            }

            eredmeny = eredmeny.filter(
                szakkor => szakkor.nap === nap
            );
        }

        if (vanHely !== undefined) {
            if (vanHely !== "true" && vanHely !== "false") {
                return res.status(400).json({
                    hibak: ["A vanHely értéke true vagy false lehet."]
                });
            }

            if (vanHely === "true") {
                eredmeny = eredmeny.filter(
                    szakkor => Number(szakkor.szabadHely) > 0
                );
            }

            if (vanHely === "false") {
                eredmeny = eredmeny.filter(
                    szakkor => Number(szakkor.szabadHely) === 0
                );
            }
        }

        res.json(eredmeny);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a szakkörök lekérésekor."
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                hibak: ["Az azonosító pozitív egész szám legyen."]
            });
        }

        const [szakkorok] = await db.query(`
            SELECT
                s.id,
                s.nev,
                s.tanar,
                s.nap,
                s.max_letszam AS maxLetszam,
                COUNT(j.diak_id) AS jelentkezett,
                GREATEST(
                    s.max_letszam - COUNT(j.diak_id),
                    0
                ) AS szabadHely
            FROM szakkorok s
            LEFT JOIN jelentkezesek j
                ON s.id = j.szakkor_id
            WHERE s.id = ?
            GROUP BY
                s.id, s.nev, s.tanar, s.nap, s.max_letszam
        `, [id]);

        if (szakkorok.length === 0) {
            return res.status(404).json({
                hiba: "A szakkör nem található."
            });
        }

        const [diakok] = await db.query(`
            SELECT
                d.id,
                d.nev,
                d.osztaly,
                j.datum AS jelentkezett
            FROM jelentkezesek j
            INNER JOIN diakok d
                ON d.id = j.diak_id
            WHERE j.szakkor_id = ?
            ORDER BY d.nev
        `, [id]);

        res.json({
            ...szakkorok[0],
            diakok
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            hiba: "Hiba történt a szakkör lekérésekor."
        });
    }
});

export default router;