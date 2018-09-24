/**
 * Character codes that will be frequently referred to across the program.
 */
export const enum Characters {
  // Numbers
  $0 = 48,
  $1 = 49,
  $2 = 50,
  $3 = 51,
  $4 = 52,
  $5 = 53,
  $6 = 54,
  $7 = 55,
  $8 = 56,
  $9 = 57,

  // Letters
  $A = 65,
  $Z = 90,
  $a = 97,
  $z = 122,

  // Symbols
  $_ = 95,

  // Misc
  $CR = 13,
  $LF = 10,
  $SPACE = 32,
  $TAB = 9,
}

/**
 * Returns whether @param character is considered a digit.
 */
export function isDigit(character: number): boolean {
  return character >= Characters.$0 && character <= Characters.$9;
}

/**
 * Returns whether @param character is considered a letter.
 */
export function isLetter(character: number): boolean {
  return (
    (character >= Characters.$A && character <= Characters.$Z) ||
    (character >= Characters.$a && character <= Characters.$z)
  );
}

/**
 * Returns whether @param character is considered a new line terminator.
 */
export function isNewLine(character: number): boolean {
  return character === Characters.$CR || character === Characters.$LF;
}

/**
 * Returns whether @param character is considered whitespace.
 */
export function isWhiteSpace(character: number): boolean {
  return (
    character === Characters.$SPACE ||
    character === Characters.$TAB ||
    isNewLine(character)
  );
}

/**
 * Splits a string @param text into individual lines.
 *
 * A line is considered "terminated" by either a CR (U+000D), a LF (U+OOOA), a
 * CR+LF (DOS line ending), and a final non-empty line can be ended simply by
 * the end of the string.
 *
 * The returned lines do not contain any line terminators.
 */
export function splitLines(text: string): string[] {
  const lines: string[] = [];
  const length = text.length;
  let sliceStart = 0;
  let currentChar = 0;
  for (let i = 0; i < length; i++) {
    const previousChar = currentChar;
    currentChar = text.codePointAt(i)!;
    if (currentChar !== Characters.$CR) {
      if (currentChar !== Characters.$LF) {
        continue;
      }
      if (previousChar === Characters.$CR) {
        sliceStart = i + 1;
        continue;
      }
    }
    lines.push(text.substring(sliceStart, i));
    sliceStart = i + 1;
  }
  if (sliceStart < length) {
    lines.push(text.substring(sliceStart, length));
  }
  return lines;
}