/**
 * Counts the number of occurrences of a word in a given text.
 * The search is case-insensitive and matches whole words only.
 *
 * @param text - The text to search in.
 * @param word - The word to search for.
 * @returns The number of times the word appears in the text.
 */
export function countOccurrences(text: string, word: string): number {
    if (!word || !text) return 0;

    // Escape special regex characters in the word
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}
