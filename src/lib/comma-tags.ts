/** Comma-split `input`, append tokens not already in `current`; `duplicates` are skipped repeats. */
export function mergeCommaSeparatedUnique(
  input: string,
  current: string[]
): { merged: string[]; duplicates: string[] } {
  const val = input.trim();
  if (!val) return { merged: current, duplicates: [] };

  const pieces = val.split(",").map((s) => s.trim()).filter(Boolean);
  const duplicates: string[] = [];
  const merged = [...current];

  for (const piece of pieces) {
    if (merged.includes(piece)) {
      if (!duplicates.includes(piece)) duplicates.push(piece);
    } else {
      merged.push(piece);
    }
  }

  return { merged, duplicates };
}

export function duplicateTagsMessage(duplicates: string[]): string | null {
  if (duplicates.length === 0) return null;
  if (duplicates.length === 1) {
    return `"${duplicates[0]}" is already in your tech stack.`;
  }
  return `Already in your tech stack: ${duplicates.join(", ")}.`;
}
