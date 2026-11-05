import express from 'express';
import vasarlokRouter from './routes/vasarlok.js';
import rendelesekRouter from './routes/rendelesek.js';
import statisztikaRouter from './routes/statisztika.js';
import termekekRouter from './routes/termekek.js';


const app = express();

app.use('/vasarlok', vasarlokRouter);
app.use('/rendelesek', rendelesekRouter);
app.use('/statisztika', statisztikaRouter);
app.use('/termekek', termekekRouter);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen`);
});
