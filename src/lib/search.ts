/** Match every search word, independent of order, accents or capitalization. */
export function matchesSearch(
  query: string,
  ...values: (string | undefined)[]
) {
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("nl");
  const haystack = normalize(values.filter(Boolean).join(" "));
  return normalize(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}
