import express from 'express';
import filmekRouter from './routes/filmek.js'
import vetitesekRouter from './routes/vetitesek.js'

const PORT = 3000;
const app= express();
app.use(express.json());


app.use(`/filmek`, filmekRouter);
app.use('/vetitesek', vetitesekRouter);


app.listen(PORT, () =>{
    console.log(`A  szerver fut a http://localhost:${PORT} címen!`)
})
