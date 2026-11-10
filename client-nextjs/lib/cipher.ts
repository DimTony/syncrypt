// Simple Caesar cipher. The shift is derived from the sum of the key's char codes.

const deriveShift = (key: string): number => {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum % 26;
};

const shiftText = (text: string, shift: number): string => {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (code >= 65 && code <= 90) {
      result += String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
      result += String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    } else {
      result += text[i];
    }
  }

  return result;
};

export const encryptText = (text: string, key: string): string =>
  !text || !key ? "" : shiftText(text, deriveShift(key));

export const decryptText = (text: string, key: string): string =>
  !text || !key ? "" : shiftText(text, -deriveShift(key));
