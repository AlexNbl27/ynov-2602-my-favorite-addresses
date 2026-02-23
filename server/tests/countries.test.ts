import { getCountriesStartingWith } from "./countries";

const mockApiResponse = {
    data: {
        "DZ": { country: "Algeria", region: "Africa" },
        "FR": { country: "France", region: "Europe" },
        "FI": { country: "Finland", region: "Europe" },
        "DE": { country: "Germany", region: "Europe" },
    },
};

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve(mockApiResponse),
    })
) as jest.Mock;

describe("getCountriesStartingWith", () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('should return countries starting with the letter "F" (API Mock)', async () => {
        const result = await getCountriesStartingWith("F");
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(result).toEqual(["France", "Finland"]);
    });

    it("should be case-insensitive", async () => {
        const result = await getCountriesStartingWith("fI");
        expect(result).toEqual(["Finland"]);
    });

    it("should return an empty array if no match", async () => {
        const result = await getCountriesStartingWith("Z");
        expect(result).toEqual([]);
    });
});
