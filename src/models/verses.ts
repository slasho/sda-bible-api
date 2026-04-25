import { bibleDb } from "~/database/bibleDb";
import { VerseRowProps } from "~/types/bible";

export const getVersesModel = (
  bookName: string,
  chapter: string,
  callback: (error: Error | null, rows: VerseRowProps[]) => void,
  from?: number,
  to?: number
) => {
  let sql = `SELECT VERSES.IMAGE, VERSE_ID, VERSE_TEXT, SUBTITLE
    FROM VERSES
    INNER JOIN BOOKS ON VERSES.BOOK_ID = BOOKS.BOOK_ID
    WHERE BOOKS.BOOK_NAME_NORM = ? AND CHAPTER = ?`;

  const params: (string | number)[] = [bookName, chapter];

  if (from !== undefined && to !== undefined) {
    sql += ` AND VERSE_ID BETWEEN ? AND ?`;
    params.push(from, to);
  } else if (from !== undefined) {
    sql += ` AND VERSE_ID >= ?`;
    params.push(from);
  } else if (to !== undefined) {
    sql += ` AND VERSE_ID <= ?`;
    params.push(to);
  }

  sql += ` ORDER BY VERSE_ID ASC`;

  bibleDb.all(sql, params, callback);
};

export const getRandomVerseModel = (
  callback: (error: Error | null, rows: VerseRowProps[]) => void
) => {
  const sql = `SELECT VERSES.IMAGE, VERSE_ID, VERSE_TEXT, SUBTITLE, BOOKS.BOOK_NAME, BOOKS.BOOK_NAME_NORM, CHAPTER
    FROM VERSES
    INNER JOIN BOOKS ON VERSES.BOOK_ID = BOOKS.BOOK_ID
    ORDER BY RANDOM() LIMIT 1`;

  bibleDb.all(sql, [], callback);
};
