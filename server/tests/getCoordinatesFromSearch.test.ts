import axios from "axios";
import { getCoordinatesFromSearch } from "../src/utils/getCoordinatesFromSearch";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getCoordinatesFromSearch", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return coordinates when API returns valid data", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                features: [
                    {
                        geometry: {
                            coordinates: [2.3522, 48.8566],
                        },
                    },
                ],
            },
        });

        const result = await getCoordinatesFromSearch("Paris");

        expect(result).toEqual({ lng: 2.3522, lat: 48.8566 });
        expect(mockedAxios.get).toHaveBeenCalledWith(
            "https://data.geopf.fr/geocodage/search?q=Paris"
        );
    });

    it("should return null when no features found", async () => {
        mockedAxios.get.mockResolvedValue({
            data: { features: [] },
        });

        const result = await getCoordinatesFromSearch("Unknown Place");

        expect(result).toBeNull();
    });

    it("should return null when API returns invalid data structure", async () => {
        mockedAxios.get.mockResolvedValue({
            data: { invalid: "data" },
        });

        const result = await getCoordinatesFromSearch("Test");

        expect(result).toBeNull();
    });

    it("should return null when features have no coordinates", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                features: [
                    { geometry: { coordinates: [] } },
                    { geometry: null },
                ],
            },
        });

        const result = await getCoordinatesFromSearch("Test");

        expect(result).toBeNull();
    });

    it("should return null and log error when API call fails", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        mockedAxios.get.mockRejectedValue(new Error("Network error"));

        const result = await getCoordinatesFromSearch("Test");

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it("should encode special characters in search word", async () => {
        mockedAxios.get.mockResolvedValue({ data: { features: [] } });

        await getCoordinatesFromSearch("Paris 75001");

        expect(mockedAxios.get).toHaveBeenCalledWith(
            "https://data.geopf.fr/geocodage/search?q=Paris%2075001"
        );
    });
});
