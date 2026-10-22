import express from "express";
import ajanlat from "./routes/ajanlat.js";
import szallasok from "./routes/szallasok.js";
import varosok from "./routes/varosok.js";

const app = express();

app.use(express.json());

app.use("/szallasok", szallasok);
app.use("/varosok", varosok);
app.use("/", ajanlat);

app.listen(3000, () => {
    console.log("Szerver fut: http://localhost:3000");
});