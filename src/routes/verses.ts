import express from "express";

import { getVersesController } from "~/controllers/verses";

const versesRouter = express.Router();

versesRouter.get(
  "/:bookName/chapters/:chapter/verses",
  async (req, res, next) => {
    try {
      const bookName = req.params.bookName;
      const chapter = req.params.chapter;

      const fromParam = req.query.from as string | undefined;
      const toParam = req.query.to as string | undefined;

      let from: number | undefined;
      let to: number | undefined;

      if (fromParam !== undefined) {
        from = parseInt(fromParam, 10);
        if (isNaN(from) || from < 1) {
          res.status(400).json({ error: "Invalid 'from' parameter" });
          return;
        }
      }

      if (toParam !== undefined) {
        to = parseInt(toParam, 10);
        if (isNaN(to) || to < 1) {
          res.status(400).json({ error: "Invalid 'to' parameter" });
          return;
        }
      }

      if (from !== undefined && to !== undefined && from > to) {
        res.status(400).json({ error: "'from' must be less than or equal to 'to'" });
        return;
      }

      const verses = await getVersesController(bookName, chapter, from, to);
      res.json(verses);
    } catch (error) {
      next(error);
    }
  }
);


export default versesRouter;
