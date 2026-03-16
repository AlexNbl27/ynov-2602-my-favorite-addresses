/**
 * Tests unitaires pour les fonctions de validation
 * Extraites du controller Users pour une meilleure testabilite
 */

// Fonctions de validation (copies pour test unitaire)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

const isValidPassword = (password: string): boolean => {
    return password.length >= MIN_PASSWORD_LENGTH;
};

describe("Email Validation", () => {
    describe("valid emails", () => {
        const validEmails = [
            "test@example.com",
            "user.name@domain.org",
            "user+tag@domain.com",
            "a@b.co",
            "test123@test123.com",
            "UPPERCASE@DOMAIN.COM",
        ];

        validEmails.forEach((email) => {
            it(`should accept "${email}"`, () => {
                expect(isValidEmail(email)).toBe(true);
            });
        });
    });

    describe("invalid emails", () => {
        const invalidEmails = [
            "plaintext",
            "@nodomain.com",
            "noat.domain.com",
            "spaces in@email.com",
            "test@",
            "@",
            "",
            "test @domain.com",
            "test@ domain.com",
        ];

        invalidEmails.forEach((email) => {
            it(`should reject "${email}"`, () => {
                expect(isValidEmail(email)).toBe(false);
            });
        });
    });
});

describe("Password Validation", () => {
    describe("valid passwords", () => {
        const validPasswords = [
            "12345678",
            "password",
            "verylongpassword123!@#",
            "aaaaaaaa",
        ];

        validPasswords.forEach((password) => {
            it(`should accept password of length ${password.length}`, () => {
                expect(isValidPassword(password)).toBe(true);
            });
        });
    });

    describe("invalid passwords", () => {
        const invalidPasswords = ["", "1", "1234567", "abcdefg"];

        invalidPasswords.forEach((password) => {
            it(`should reject password of length ${password.length}`, () => {
                expect(isValidPassword(password)).toBe(false);
            });
        });
    });

    it("should accept exactly 8 characters", () => {
        expect(isValidPassword("12345678")).toBe(true);
    });

    it("should reject 7 characters", () => {
        expect(isValidPassword("1234567")).toBe(false);
    });
});
