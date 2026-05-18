/**
 * Parse JSON from LLM response, handling markdown code blocks.
 */
export function parseJSONFromLLM<T>(response: string): T {
  let cleaned = response.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  const jsonStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");

  let start = -1;
  if (jsonStart >= 0 && arrayStart >= 0) {
    start = Math.min(jsonStart, arrayStart);
  } else if (jsonStart >= 0) {
    start = jsonStart;
  } else if (arrayStart >= 0) {
    start = arrayStart;
  }

  if (start > 0) {
    cleaned = cleaned.slice(start);
  }

  const isArray = cleaned.startsWith("[");
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === openBracket) {
      depth++;
    } else if (char === closeBracket) {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end > 0) {
    cleaned = cleaned.slice(0, end);
  }

  return JSON.parse(cleaned) as T;
}
