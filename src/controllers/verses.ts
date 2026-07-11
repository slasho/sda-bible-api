import { getVersesModel, getRandomVerseModel, searchVersesModel } from "~/models/verses";

export const getVersesController = (
  bookName: string,
  chapter: string,
  from?: number,
  to?: number
) => {
  return new Promise((resolve, reject) => {
    getVersesModel(bookName, chapter, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        const verses = rows.map((row) => ({
          verse: row.VERSE_ID,
          text: row.VERSE_TEXT,
          subtitle: row.SUBTITLE,
        }));

        resolve(verses);
      }
    }, from, to);
  });
};

export const searchVersesController = (query: string, limit?: number) => {
  return new Promise((resolve, reject) => {
    searchVersesModel(
      query,
      (error, rows) => {
        if (error) {
          reject(error);
        } else {
          const results = rows.map((row) => {
            const r = row as any;
            return {
              book: r.BOOK_NAME,
              bookNorm: r.BOOK_NAME_NORM,
              chapter: r.CHAPTER,
              verse: r.VERSE_ID,
              text: r.VERSE_TEXT,
              subtitle: r.SUBTITLE,
            };
          });

          resolve(results);
        }
      },
      limit
    );
  });
};

export const getRandomVerseController = () => {
  return new Promise((resolve, reject) => {
    getRandomVerseModel((error, rows) => {
      if (error) {
        reject(error);
      } else if (rows.length === 0) {
        reject(new Error("No verses found"));
      } else {
        const row = rows[0] as any;
        resolve({
          book: row.BOOK_NAME,
          bookNorm: row.BOOK_NAME_NORM,
          chapter: row.CHAPTER,
          verse: row.VERSE_ID,
          text: row.VERSE_TEXT,
          subtitle: row.SUBTITLE,
        });
      }
    });
  });
};
