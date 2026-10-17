/** Small valid PDFs with explicitly fictional content; no external resources. */
function demoPdf(title: string) {
  const content = `BT /F1 12 Tf 24 150 Td (${title}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 210] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let source = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(source.length);
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = source.length;
  source += `xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return { base64: btoa(source), size: source.length };
}
export const demoRecords = [
  {
    kind: "member" as const,
    owner: "L-1006",
    title: "Inschrijving controleren",
    category: "Inschrijving",
    status: "Open" as const,
    file: "Fictief-inschrijfformulier.pdf",
  },
  {
    kind: "family" as const,
    owner: "G-003",
    title: "Adresgegevens gezin controleren",
    category: "Adreswijziging",
    status: "In behandeling" as const,
    file: "Fictief-adresformulier.pdf",
  },
  {
    kind: "member" as const,
    owner: "L-1013",
    title: "Lidmaatschap bijwerken",
    category: "Lidmaatschap",
    status: "In behandeling" as const,
    file: "Fictieve-bevestiging.pdf",
  },
  {
    kind: "family" as const,
    owner: "G-008",
    title: "Welkomstbrief gezin",
    category: "Correspondentie",
    status: "Afgerond" as const,
    file: "Fictieve-welkomstbrief.pdf",
  },
  {
    kind: "member" as const,
    owner: "L-1010",
    title: "Contactgegevens aanvullen",
    category: "Algemeen",
    status: "Open" as const,
    file: "Fictief-contactformulier.pdf",
  },
  {
    kind: "family" as const,
    owner: "G-006",
    title: "Gezinsregistratie controleren",
    category: "Algemeen",
    status: "Afgerond" as const,
    file: "Fictief-gezinsoverzicht.pdf",
  },
].map((record, index) => ({
  ...record,
  index,
  document: demoPdf(
    `ANTIOCH - FICTIEF VOORBEELD ${index + 1} - GEEN ECHTE GEGEVENS`,
  ),
}));
