/**
 * Returns an array of alphabet positions for each letter in the given word.
 * 'A' or 'a' is 1, 'B' or 'b' is 2, and so on.
 * @param word - The input word (case-insensitive)
 * @returns An array of numbers representing the alphabet positions
 */
export function getAlphabetPositions(word: string): number[] {
  return word.toLowerCase().split('').map(char => {
    const position = char.charCodeAt(0) - 96;
    if (position < 1 || position > 26) {
      throw new Error(`Invalid character '${char}' in word. Only letters are allowed.`);
    }
    return position;
  });
}
