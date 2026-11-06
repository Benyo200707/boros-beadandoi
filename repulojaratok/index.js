import express from 'express';
import utvonalRouter from './routes/utvonal.js';
import repuloterekRouter from './routes/repuloterek.js';
import legitarsasagokRouter from './routes/legitarsasagok.js';
import jaratokRouter from './routes/jaratok.js';

const PORT = 3000;
const app = express();

app.use(express.json());

app.use('/utvonal', utvonalRouter);
app.use('/repuloterek', repuloterekRouter);
app.use('/legitarsasagok', legitarsasagokRouter);
app.use('/jaratok', jaratokRouter);

app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen`);
});
