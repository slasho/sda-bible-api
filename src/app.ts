import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import booksRouter from "./routes/books";
import chaptersRouter from "./routes/chapters";
import versesRouter from "./routes/verses";
import { getRandomVerseController } from "./controllers/verses";
import { swaggerSpec } from "./swagger";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.use("/api/bible/books", booksRouter);
app.use("/api/bible/books", chaptersRouter);
app.use("/api/bible/books", versesRouter);

app.get("/api/bible/random", async (_req, res, next) => {
  try {
    const verse = await getRandomVerseController();
    res.json(verse);
  } catch (error) {
    next(error);
  }
});

app.get("/api", (_req, res) => {
  const apiInfo = {
    message: "Welcome to the SDA Bible - API",
    endpoints: [
      {
        path: "/api/bible/books",
        description: "Get all the books from the Bible",
      },
      {
        path: "/api/bible/books/:bookName/chapters",
        description: "Get chapters by book name",
      },
      {
        path: "/api/bible/books/:bookName/chapters/:chapter/verses",
        description: "Get verses by book name and chapter",
        queryParameters: [
          {
            name: "from",
            description: "Start verse number (inclusive)",
            type: "number",
          },
          {
            name: "to",
            description: "End verse number (inclusive)",
            type: "number",
          },
        ],
      },
      {
        path: "/api/bible/random",
        description: "Get a random verse from the Bible",
      },
    ],
  };

  return res.json(apiInfo);
});

app.get("/api/hello", (_req, res) => {
  return res.send("Hello WOrld");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
