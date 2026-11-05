import express from "express";
import szakkorokRouter from "./routes/szakkorok.js";
import diakokRouter from "./routes/diakok.js";
import jelentkezesekRouter from "./routes/jelentkezesek.js";
import utkozesekRouter from "./routes/utkozesek.js";

const app = express();
const PORT = 3000;

app.use(express.json());


app.use("/szakkorok", szakkorokRouter);
app.use("/diakok", diakokRouter);
app.use("/jelentkezesek", jelentkezesekRouter);
app.use("/utkozesek", utkozesekRouter);


app.listen(PORT, () => {
    console.log(`A szerver fut: http://localhost:${PORT}`);
});