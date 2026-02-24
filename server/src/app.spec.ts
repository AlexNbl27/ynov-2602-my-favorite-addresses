import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { faker } from "@faker-js/faker";

describe("User Account Creation", () => {
    beforeAll(async () => {
        await datasource.initialize();
    });

    afterAll(async () => {
        await datasource.destroy();
    });

    it("should create a user account with specific email and password", async () => {
        const response = await request(app)
            .post("/api/users")
            .send({
                email: "test@test.com",
                password: "supersecret",
            });

        expect(response.status).toBe(200);
        expect(response.body.item).toBeDefined();
        expect(response.body.item.email).toBe("test@test.com");
    });

    it("should create a user account with random email and password using faker", async () => {
        const randomEmail = faker.internet.email();
        const randomPassword = faker.internet.password();

        const response = await request(app)
            .post("/api/users")
            .send({
                email: randomEmail,
                password: randomPassword,
            });

        expect(response.status).toBe(200);
        expect(response.body.item).toBeDefined();
        expect(response.body.item.email).toBe(randomEmail);
    });
});
