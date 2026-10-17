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
- Uitgebreide ledenprofielen met roepnaam, geboorteplaats, nationaliteit, voorkeurstaal, beroep, contactvoorkeur, type lidmaatschap en maximaal 20 eigen administratieve velden.
- Gezinsregister met zoeken, woonplaatsfilter, aanmaken en bewerken, gezinsleden koppelen, contactpersoon kiezen en optioneel adressen overnemen.
- Notities toevoegen, bewerken en verwijderen bij leden en gezinnen.
- Dossiers openen en bewerken met categorie, omschrijving en status (Open, In behandeling, Afgerond).
- Lokale PDF-, PNG- en JPEG-documenten toevoegen, categoriseren, koppelen aan een dossier, downloaden en verwijderen.
- Desktop- en iPad-layout; op kleine schermen een inklapbaar navigatiemenu.
- Grafregister en Begraafplaats zijn uitgeschakeld en gelabeld met ‘Binnenkort’.

Dit is een **lokale demonstratie**. Leden aanmaken en bewerken kan met formuliercontroles; deze wijzigingen worden via localStorage uitsluitend in dezelfde browser bewaard. Er zijn geen centrale opslag, login of autorisaties actief. Documentbestanden worden uitsluitend lokaal in de browser bewaard. De activiteitendata zijn een vaste fictieve momentopname, geen audittrail. Er worden geen gegevens naar Supabase verzonden.

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

## Lokale ledenadministratie

Gebruik **Nieuw lid** in het ledenregister of **Lid bewerken** op een profiel. Nieuwe leden worden gekoppeld aan een bestaand gezin en verschijnen in register, gezinsdossier en dashboardtotalen. Filters, status en contactgegevens gebruiken dezelfde lokale dataset. Een contactpersoon kan pas naar een ander gezin worden verplaatst nadat in het huidige gezin een andere contactpersoon is gekozen.

Gebruik uitsluitend fictieve gegevens. Opslag is per browser en domein (`antioch.administration.v2`); bestaande leden uit `antioch.members.v1` worden automatisch overgenomen bij het eerste gebruik, zonder synchronisatie met Supabase of andere apparaten. Wissen van websitegegevens verwijdert lokale wijzigingen. Nieuwe lokale dossiers gebruiken `/leden/lokaal?id=...`, zodat vernieuwen ook op GitHub Pages werkt. De vaste activiteitenlijst is nog geen logboek van lokale wijzigingen.

Bij een bestaande Pages-instelling ‘Deploy from a branch’ wacht de app-workflow totdat de automatische branchpublicatie is afgerond. Zo kan de README-publicatie de gebouwde app niet achteraf overschrijven. De aanbevolen instelling blijft ‘GitHub Actions’.

## Gezinnen, dossiers en documenten

Gebruik **Nieuw gezin** in het gezinsregister. Koppel daarna bestaande leden via **Lid koppelen**, of kies dit gezin bij een nieuw lid. Een lid behoort aan één gezin; koppelen verplaatst het lid uit het vorige gezin. De gezinscontactpersoon moet een gekoppeld lid zijn. Bij gezinswijzigingen kunt u expliciet aanvinken dat het gezinsadres ook bij alle gezinsleden wordt aangepast; anders blijven individuele adressen intact.

Leden en gezinnen hebben afzonderlijke tabbladen voor **Notities**, **Dossiers** en **Documenten**. De inhoud hoort alleen bij dat lid of gezin. Notities kunnen worden aangepast en na bevestiging verwijderd. Dossiers hebben een categorie en behandelstatus; documenten kunnen aan een dossier van dezelfde eigenaar worden gekoppeld.

Documenten worden met hun categorie, omschrijving en bestandsinhoud in lokale browseropslag bewaard. Ondersteund: PDF, PNG en JPEG, maximaal **1 MB per bestand** en **2 MB totaal** aan oorspronkelijke bestandsbytes. Het daadwerkelijke browserquotum kan lager zijn; opslagfouten worden getoond zonder de wijziging als opgeslagen te melden. Bij downloaden worden de oorspronkelijke bytes teruggegeven. Er worden geen bestanden naar Supabase of GitHub verstuurd. Gebruik geen echte identiteitsbewijzen of productiegegevens. Wissen van websitegegevens verwijdert ook lokale documenten.

De data zijn een onbeveiligde lokale demo, geen productiearchief of betrouwbaar auditlogboek. Centrale opslag, gebruikersrechten en back-ups vereisen een latere Supabase-integratie.

Voor browsercontroles tegen de statische Pages-export:

```bash
GITHUB_PAGES=true npm run build
mkdir -p /tmp/antioch-pages-test
ln -sfn "$PWD/out" /tmp/antioch-pages-test/Mor-Ephrem
python3 -m http.server 3100 --bind 127.0.0.1 --directory /tmp/antioch-pages-test
# In een tweede terminal:
GITHUB_PAGES_TEST=true npm test -- tests/extended-administration.spec.ts tests/member-editing.spec.ts
```

De aanvullende suite test onder meer gezinskoppelingen, contactpersonen, adreswijzigingen, extra profielvelden, notities, dossierstatussen, uploadlimieten, downloads, migratie en vernieuwen op desktop en iPad.

## Zoeken, documentvoorbeelden en iPad-bediening

Zoeken ondersteunt meerdere woorden in willekeurige volgorde en negeert hoofdletters en accenten. In het ledenregister worden ook postcode, telefoon, roepnaam, nationaliteit, type lidmaatschap en eigen administratieve velden doorzocht. Met het gezinsfilter kunt u de zoekopdracht verder beperken. In het gezinsregister vindt u ook een gezin via de naam, het lidnummer of e-mailadres van een gekoppeld gezinslid.

Notities hebben een eigen zoekveld. Dossiers combineren zoeken met categorie- en statusfilters. Documenten combineren zoeken op bestandsnaam, omschrijving, categorie en gekoppeld dossier met een categoriefilter en sortering. Zoekopdrachten en filters kunnen in één keer worden gewist.

Bij documenten opent **Bekijken** een lokaal afbeeldings- of PDF-voorbeeld. De browser verzorgt de PDF-weergave; als de browser geen ingebedde PDF toont, blijft downloaden beschikbaar. De bestandsinhoud wordt niet naar een externe voorbeeldservice verzonden. Via het potlood kunt u categorie, omschrijving en dossierkoppeling aanpassen zonder een nieuw document of extra bestandskopie te maken.

Bij lange tabbladrijen verschijnen **Meer tabbladen** en **Vorige tabbladen**. Deze knoppen ondersteunen de bestaande veeg- en toetsenbordbediening op smallere schermen.

De aanvullende controles in `tests/refinements.spec.ts` testen zoeken, filters, lokale documentvoorbeelden, documentgegevens bewerken, oorspronkelijke downloadbytes en tabbladnavigatie. Voeg dit bestand ook toe aan het hierboven beschreven commando voor controles tegen de Pages-export.

## Centrale werkruimtes en ledenwerktafel

De hoofdmenukeuzes **Dossiers** en **Documenten** openen centrale overzichten van alle leden en gezinnen. Zoek op onderwerp, document, omschrijving of eigenaar en combineer dit met categorie-, status-, eigenaars- en bestandstypefilters. Open dossiers rechtstreeks, pas documentgegevens aan, bekijk/download bestanden of verwijder een lokaal document na bevestiging. Via de eigenaar gaat u naar het bijbehorende leden- of gezinsprofiel. Vanuit de centrale werkruimte kunt u ook een nieuw dossier of document aan een gekozen eigenaar toevoegen.

Bij het eerste openen van een centrale werkruimte wordt **eenmalig** een fictieve voorbeeldset van zes dossiers en zes kleine, geldige PDF's toegevoegd. Titels en bestandsnamen zijn herkenbaar als voorbeelden. Bestaande eigen gegevens blijven staan. De marker `sampleVersion` voorkomt dat verwijderde voorbeelden later opnieuw verschijnen; als de voorbeeldset niet in de lokale documentlimiet past, wordt een melding getoond zonder bestaande documenten te vervangen. Het dashboard verwijst zichtbaar naar de nieuwe werkruimtes. De interface toont versie 0.4.

Het ledenregister is nu een **ledenwerktafel**:

- **Kolommen:** kies zichtbare adres-, contact-, gezins- en lidmaatschapskolommen. De naam blijft altijd zichtbaar. De keuze wordt in deze browser bewaard.
- **Sorteren:** naam in beide richtingen, lidnummer, woonplaats, lid sinds en status. Sorteren kan ook via de relevante tabelkoppen.
- **Selecteren:** kies afzonderlijke leden, de huidige pagina of alle gefilterde resultaten. Selecties blijven over meerdere pagina's behouden. Een andere zoekopdracht of filter wist de actuele selectie om onbedoelde wijzigingen te voorkomen.
- **Bewaarde selecties:** geef een vaste groep leden een naam en open deze later opnieuw. Het betreft de gekozen lidnummers, geen automatisch veranderende filterregel. Wissen van een bewaarde selectie verwijdert geen leden.
- **Bulkbewerking:** wijzig status, type lidmaatschap of contactvoorkeur. De controle toont per geselecteerd lid de oude en nieuwe waarde; pas de tweede bevestiging slaat de wijziging op. Gezinskoppelingen en adressen vallen buiten deze bulkactie. De wijziging wordt in één opslagbewerking uitgevoerd. Als de browseropslag faalt of een geselecteerd lid intussen in een ander tabblad is gewijzigd, wordt de bulkactie geblokkeerd.

Kolommen en bewaarde groepen staan afzonderlijk in `antioch.member-workspace.v1`; de administratie en documenten blijven in `antioch.administration.v2`. De browsercontroles in `tests/workspaces.spec.ts` testen de centrale werkruimtes, voorbeelden, filters, bewaarde selecties en gecontroleerde bulkacties op desktop en iPad. Dit bestand kan ook met `GITHUB_PAGES_TEST=true` tegen de Pages-export worden uitgevoerd.

### Vormgeving (versie 0.5)

De werkruimte heeft een vernieuwde navigatie, een dashboard met woonplaatsverdeling en duidelijk onderscheiden registers, dossiers en documenten. Inter en Manrope worden lokaal meegeleverd; de browser hoeft geen externe lettertypedienst te benaderen. De vormgeving past zich aan desktop en iPad aan. Bestaande lokale voorbeeldgegevens blijven behouden.

De browsertests controleren ook tekstcontrast op de belangrijkste schermen en controleren of deze binnen de schermbreedte blijven. Dit is een gerichte controle, geen volledige toegankelijkheidsaudit.

### Ontwerpen vergelijken

Open `/ontwerpen` (op GitHub Pages: `/Mor-Ephrem/ontwerpen/`) of kies **Ontwerpen vergelijken** in het menu. Vijf onafhankelijke stijlstudies tonen hetzelfde fictieve ledenregister: Compact, Vertrouwd, Verfijnd, Rustig en Werkplek. Zoeken, een statusfilter en een selecteerbaar ledenprofiel maken de verschillen in de browser zichtbaar. De voorbeelden bewaren geen gegevens en wijzigen de administratie niet; navigatieonderdelen binnen het voorbeeld zijn visueel. De teruglink opent de bestaande administratie.
