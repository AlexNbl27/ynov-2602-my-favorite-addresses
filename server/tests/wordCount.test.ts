import request from "supertest";
import app from "./wordCountApp";

describe("POST /word-count – integration test", () => {
    it("should count occurrences of a word in a simple text", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "the cat eats the cat", word: "cat" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ word: "cat", occurrences: 2 });
    });

    it("should be case-insensitive", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "Cat CAT cat", word: "cat" });

        expect(response.status).toBe(200);
        expect(response.body.occurrences).toBe(3);
    });

    it("should return 0 when the word is not found", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "hello world", word: "cat" });

        expect(response.status).toBe(200);
        expect(response.body.occurrences).toBe(0);
    });

    it("should return 0 when the text is empty", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "", word: "cat" });

        expect(response.status).toBe(200);
        expect(response.body.occurrences).toBe(0);
    });

    it("should not count substrings – 'cat' should not match 'caterpillar'", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "caterpillar caterpillars", word: "cat" });

        expect(response.status).toBe(200);
        expect(response.body.occurrences).toBe(0);
    });

    it("should return 400 when 'text' field is missing", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ word: "cat" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when 'word' field is missing", async () => {
        const response = await request(app)
            .post("/word-count")
            .send({ text: "hello world" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });
});
