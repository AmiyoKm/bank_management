import cors from "cors";
import morgan from "morgan";
import express from "express";
import { errorHandler, notFound } from "./api/middlewares/errorHandler.js";
import { rateLimiter } from "./api/middlewares/rateLimit.js";
import routes from "./api/routes/index.js";

const app = express();
const port = process.env.PORT || 8080;
app.use(morgan("dev"));
app.use(cors());
app.use(rateLimiter);
app.use(express.json());

app.use("/v1", routes);

app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World!" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
