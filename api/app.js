import express from "express";
import cors from "cors";
import router from "./router";

const app = express();
const port = process.env.PORT || 9001;

// Enable CORS for all routes.
// This is not secure, and should be locked down to specific origins in a production environment.
app.use(
  cors({
    origin: "*",
  })
);

// Enable JSON parsing for request bodies.
app.use(express.json());

app.use("/", router);
app.listen(port, () => {});
