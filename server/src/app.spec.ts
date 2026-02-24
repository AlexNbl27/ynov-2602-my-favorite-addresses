import request from "supertest";
import { DataSource } from "typeorm";
import app from "./app";
import { User } from "./entities/User";
import { Address } from "./entities/Address";

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
