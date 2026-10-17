# Antioch Administration

Een zakelijke, Nederlandstalige eerste versie voor leden- en gezinsadministratie, gebouwd met Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-patronen (Radix Tabs en Slot, CVA) en Lucide. Alle namen, relaties, adressen en activiteiten zijn fictief. E-mailadressen gebruiken het gereserveerde domein `example.com`.

## Starten

Gebruik Node.js 22 of hoger en npm (ontwikkeld met Node 24).

```bash
npm ci
npm run dev
```

Open de app op poort 3000 in uw lokale ontwikkelomgeving. Voor een productiebuild:

```bash
npm run build
npm start
```

## Beschikbare functies

- Dashboard met registertotalen en recente, gekoppelde administratieve activiteiten.
- Ledenregister met zoeken op naam, lidnummer, adres, woonplaats en e-mail; filters op woonplaats/status; sortering en paginering.
- Ledenprofielen met tabbladen voor overzicht, persoonsgegevens, gezin, lidmaatschap en logboek.
- Gezinsregister met zoeken, woonplaatsfilter en gekoppelde leden- en gezinsprofielen.
- Desktop- en iPad-layout; op kleine schermen een inklapbaar navigatiemenu.
- Grafregister en Begraafplaats zijn uitgeschakeld en gelabeld met ‘Binnenkort’.

Dit is een **alleen-lezen demonstratie**. Er zijn geen opslag, login, autorisaties, documenten of bewerkacties actief. De activiteitendata zijn een vaste fictieve momentopname, geen audittrail. Er worden geen gegevens naar Supabase verzonden.

## Supabase voorbereiden

De optionele clientfactory staat in `src/lib/supabase.ts`. Zonder configuratie retourneert deze `null`; alle schermen blijven werken met `src/lib/data.ts`. Kopieer desgewenst `.env.example` naar `.env.local` en configureer later `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Gebruik nooit een service-role key in publieke variabelen.

Voor echte database- en loginfunctionaliteit zijn een datamodel/migraties, Row Level Security, gebruikersrollen, sessiebeheer met Supabase SSR en server-side autorisatie nodig. Deze zijn bewust nog niet aangesloten. Voeg geen echte persoonsgegevens toe aan de demodata.

## Controles

```bash
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm test
```

De Playwright-suite start de productieapp op poort 3000 en test zoeken, filters, paginering, profieltabbladen, gezinskoppelingen, 404's en responsive navigatie. De suite draait voor desktop en iPad-formaat. In een minimale Linux-omgeving kunnen browserbibliotheken nodig zijn (`npx playwright install --with-deps chromium`).

In de cloudomgeving is de standaardcache niet schrijfbaar. Gebruik daar `npm ci --cache /workspace/.npm-cache` en `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium`. Gebruik dezelfde browserpadvariabele bij `npm test`.

## Structuur

- `src/app/`: App Router-pagina's, layout en stijlen.
- `src/components/ui/`: aanpasbare shadcn/ui-bouwstenen; configuratie in `components.json`.
- `src/components/`: navigatie, registers en profielen.
- `src/lib/`: getypeerde fictieve data, utilities en optionele Supabase-client.
- `tests/`: functionele browsercontroles.

Gebruik de bestaande checkout; een extra Git-worktree is niet nodig. Afhankelijkheden zijn vastgelegd in `package-lock.json`.

Een al geïnstalleerde Chromium gebruiken kan met `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`; dan is downloaden niet nodig.

## GitHub Pages

De workflow `.github/workflows/pages.yml` bouwt en publiceert automatisch bij pushes naar `main` en `feat/antioch-administration`. Kies in GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions**. Open daarna onder **Actions** de laatste uitvoering van **Publiceer Antioch Administration** op de implementatiebranch en kies indien nodig **Re-run all jobs**. Zodra de workflow ook op de standaardbranch staat, is handmatig starten via **Run workflow** beschikbaar.

De website is na succesvolle publicatie beschikbaar op `https://idkmanlool9.github.io/Mor-Ephrem/`. De volledige demo wordt statisch geëxporteerd, inclusief alle leden- en gezinsprofielen. GitHub Pages draait geen Next.js-server; databaseopslag en server-side login worden hiermee niet gepubliceerd.

Lokaal dezelfde export bouwen:

```bash
GITHUB_PAGES=true npm run build
```

De export staat in `out/`; assets en navigatie gebruiken het projectpad `/Mor-Ephrem`. Zonder `GITHUB_PAGES=true` blijven de normale ontwikkelserver en productiebuild beschikbaar.
