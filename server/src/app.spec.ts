import request from "supertest";
import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import app from "./app";
import { User } from "./entities/User";
import { Address } from "./entities/Address";
import { getCoordinatesFromSearch } from "./utils/getCoordinatesFromSearch";
import argon2 from "argon2";

jest.mock("./utils/getCoordinatesFromSearch");

// ---------------------------------------------------------------------------
// In-memory SQLite database – fully isolated from the dev database
// ---------------------------------------------------------------------------
const testDataSource = new DataSource({
    type: "better-sqlite3",
    database: ":memory:",
    // Both entities are required: User has a OneToMany relation to Address
    entities: [User, Address],
    synchronize: true,
    logging: false,
});

// Shared state across the test suite (populated progressively)
const credentials = {
    email: `test-${Date.now()}@example.com`,
    password: "password123",
};
let authToken: string;

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------
beforeAll(async () => {
    await testDataSource.initialize();
    User.useDataSource(testDataSource);
    Address.useDataSource(testDataSource);
});

afterAll(async () => {
    await testDataSource.destroy();
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

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe("Users API – integration tests", () => {
    // 1. Create user ---------------------------------------------------------
    describe("POST /api/users", () => {
        it("should create a new user and return 200 with the user object", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({ email: credentials.email, password: credentials.password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("item");
            expect(response.body.item).toHaveProperty("id");
            expect(response.body.item.email).toBe(credentials.email);
        });

        it("should return 400 when email is missing", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({ password: credentials.password });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should return 400 when password is missing", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({ email: credentials.email });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should return 400 when email already exists", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({ email: credentials.email, password: "somepassword" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Email already exists");
        });

        it("should return 500 when user creation fails randomly", async () => {
            // Mock argon2.hash to throw an error
            const originalHash = argon2.hash;
            (argon2 as any).hash = jest.fn().mockRejectedValue(new Error("Hash error"));

            const response = await request(app)
                .post("/api/users")
                .send({ email: "error_trigger@test.com", password: "password123" });

            expect(response.status).toBe(500);

            // Restore the original function
            (argon2 as any).hash = originalHash;
        });
    });

    // 2. Login – obtain JWT token --------------------------------------------
    describe("POST /api/users/tokens", () => {
        it("should return a JWT token when credentials are correct", async () => {
            const response = await request(app)
                .post("/api/users/tokens")
                .send({ email: credentials.email, password: credentials.password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(typeof response.body.token).toBe("string");

            // Save the token so the next describe block can use it
            authToken = response.body.token;
        });

        it("should return 400 with the wrong password", async () => {
            const response = await request(app)
                .post("/api/users/tokens")
                .send({ email: credentials.email, password: "wrongpassword" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should return 400 with an unknown email", async () => {
            const response = await request(app)
                .post("/api/users/tokens")
                .send({ email: "nobody@example.com", password: credentials.password });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should return 400 when email is missing", async () => {
            const response = await request(app)
                .post("/api/users/tokens")
                .send({ password: credentials.password });
            expect(response.status).toBe(400);
        });

        it("should return 400 when password is missing", async () => {
            const response = await request(app)
                .post("/api/users/tokens")
                .send({ email: credentials.email });
            expect(response.status).toBe(400);
        });

        it("should return 400 when verify throws an error", async () => {
            const originalVerify = argon2.verify;
            (argon2 as any).verify = jest.fn().mockRejectedValue(new Error("Verify error"));

            const response = await request(app)
                .post("/api/users/tokens")
                .send({ email: credentials.email, password: credentials.password });

            expect(response.status).toBe(400);

            (argon2 as any).verify = originalVerify;
        });
    });

    // 3. Get current user profile --------------------------------------------
    describe("GET /api/users/me", () => {
        it("should return the profile of the logged-in user when a valid Bearer token is provided", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("item");
            expect(response.body.item.email).toBe(credentials.email);
        });

        it("should return 403 when no token is provided", async () => {
            const response = await request(app).get("/api/users/me");

            expect(response.status).toBe(403);
        });

        it("should return 403 when the token is invalid", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", "Bearer invalid.token.here");

            expect(response.status).toBe(403);
        });
    });
});

describe("Addresses API – integration tests", () => {
    let addressId: number;

    it("should return 400 when creating address with missing fields", async () => {
        const res = await request(app)
            .post("/api/addresses")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ searchWord: "Paris" });
        expect(res.status).toBe(400);
    });

    it("should return 404 when search word is not found", async () => {
        (getCoordinatesFromSearch as jest.Mock).mockResolvedValue(null);
        const res = await request(app)
            .post("/api/addresses")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "Home", searchWord: "UnknownPlace" });
        expect(res.status).toBe(404);
    });

    it("should create an address when coordinates are found", async () => {
        (getCoordinatesFromSearch as jest.Mock).mockResolvedValue({ lat: 48.8566, lng: 2.3522 });
        const res = await request(app)
            .post("/api/addresses")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "Home", searchWord: "Paris", description: "City of Light" });
        expect(res.status).toBe(200);
        expect(res.body.item).toBeDefined();
        addressId = res.body.item.id;
    });

    it("should get all user addresses", async () => {
        const res = await request(app)
            .get("/api/addresses")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("should search close addresses (success)", async () => {
        const res = await request(app)
            .post("/api/addresses/searches")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ radius: 10, from: { lat: 48.8, lng: 2.3 } });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.items)).toBeTruthy();
    });

    it("should return 400 on searches if radius is missing or invalid", async () => {
        const res = await request(app)
            .post("/api/addresses/searches")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ from: { lat: 48.8, lng: 2.3 } });
        expect(res.status).toBe(400);
    });

    it("should return 400 on searches if from is missing or invalid", async () => {
        const res = await request(app)
            .post("/api/addresses/searches")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ radius: 10, from: { lat: 48.8 } });
        expect(res.status).toBe(400);
    });

    it("should update an existing address", async () => {
        const res = await request(app)
            .put(`/api/addresses/${addressId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "New Home Name", description: "Updated desc" });
        expect(res.status).toBe(200);
        expect(res.body.item.name).toBe("New Home Name");
        expect(res.body.item.description).toBe("Updated desc");
    });

    it("should return 400 when updating with invalid id", async () => {
        const res = await request(app)
            .put(`/api/addresses/abc`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "test" });
        expect(res.status).toBe(400);
    });

    it("should return 404 when updating a non-existent address", async () => {
        const res = await request(app)
            .put(`/api/addresses/9999`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "test" });
        expect(res.status).toBe(404);
    });

    it("should return 400 when deleting with invalid id", async () => {
        const res = await request(app)
            .delete(`/api/addresses/abc`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(400);
    });

    it("should return 404 when deleting a non-existent address", async () => {
        const res = await request(app)
            .delete(`/api/addresses/9999`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(404);
    });

    it("should delete an existing address", async () => {
        const res = await request(app)
            .delete(`/api/addresses/${addressId}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(204);
    });
});