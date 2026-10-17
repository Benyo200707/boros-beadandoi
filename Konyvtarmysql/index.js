import express from 'express';
import kolcsonzesekRouter from './routes/kolcsonzesek.js';
import konyvekRouter from './routes/konyvek.js';
import olvasokRouter from './routes/olvasok.js';

const app = express();
app.use(express.json());

app.use('/kolcsonzesek', kolcsonzesekRouter);
app.use('/konyvek', konyvekRouter);
app.use('/olvasok', olvasokRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen!`);
});
