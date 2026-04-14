export function readFormString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

export function parseTags(rawTags: string): string[] {
  const tags = rawTags
    .split(",")
    .map((tag) => normalizeTag(tag))
    .filter(Boolean);

  return [...new Set(tags)].slice(0, 10);
}

export function serializeTags(tags: string[]): string {
  return tags.join(", ");
}

export function normalizeSearchQuery(value: string): string {
  return value.replace(/[%_,'"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function validatePostContent(value: string): string | null {
  if (value.length < 1 || value.length > 280) {
    return "Post content must be between 1 and 280 characters.";
  }

  return null;
}

export function validateCommentContent(value: string): string | null {
  if (value.length < 1 || value.length > 280) {
    return "Comment must be between 1 and 280 characters.";
  }

  return null;
}
