export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  city: string;
  address: string;
  postcode: string;
  email: string;
  phone: string;
  status: "Actief" | "Inactief";
  familyId: string;
  role: string;
  joined: string;
  preferredName?: string;
  birthPlace?: string;
  nationality?: string;
  language?: string;
  occupation?: string;
  membershipType?: string;
  contactPreference?: string;
  customFields?: { label: string; value: string }[];
};
const names = [
  ["Youssef", "Haddad"],
  ["Sara", "Haddad"],
  ["Anna", "Haddad"],
  ["Lucas", "Haddad"],
  ["Hanna", "Youssef"],
  ["Elias", "Ibrahim"],
  ["Miriam", "Gewargis"],
  ["Michael", "Karam"],
  ["Sara", "Karam"],
  ["George", "Nahas"],
  ["Rima", "Abdallah"],
  ["Daniel", "Haddad"],
  ["Nour", "Khoury"],
  ["Lina", "Nahas"],
  ["Adam", "Ibrahim"],
  ["Eva", "Abdallah"],
  ["Noah", "Khoury"],
  ["Maya", "Youssef"],
  ["Sami", "Gewargis"],
  ["Lea", "Karam"],
  ["Milan", "Nahas"],
  ["Emma", "Khoury"],
  ["David", "Abdallah"],
  ["Sofia", "Ibrahim"],
];
export const families = [
  {
    id: "G-001",
    name: "Haddad",
    city: "Oldenzaal",
    address: "Voorbeeldlaan 12",
    postcode: "0000 AA",
    contact: "L-1001",
  },
  {
    id: "G-002",
    name: "Youssef",
    city: "Enschede",
    address: "Demostraat 8",
    postcode: "0000 AB",
    contact: "L-1005",
  },
  {
    id: "G-003",
    name: "Ibrahim",
    city: "Oldenzaal",
    address: "Fictiefplein 4",
    postcode: "0000 AC",
    contact: "L-1006",
  },
  {
    id: "G-004",
    name: "Gewargis",
    city: "Hengelo",
    address: "Voorbeeldweg 21",
    postcode: "0000 AD",
    contact: "L-1007",
  },
  {
    id: "G-005",
    name: "Karam",
    city: "Enschede",
    address: "Testlaan 3",
    postcode: "0000 AE",
    contact: "L-1008",
  },
  {
    id: "G-006",
    name: "Nahas",
    city: "Hengelo",
    address: "Demopad 5",
    postcode: "0000 AF",
    contact: "L-1010",
  },
  {
    id: "G-007",
    name: "Abdallah",
    city: "Oldenzaal",
    address: "Fictiefstraat 7",
    postcode: "0000 AG",
    contact: "L-1011",
  },
  {
    id: "G-008",
    name: "Khoury",
    city: "Enschede",
    address: "Voorbeeldhof 14",
    postcode: "0000 AH",
    contact: "L-1013",
  },
];
export const members: Member[] = names.map(([firstName, lastName], i) => {
  const family = families.find((f) => f.name === lastName)!;
  return {
    id: `L-${1001 + i}`,
    firstName,
    lastName,
    birthDate:
      i === 2 ? "2016-01-16" : i === 3 ? "2019-09-28" : `${1980 + i}-03-12`,
    city: family.city,
    address: family.address,
    postcode: family.postcode,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: "Niet vastgelegd",
    status: i % 7 === 6 ? "Inactief" : "Actief",
    familyId: family.id,
    role:
      family.contact === `L-${1001 + i}`
        ? "Contactpersoon"
        : i === 2 || i === 3
          ? "Kind"
          : "Gezinslid",
    joined: "2023-06-14",
  };
});
export const fullName = (m: Member) => `${m.firstName} ${m.lastName}`;
export const date = (value: string) =>
  new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
export const activities = [
  {
    id: "A-1",
    memberId: "L-1012",
    title: "Lid ingeschreven",
    description: "Daniel Haddad toegevoegd aan het ledenregister",
    date: "2026-10-16",
    type: "Inschrijving",
  },
  {
    id: "A-2",
    memberId: "L-1001",
    title: "Adresgegevens gecontroleerd",
    description: "Gezinsgegevens van familie Haddad bijgewerkt",
    date: "2026-10-15",
    type: "Gezin",
  },
  {
    id: "A-3",
    memberId: "L-1006",
    title: "Contactgegevens bijgewerkt",
    description: "E-mailadres van Elias Ibrahim gewijzigd",
    date: "2026-10-14",
    type: "Wijziging",
  },
  {
    id: "A-4",
    memberId: "L-1007",
    title: "Lidmaatschap gewijzigd",
    description: "Miriam Gewargis gemarkeerd als inactief",
    date: "2026-10-13",
    type: "Lidmaatschap",
  },
  {
    id: "A-5",
    memberId: "L-1008",
    title: "Gezinskoppeling gecontroleerd",
    description: "Michael Karam gekoppeld aan gezin Karam",
    date: "2026-10-12",
    type: "Gezin",
  },
];
