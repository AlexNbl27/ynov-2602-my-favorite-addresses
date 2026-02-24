import request from "supertest";
import { DataSource } from "typeorm";
import { faker } from "@faker-js/faker";
import app from "./app";
import { User } from "./entities/User";
import { Address } from "./entities/Address";

// ---------------------------------------------------------------------------
// Configuration de la base de données de test (In-memory SQLite)
// ---------------------------------------------------------------------------
const testDataSource = new DataSource({
    type: "better-sqlite3",
    database: ":memory:",
    entities: [User, Address],
    synchronize: true,
    logging: false,
});

// Variable pour stocker le token de l'utilisateur créé dynamiquement
let authToken: string;

beforeAll(async () => {
    await testDataSource.initialize();
    User.useDataSource(testDataSource);
    Address.useDataSource(testDataSource);
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

// 2. Login et récupération du profil (Test de flux)
describe("Auth Flow", () => {
    const userEmail = faker.internet.email();
    const userPassword = faker.internet.password();

    it("should register, login and get profile", async () => {
        // Étape A : Création
        await request(app)
            .post("/api/users")
            .send({ email: userEmail, password: userPassword });

        // Étape B : Login pour obtenir le token
        const loginRes = await request(app)
            .post("/api/users/tokens")
            .send({ email: userEmail, password: userPassword });

        authToken = loginRes.body.token;
        expect(authToken).toBeDefined();

        // Étape C : Accès au profil avec le Bearer token
        const profileRes = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${authToken}`);

        expect(profileRes.status).toBe(200);
        expect(profileRes.body.item.email).toBe(userEmail);
    });
});

// 3. Tests d'erreurs
describe("Error Handling", () => {
    it("should return 400 when creating a user with an existing email", async () => {
        const duplicateEmail = faker.internet.email();
        const password = faker.internet.password();

        // Premier enregistrement
        await request(app).post("/api/users").send({ email: duplicateEmail, password });

        // Deuxième enregistrement (doublon)
        const response = await request(app).post("/api/users").send({ email: duplicateEmail, password });

        expect(response.status).toBe(400);
    });
});
});