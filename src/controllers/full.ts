import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

import { bibleDb } from "~/database/bibleDb";

interface FullRow {
  BOOK_ID: number;
  BOOK_NAME: string;
  BOOK_NAME_NORM: string;
  BIBLE_NAME: string;
  CHAPTER: number;
  VERSE_ID: number;
  VERSE_TEXT: string;
  SUBTITLE: string | null;
}

interface FullVerse {
  verse: number;
  text: string;
  subtitle: string | null;
}

interface FullBook {
  book_id: number;
  book_name_id: string;
  book_name: string;
  chapters_count: number;
  translation_name: string;
  // chapters[i] = verses of chapter (i + 1)
  chapters: FullVerse[][];
}

export interface FullBible {
  version: string;
  translation_name: string;
  books: FullBook[];
}

export interface FullBiblePayload {
  json: Buffer;
  gzip: Buffer;
  etag: string;
}

let cache: Promise<FullBiblePayload> | null = null;

const loadRows = () =>
  new Promise<FullRow[]>((resolve, reject) => {
    const sql = `SELECT BOOKS.BOOK_ID, BOOKS.BOOK_NAME, BOOKS.BOOK_NAME_NORM, BIBLES.BIBLE_NAME,
        VERSES.CHAPTER, VERSES.VERSE_ID, VERSES.VERSE_TEXT, VERSES.SUBTITLE
      FROM VERSES
      INNER JOIN BOOKS ON VERSES.BOOK_ID = BOOKS.BOOK_ID
      INNER JOIN BIBLES ON BOOKS.BIBLE_ID = BIBLES.ID
      ORDER BY BOOKS.BOOK_ORDER ASC, BOOKS.BOOK_ID ASC, VERSES.CHAPTER ASC, VERSES.VERSE_ID ASC`;

    bibleDb.all(sql, [], (error: Error | null, rows: FullRow[]) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });

const buildPayload = async (): Promise<FullBiblePayload> => {
  const rows = await loadRows();
  const books: FullBook[] = [];
  const byId = new Map<number, FullBook>();

  for (const row of rows) {
    let book = byId.get(row.BOOK_ID);
    if (!book) {
      book = {
        book_id: row.BOOK_ID,
        book_name_id: row.BOOK_NAME_NORM,
        book_name: row.BOOK_NAME,
        chapters_count: 0,
        translation_name: row.BIBLE_NAME,
        chapters: [],
      };
      byId.set(row.BOOK_ID, book);
      books.push(book);
    }

    const idx = row.CHAPTER - 1;
    while (book.chapters.length <= idx) book.chapters.push([]);
    book.chapters[idx]!.push({
      verse: row.VERSE_ID,
      text: row.VERSE_TEXT,
      subtitle: row.SUBTITLE,
    });
  }

  for (const book of books) book.chapters_count = book.chapters.length;

  const body = { translation_name: books[0]?.translation_name ?? "", books };
  const hash = createHash("sha1").update(JSON.stringify(body)).digest("hex").slice(0, 16);
  const full: FullBible = { version: hash, ...body };

  const json = Buffer.from(JSON.stringify(full));
  return { json, gzip: gzipSync(json, { level: 9 }), etag: `"${hash}"` };
};

// Built once per process: the Bible text never changes at runtime.
export const getFullBibleController = (): Promise<FullBiblePayload> => {
  if (!cache) {
    cache = buildPayload().catch((error) => {
      cache = null;
      throw error;
    });
  }
  return cache;
};
