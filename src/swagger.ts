import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SDA Bible API",
      version: "1.0.0",
      description: "REST API for accessing Bible verses, chapters, and books",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      { name: "Books", description: "Bible books" },
      { name: "Chapters", description: "Chapters per book" },
      { name: "Verses", description: "Verses per chapter" },
      { name: "Random", description: "Random verse" },
    ],
    paths: {
      "/api/bible/books": {
        get: {
          tags: ["Books"],
          summary: "Get all books",
          responses: {
            "200": {
              description: "List of all Bible books",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Book" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/bible/books/{bookName}/chapters": {
        get: {
          tags: ["Chapters"],
          summary: "Get chapters by book",
          parameters: [
            {
              name: "bookName",
              in: "path",
              required: true,
              description: "Normalized book name (e.g. genesis, juan)",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "List of chapters",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Chapter" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/bible/books/{bookName}/chapters/{chapter}/verses": {
        get: {
          tags: ["Verses"],
          summary: "Get verses by book and chapter",
          parameters: [
            {
              name: "bookName",
              in: "path",
              required: true,
              description: "Normalized book name (e.g. genesis, juan)",
              schema: { type: "string" },
            },
            {
              name: "chapter",
              in: "path",
              required: true,
              description: "Chapter number",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "from",
              in: "query",
              required: false,
              description: "Start verse number (inclusive)",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "to",
              in: "query",
              required: false,
              description: "End verse number (inclusive)",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "List of verses",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Verse" },
                  },
                },
              },
            },
            "400": {
              description: "Invalid query parameters",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/bible/random": {
        get: {
          tags: ["Random"],
          summary: "Get a random verse",
          responses: {
            "200": {
              description: "A random Bible verse",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RandomVerse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Book: {
          type: "object",
          properties: {
            bookId: { type: "integer", example: 1 },
            bookName: { type: "string", example: "Génesis" },
            bookNameNorm: { type: "string", example: "genesis" },
            chapters: { type: "integer", example: 50 },
            testament: { type: "integer", example: 1 },
          },
        },
        Chapter: {
          type: "object",
          properties: {
            chapter: { type: "integer", example: 1 },
            verses: { type: "integer", example: 31 },
          },
        },
        Verse: {
          type: "object",
          properties: {
            verse: { type: "integer", example: 1 },
            text: { type: "string", example: "En el principio creó Dios los cielos y la tierra." },
            subtitle: { type: "string", example: "" },
          },
        },
        RandomVerse: {
          type: "object",
          properties: {
            book: { type: "string", example: "Génesis" },
            bookNorm: { type: "string", example: "genesis" },
            chapter: { type: "integer", example: 1 },
            verse: { type: "integer", example: 1 },
            text: { type: "string", example: "En el principio creó Dios los cielos y la tierra." },
            subtitle: { type: "string", example: "" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Invalid 'from' parameter" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
