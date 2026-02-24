import express, { Request, Response } from "express";
import { countOccurrences } from "./wordCount";

const app = express();
app.use(express.json());

/**
 * POST /word-count
 * Receives a text and a word to search for,
 * and returns the number of occurrences of the word in the text.
 *
 * @body {{ text: string, word: string }}
 * @returns {{ word: string, occurrences: number }}
 */
app.post("/word-count", (req: Request, res: Response) => {
    const { text, word } = req.body as { text?: string; word?: string };

    if (typeof text !== "string" || typeof word !== "string") {
        res.status(400).json({ error: "Les champs 'text' et 'word' sont requis et doivent être des chaînes de caractères." });
        return;
    }

    const occurrences = countOccurrences(text, word);
    res.status(200).json({ word, occurrences });
});

export default app;
