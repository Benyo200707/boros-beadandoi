import express from "express";
import { eloadokRouter } from "./routes/eloadok.js";
import { albumokRouter } from "./routes/albumok.js";
import { statisztikaRouter } from "./routes/statisztika.js";

const app = express();
app.use(express.json());


app.use("/eloadok", eloadokRouter);
app.use("/albumok", albumokRouter);
app.use("/", statisztikaRouter); 

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`A  szerver fut a http://localhost:${PORT} címen!`);
});
