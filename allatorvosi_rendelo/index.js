import express from 'express';
import allatokRouter from './routes/allatok.js';
import gazdakRouter from './routes/gazdak.js';
import kezelesekRouter from './routes/kezelesek.js';
import statisztikaRouter from './routes/statisztika.js';

const  PORT = 3000;
const app= express();

app.use(express.json());

app.use('/allatok', allatokRouter);
app.use('/gazdak', gazdakRouter);
app.use('/kezelesek', kezelesekRouter);
app.use('/statisztika', statisztikaRouter);



app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen`);
});


