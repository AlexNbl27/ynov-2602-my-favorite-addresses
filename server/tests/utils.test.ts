import { filter, map } from "./utils";

describe("Utility functions", () => {
    describe("map function", () => {
        it("should apply the transformation and call the spy function correctly", () => {
            const items = [1, 2, 3];
            const spyFunction = jest.fn((x) => x * 2);

            const result = map(items, spyFunction);

            expect(spyFunction).toHaveBeenCalledTimes(3);
            expect(spyFunction).toHaveBeenNthCalledWith(1, 1);
            expect(spyFunction).toHaveBeenNthCalledWith(2, 2);
            expect(spyFunction).toHaveBeenNthCalledWith(3, 3);
            expect(result).toEqual([2, 4, 6]);
        });
    });

    describe("filter function", () => {
        it("should filter elements and call the spy the right number of times", () => {
            const items = [10, 15, 20, 25];
            const spyFilter = jest.fn((x) => x % 2 === 0);

            const result = filter(items, spyFilter);

            expect(spyFilter).toHaveBeenCalledTimes(4);
            expect(result).toEqual([10, 20]);
        });
    });
});
