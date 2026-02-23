import { getDistance } from "../src/utils/getDistance";

describe("getDistance", () => {
    it("should calculate the correct distance between Paris and Lyon (about 392 km)", () => {
        const paris = { lat: 48.8566, lng: 2.3522 };
        const lyon = { lat: 45.7640, lng: 4.8357 };

        const distance = getDistance(paris, lyon);
        expect(Math.round(distance)).toBeGreaterThanOrEqual(390);
        expect(Math.round(distance)).toBeLessThanOrEqual(395);
    });

    it("should return 0 for the same point", () => {
        const point = { lat: 48.8566, lng: 2.3522 };
        expect(getDistance(point, point)).toBe(0);
    });
});
