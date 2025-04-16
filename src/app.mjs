import express from "express";
import mongoose from "mongoose";
import router from "./routes/index.mjs";

await mongoose.connect(process.env.DATABASE_URI);

const app = express();

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`App is listening on port ${PORT}`);
});
