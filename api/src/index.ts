import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order";
import { onRampRouter } from "./routes/on-ramp";
import { depthRouter } from "./routes/depth";
import { klineRouter } from "./routes/kline";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/on-ramp", onRampRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/klines", klineRouter);

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});