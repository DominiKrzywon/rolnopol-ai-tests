# Plan rozwoju testów Rolnopol

> Inwentaryzacja aplikacji: 5 września 2026, Rolnopol v1.79.0.
> Aktualizacja 7 września 2026: przegląd kodu, kolekcja testów, `check:ci`
> oraz kontrola anonimowego dostępu na `http://localhost:3000`.
> Nie uruchamiano ponownie pełnej regresji ani całej inwentaryzacji API.

## 1. Cel repozytorium

To repozytorium służy przede wszystkim do nauki TypeScriptu, Playwrighta,
projektowania testów i pracy z API. Celem nie jest pokrycie każdego przycisku,
lecz zbudowanie małego, wiarygodnego i łatwego do debugowania frameworka.

Sama aplikacja Rolnopol została stworzona do nauki testów automatycznych i ma
specyficzną konstrukcję edukacyjną. Zakres ćwiczeń dobieram świadomie; nie każde
zaobserwowane odstępstwo będę zgłaszać jako błąd. Konkretne wyłączenia zapisuję
w planie wraz z obserwacją i uzasadnieniem. Edukacyjny charakter aplikacji nie
oznacza, że każde odstępstwo jest celowo zaprojektowane przez jej autora.

Kod testów i konfigurację zmieniam samodzielnie, aby ćwiczyć. Rola mentora to
analiza, wskazówki, przegląd moich zmian i pomoc w interpretacji wyników.

Najważniejsze zasady rozwoju:

1. Najpierw naprawiamy wiarygodność istniejących testów.
2. Logikę biznesową sprawdzamy głównie szybkimi testami API.
3. Testy UI zostawiamy dla zachowania widocznego dla użytkownika.
4. Pełny E2E łączy UI z API tylko dla kilku najważniejszych podróży.
5. Jeden test ma jeden czytelny powód do niepowodzenia.
6. Jedna mała zmiana powinna trafiać do jednego commita.

## 2. Zweryfikowany stan repozytorium

### Repozytorium

- Playwright zbiera **61 testów w 14 plikach** i 7 projektach.
- `tests/auth/access-control.noauth.spec.ts` zawiera 6 przypadków przekierowań.
  Po samodzielnym usunięciu trzech tras Staff & Fields powinny pozostać
  3 przypadki, czyli 58 testów łącznie, jeśli inne testy się nie zmienią.
- Obecne warstwy to Page Objects, actions, fixtures, fabryki danych i klient API.
- `npm run check:ci` przechodzi: formatowanie, ESLint i TypeScript
  zweryfikowano 7 września 2026. Tablica `protectedRoutes` jest już używana.
- CI uruchamia się tylko ręcznie przez `workflow_dispatch`; nie jest bramką dla
  pull requestów.
- `trace: 'on'` zapisuje trace dla każdego testu i niepotrzebnie powiększa
  `test-results`.

### Historyczne wyniki kontrolne z 5 września 2026

- `setup-demo-user`: **1/1 przeszedł**.
- `tests/api/auth.api.spec.ts`: **11/11 przeszło** przy `--workers=1`.
- przed ówczesnym porządkowaniem projekt `smoke-tests` miał wynik **14/18**
  przy `--workers=1`; po przeniesieniu testów zbiera 7 przypadków i wymaga
  ponownego zapisania baseline'u.
- Pełny zestaw nie jest jeszcze wiarygodnym baseline'em. Najpierw trzeba usunąć
  znane błędy testów i konflikt współdzielonych sesji.

### Przyczyny czterech historycznych błędów smoke

1. Snapshot strony głównej pochodzi z aplikacji v1.0.120, a badana aplikacja ma
   v1.79.0. Różnią się nagłówek, ikony i stopka. Ikony zależą też od zewnętrznego
   CDN Font Awesome, więc wynik zależy od dostępu do sieci.
2. Dwa testy poprawnej rejestracji wykonują tę samą podróż. Metoda
   `RegisterPage.register()` czeka na przejście do `/login.html`, po czym test
   próbuje znaleźć komunikat sukcesu ze starej strony rejestracji.
3. Test duplikatu wywołuje drugi raz ten sam `RegisterPage` już po przejściu na
   stronę logowania. Test nie odtwarza więc poprawnie scenariusza duplikatu.

Aktualizacja z przeglądu kodu 7 września: został jeden pozytywny test
rejestracji, `RegisterPage.register()` jedynie wypełnia i wysyła formularz,
a duplikat przygotowuje konto przez API. Powyższe punkty opisują historyczne
przyczyny. Nadal pozostaje asercja znikającego komunikatu sukcesu w pozytywnym
teście i pętla krótkich haseł wewnątrz jednego przypadku. Nie potwierdzono
ponownym uruchomieniem aktualnego wyniku testów rejestracji.

### Aplikacja zbadana na localhost

Publiczne ekrany: Home, Login, Register, Documentation, API Explorer, Alerts i
Contact.

Po zalogowaniu dostępne są również:

- profil z edycją danych i usunięciem konta;
- pola, personel i zwierzęta wraz z wyszukiwaniem oraz paginacją;
- przypisania w widokach Grid, List, Cards, Table, Timeline, Tree i Chart;
- wykresy Bar, Pie i Doughnut;
- marketplace z filtrowaniem, paginacją, własnymi ofertami i historią;
- finanse z przychodami, wydatkami, przelewami i filtrami dat.

Specyfikacja OpenAPI v1.79.0 opisuje **71 operacji na 57 ścieżkach**. Obecne
testy API pokrywają prawie wyłącznie uwierzytelnianie.

### Decyzja o zakresie: anonimowy dostęp do Staff & Fields

Kontrola przez Playwright uruchomiony z terminala 7 września 2026, w osobnym
czystym kontekście przeglądarki dla każdej trasy, potwierdziła:

- `/profile.html`, `/marketplace.html` i `/financial.html` przekierowują
  anonimowego użytkownika na `/login.html`;
- `/staff-fields-main.html`, `/staff-fields-assign.html` oraz
  `/staff-fields-charts.html` pozostają otwarte; w ciągu 5 sekund oczekiwania
  asercja przekierowania nie została spełniona;
- obserwowane żądania tych stron do `/api/v1/fields`, `/api/v1/staff`,
  `/api/v1/fields/assign` i `/api/v1/animals` otrzymały `401`;
- dokument HTML każdej z sześciu stron początkowo zwrócił `200`.

Ze względu na edukacyjny cel projektu **nie będę zgłaszać braku przekierowania
tych trzech stron jako błędu**. Usunę samodzielnie wyłącznie trzy wpisy
`/staff-fields-*.html` z tablicy `protectedRoutes` w
`tests/auth/access-control.noauth.spec.ts`. Pozostawię testy przekierowania
profilu, marketplace i finansów. Ta zmiana kodu nie została jeszcze wykonana.

Jest to świadome ograniczenie zakresu testów przekierowań UI. Nie usuwam
endpointów z aplikacji, testów gospodarstwa po zalogowaniu ani planowanych
testów autoryzacji API. Trasy stron HTML i endpointy `/api/v1/staff` czy
`/api/v1/fields` to różne elementy. Otwarcie strony nie dowodzi dostępu do
chronionych danych; zaobserwowane `401` nie są też pełnym audytem autoryzacji.
Nie zakładam, że brak przekierowania jest zamierzonym wymaganiem aplikacji.

### Znane ograniczenia środowiska

- Serwer utrzymuje jedną aktywną sesję na użytkownika. Drugie logowanie na to
  samo konto unieważnia poprzedni token, dlatego testy modyfikujące dane nie mogą
  współdzielić kont.
- `page` i `request` mają osobne magazyny cookies. `applySessionCookies` kopiuje
  sesję tylko z `request` do kontekstu przeglądarki; późniejsza zmiana sesji w UI
  nie aktualizuje automatycznie `request`.
- Rate limiter działa per IP. Rejestracja i logowanie świeżego konta zwiększają
  liczbę żądań, więc liczbę workerów należy dobierać pomiarem, a nie maskować 429
  przez retry.
- Swagger jest wskazówką, ale nie pełnym kontraktem. Nie opisuje m.in.
  `GET /fields/assign`, a odpowiedź `/financial/transactions` zawiera pole
  `hasMore`, którego brakuje w schemacie.

## 3. Priorytety

- **P0**: zielony baseline, healthcheck, logowanie/sesja, ochrona tras, jeden
  podstawowy przepływ gospodarstwa.
- **P1**: kontrakty API dla farmy, finansów i marketplace oraz najważniejsze
  reguły biznesowe.
- **P2**: alerty, kontakt, wykresy, mapa, dostępność, responsywność i stabilne
  testy wizualne.
- **Poza zwykłym CI**: `/shutdown`, przywracanie bazy, zmiana feature flags oraz
  inne destrukcyjne endpointy administracyjne. Wolno je testować tylko w
  jednorazowym środowisku.

## 4. Roadmapa

### Etap 0 — odzyskaj zaufanie do obecnych testów

- [x] Dodać `.playwright-cli/` do `.gitignore` i `.prettierignore`.
- [ ] Przestać śledzić cztery stare pliki `.playwright-cli/*.yml`, które trafiły
      do repozytorium przed dodaniem reguł ignorowania.
- [x] Usunąć `tests/api/probe.spec.ts` po zapisaniu wniosków albo zamienić sondę
      w nazwany test kontraktu bez `console.log`.
- [x] Zostawić jeden UI test poprawnej rejestracji. Drugi duplikat nie zwiększa
      wartości edukacyjnej.
- [ ] Test poprawnej rejestracji powinien sprawdzić status odpowiedzi `201` i
      końcowy URL `/login.html`. Nie powinien szukać znikającego komunikatu na
      poprzedniej stronie.
- [x] Test duplikatu przygotować przez API, następnie otworzyć świeżą stronę
      rejestracji i sprawdzić `409` oraz komunikat widoczny w UI.
- [ ] Każde krótkie hasło wykonywać jako osobny przypadek testowy, aby raport
      wskazywał dokładną wartość wejściową.
- [x] Każdy błędny email wykonywać jako osobny przypadek testowy.
- [ ] Snapshot wizualny zawęzić do stabilnego komponentu strony głównej.
      Zamaskować wersję i dane dynamiczne, ustalić viewport oraz uniezależnić ikony
      od CDN. Baseline aktualizować dopiero po ręcznym obejrzeniu diffu.
- [ ] Ustawić `trace: 'retain-on-failure'` po zakończeniu bieżącego debugowania.
- [ ] Doprowadzić kolejno do zielonego `check:ci`, `api-tests` i `smoke-tests`.

Warunek zakończenia: trzy powyższe komendy są zielone bez retry.

### Etap 1 — uporządkuj projekty i dane testowe

- [ ] Przenieść `staff-management.e2e.spec.ts` i `staff-assign.e2e.spec.ts` do
      projektu użytkowników izolowanych (`*.isolated.spec.ts`). Dziś uruchamiają
      zależność logowania demo, a zaraz potem zerują `storageState`.
- [ ] Uporządkować podział: anonimowe przekierowania pozostawić w
      `no-auth-tests`, a podróże rejestrujące i logujące użytkownika wydzielić
      osobno. Przy wprowadzeniu `*.journey.spec.ts` dodać odpowiadający
      `testMatch`; obecna konfiguracja nie zbiera tego wzorca.
- [ ] Używać konta demo wyłącznie w odczytowych testach profilu.
- [ ] Każdy test modyfikujący dane ma tworzyć własnego użytkownika i zasoby.
- [ ] Id odbiorcy przelewu uzyskiwać z rejestracji świeżego konta, bez logowania
      na współdzielone `EMPTY_USER`.
- [ ] Nie hardkodować salda `18450`; wyliczać stan początkowy przez API.
- [ ] Zacząć od `workers: 1`, następnie zmierzyć `2` i `3`. Nie dodawać retry
      jako lekarstwa na rate limiter 429.
- [ ] Walidować tylko `BASE_URL` dla publicznych smoke. Dane demo/empty powinny
      być wymagane dopiero przez test, który naprawdę ich używa.

Warunek zakończenia: pełny przebieg ma zapisany wynik bazowy i żadne dwa testy
nie unieważniają sobie sesji.

### Etap 1b — domknij dług techniczny warstwy API

Ten backlog został zachowany ze starszego planu refaktoru. Realizować go małymi
commitami, równolegle z dodawaniem testów kontraktowych:

- [ ] W `httpClient` użyć wspólnego `ApiEnvelope<T>`, pokazywać `error` zwrócony
      przez API i poprawić komunikat dla `success: false` przy statusie 2xx.
- [ ] Nie dodawać obsługi 204 ani `putJson`, dopóki prawdziwy test kontraktu nie
      pokaże takiej potrzeby.
- [ ] Przenieść happy-path `loginAs` i `registerVerifiedUser` na `postJson`, ale
      zostawić surowe `APIResponse` w funkcjach używanych do asercji 4xx.
- [ ] Dla nieużywanych `transferFunds`, `getTransactions`, `getAssignments`,
      `createAssignment`, `deleteAssignment`, `cancelAllMyOffers` i
      `deleteOneOffer` podjąć decyzję: pokryć kontraktem albo usunąć.
- [ ] Modele odpowiedzi finansów, farmy i marketplace uzupełniać dopiero na
      podstawie rzeczywistych odpowiedzi zapisanych w testach API.
- [ ] Usunąć `expect()` z `MarketplacePage`, rozdzielić helpery na stałe i
      fabryki oraz doprecyzować nazwy dublujących się akcji UI/API.

### Etap 2 — mały i szybki zestaw P0

- [ ] Sparametryzowany smoke publicznych stron: Home, Login, Register, Docs,
      Swagger iframe, Alerts i Contact.
- [ ] Macierz ochrony tras dla użytkownika anonimowego i zalogowanego:
      Profile, Marketplace, Financial. Trzy strony Staff & Fields wyłączyć
      z wymogu anonimowego przekierowania zgodnie z decyzją w sekcji 2;
      ich funkcje po zalogowaniu pozostają w zakresie testów gospodarstwa.
- [ ] Dla chronionej trasy sprawdzać końcowy URL i brak nieoczekiwanych błędów
      konsoli, nie tylko status dokumentu HTML równy 200.
- [ ] Po logowaniu sprawdzić utrzymanie sesji po reloadzie i jej usunięcie po
      logout. Reload jest już sprawdzany w `login.noauth.spec.ts`; uzupełnić
      scenariusz o ponowne wejście na profil po wylogowaniu i przekierowanie
      na login. Najpierw zastąpić współdzielone `EMPTY_USER` świeżym kontem.
- [ ] Zostawić jeden krótki happy path: świeży użytkownik tworzy pole, pracownika
      i przypisanie; stan końcowy potwierdza API.
- [ ] Oznaczyć testy spójnymi tagami `@p0`, `@smoke`, `@api`, `@ui`, `@e2e`.

Warunek zakończenia: `@p0` przechodzi pięć razy przez `--repeat-each=5` i nie ma
losowych niepowodzeń.

### Etap 3 — kontrakty API przed kolejnymi testami UI

Kolejność implementacji:

1. **Financial API**
   - [ ] konto i saldo;
   - [ ] historia z `total`, `limit`, `offset` i `hasMore`;
   - [ ] income oraz expense i wpływ na saldo;
   - [ ] przelew: minimum `0.01`, maksimum `999.99`, saldo równe kwocie,
         przekroczenie salda i nieistniejący odbiorca.
2. **Farm API**
   - [ ] CRUD pola, personelu i zwierząt;
   - [ ] przypisanie i usunięcie przypisania;
   - [ ] blokada usunięcia przypisanego zasobu;
   - [ ] granice wieku, powierzchni, liczby zwierząt i wymaganych pól;
   - [ ] district oraz dozwolone typy zwierząt.
3. **Marketplace API**
   - [ ] lista ofert i `my-offers`;
   - [ ] utworzenie i anulowanie własnej oferty;
   - [ ] brak możliwości kupienia własnej oferty;
   - [ ] zakup, zmiana właściciela i dwa wpisy finansowe;
   - [ ] niewystarczające środki i próba podwójnego zakupu.
4. **Users i Profile API**
   - [ ] odczyt oraz aktualizacja świeżego konta;
   - [ ] usunięcie wyłącznie świeżego konta testowego;
   - [ ] brak dostępu do danych innego użytkownika.
5. **Alerts, Contact i System API**
   - [ ] alerts, history, upcoming i filtry;
   - [ ] poprawny oraz błędny formularz kontaktowy;
   - [ ] healthcheck, ping, about i statistics.

Na początku asertować tylko stabilne pola ważne biznesowo. Dopiero po poznaniu
rzeczywistych odpowiedzi warto dodać walidację schematów, np.
`@playwright/test` + `zod` albo `ajv`. Swagger i rzeczywiste odpowiedzi pomagają
poznać API, ale zaobserwowane zachowanie nie staje się automatycznie wymaganiem.
Rozbieżności z oczekiwanym kontraktem opisać i świadomie ustalić zakres testu.

Warunek zakończenia: każda główna domena ma co najmniej happy path, granicę i
błąd autoryzacji, bez kopiowania tych samych przypadków do UI.

### Etap 4 — rozszerzaj UI domenami

#### Profil i uwierzytelnianie

- [ ] edycja display name na świeżym koncie;
- [ ] walidacja hasła i potwierdzenia hasła;
- [ ] upload niepoprawnego typu pliku;
- [ ] usunięcie świeżego konta z potwierdzeniem `DELETE`;
- [ ] 2FA tylko wtedy, gdy funkcja jest aktywna i da się kontrolować dane.

#### Gospodarstwo

- [ ] wyszukiwanie i paginacja pól, personelu i zwierząt;
- [ ] edycja wszystkich istotnych pól, nie tylko nazwy;
- [ ] relacja zwierzę–pole oraz district;
- [ ] jeden reprezentatywny test widoku przypisań, zamiast kopiowania tej samej
      asercji dla siedmiu prezentacji;
- [ ] wykresy: renderowanie danych i przełączanie typu wykresu bez błędów JS.

#### Marketplace i finanse

- [ ] filtrowanie i paginacja ofert;
- [ ] anulowanie własnej oferty w UI;
- [ ] osobne scenariusze zakupu pola i zwierząt, bez warunku w środku testu;
- [ ] filtry historii finansowej po typie, kategorii i zakresie dat;
- [ ] walidacja karty/CVV oraz limitów formularza przelewu.

#### Nowe publiczne funkcje

- [ ] Alerts: wyszukiwanie, severity, region i pusty wynik;
- [ ] Contact: wymagane pola, błędny email, Clear i poprawna wysyłka;
- [ ] Docs: wyszukiwanie oraz pokazywanie/ukrywanie opisów feature-flagged;
- [ ] Map: test dopiero po świadomym włączeniu feature flag.

### Etap 5 — jakość niefunkcjonalna i CI

- [ ] Dodać `pull_request` do workflow.
- [ ] Rozdzielić CI na `quality`, szybkie `api`, `smoke` i pełne `regression`.
- [ ] Pełną regresję uruchamiać ręcznie lub cyklicznie, dopóki rate limiter i
      dane testowe nie są w pełni izolowane.
- [ ] Dodać `@axe-core/playwright` dopiero po ustabilizowaniu P0; zacząć od
      Home, Login, Register i jednego ekranu po zalogowaniu.
- [ ] Po Chromium dodać Firefox dla P0. WebKit i widoki mobilne dopiero wtedy,
      gdy nie potrajają czasu debugowania podstaw.
- [ ] Testy wizualne ograniczyć do kilku stabilnych komponentów. Nie maskować
      większości strony tylko po to, aby snapshot był zielony.
- [ ] Raport przechowywać po każdym CI, trace i screenshot tylko przy błędzie.

## 5. Docelowa mapa pokrycia

| Obszar           | Jest teraz                             | Najbliższy wartościowy krok             | Później                    |
| ---------------- | -------------------------------------- | --------------------------------------- | -------------------------- |
| Publiczne strony | częściowy smoke                        | Alerts, Contact, macierz tras           | Docs search, feature flags |
| Auth API         | 11 działających testów                 | poprawić nazwy/statusy i izolację sesji | 2FA, role                  |
| Auth UI          | login/logout, błędne testy rejestracji | naprawić rejestrację i guardy           | zmiana hasła               |
| Profil           | odczyt demo                            | aktualizacja świeżego konta             | bezpieczne usunięcie       |
| Farma            | CRUD UI i przypisania                  | kontrakty API i blokady                 | district, paginacja, mapa  |
| Marketplace      | zakup, oferta, brak środków            | API anulowania i własności              | wyścig dwóch kupujących    |
| Finanse          | saldo, historia, przelew, overdraft    | API paginacji i granic                  | statystyki i raport        |
| Alerts/Contact   | brak                                   | podstawowy UI + API                     | kombinacje filtrów         |
| Wykresy          | brak                                   | render i zmiana typu                    | zgodność danych z API      |
| Visual/a11y      | jeden kruchy snapshot                  | stabilny komponent Home                 | krytyczne ekrany           |

## 6. Konwencje dla nowych testów

### Nazwy i pliki

- `*.api.spec.ts` — kontrakty HTTP bez przeglądarki.
- `*.isolated.spec.ts` — UI na użytkowniku tworzonym dla testu.
- `*.journey.spec.ts` — nieliczne scenariusze łączące kilka domen.
- Nazwa testu opisuje zachowanie i wynik, np.
  `should reject transfer above available balance`.

### Arrange–Act–Assert

- Przygotowanie danych najlepiej przez API.
- Jedna główna akcja użytkownika przez UI.
- Asercja UI sprawdza komunikat/zachowanie, a asercja API stan biznesowy.
- Page Object nie zawiera `expect()` i nie wymusza happy path, jeśli metoda jest
  używana także w testach negatywnych.

### Stabilność

- Preferować `getByRole`, `getByLabel` i `getByTestId`.
- Nie używać `waitForTimeout()` w testach właściwych.
- Nie łapać błędów pustym `.catch(() => {})` bez zapisania, dlaczego cleanup
  może bezpiecznie się nie udać.
- Nie współdzielić kont modyfikowanych przez testy równoległe.
- Retry pozostaje `0`, dopóki przyczyna flaków nie jest znana.
- Dla każdej naprawy flaka najpierw odtworzyć problem, potem uruchomić test
  minimum pięć razy.

## 7. Przydatne komendy kontrolne

```bash
# Co Playwright naprawdę zbiera
npx playwright test --list

# Jakość kodu
npm run check:ci

# Szybkie warstwy
npx playwright test --project=api-tests --workers=1
npx playwright test --project=smoke-tests --workers=1

# Priorytet P0 po dodaniu tagów
npx playwright test --grep @p0 --workers=1

# Kontrola flaków
npx playwright test --grep @p0 --repeat-each=5 --workers=1

# Pełny baseline bez równoległości
npx playwright test --workers=1 --reporter=list
```

## 8. Kolejność małych commitów

1. [x] `chore: ignore Playwright CLI artifacts`
2. [x] `test: remove temporary API probe`
3. [ ] `test: limit anonymous redirect matrix to agreed routes`
4. [x] Oddzielenie wysłania rejestracji od oczekiwania na nawigację jest już
       widoczne w kodzie; nie powtarzać refaktoru ani tworzyć pustego commita.
5. [ ] `test: finish registration response and password cases`
6. [ ] `test: stabilize homepage visual contract`
7. [ ] `refactor: move staff suites to isolated-user project`
8. [ ] `ci: run quality and smoke checks on pull requests`
9. [ ] `test: add financial API contract coverage`
10. [ ] `test: add farm API CRUD and assignment contracts`

## 9. Definition of Done dla pojedynczego zadania

- Test czerwienieje z oczekiwanego powodu przed poprawką aplikacji/testu.
- Dane są unikalne i nie zależą od kolejności uruchomienia.
- Cleanup nie usuwa danych demo ani danych innego testu.
- Test przechodzi pojedynczo i w swoim projekcie.
- `npm run check:ci` przechodzi.
- Krytyczny test przechodzi pięć razy bez retry.
- Nazwa, tagi i warstwa testu odpowiadają sprawdzanemu zachowaniu.
- Plan jest aktualizowany na podstawie faktycznego wyniku, nie samej obecności
  pliku testowego.

## 10. Najbliższe ćwiczenia z mentorem

To kolejność na najbliższe sesje nauki. Dalsza roadmapa pozostaje backlogiem;
każdy krok kończy się małą, samodzielną zmianą i przeglądem jej wyniku.

1. **Domknij zakres testu przekierowań.** Usuń trzy wpisy Staff & Fields
   z `protectedRoutes`. Pozostaw asercję końcowego URL. Opcjonalnie sprawdź
   widoczność formularza logowania, aby potwierdzić docelowy ekran.
   Uruchom sam plik z `--project=no-auth-tests --workers=1 --retries=0`,
   następnie `--repeat-each=5`. Gotowe: 3/3 oraz 15/15 bez retry.
   Wyjaśnij własnymi słowami, dlaczego `200` dokumentu HTML i `401` API mogą
   wystąpić razem. Marketplace jest też sprawdzany w smoke; zdecyduj świadomie,
   czy zachować ten szybki duplikat.
2. **Dokończ rejestrację.** W pozytywnym teście rozpocznij oczekiwanie na
   odpowiedź `POST /api/v1/register` przed wysłaniem formularza, sprawdź `201`
   i końcowy `/login.html`. Usuń zależność od przemijającego komunikatu sukcesu.
   Krótkie hasła rozdziel na przypadki przez pętlę deklarującą `test()`;
   pustą wartość i zbyt krótkie hasło sprawdzaj zgodnie z ich walidacją UI.
   Sam brak sukcesu nie wystarcza jako dowód poprawnej walidacji.
   Gotowe: raport rozróżnia dane wejściowe, a cały plik rejestracji przechodzi.
3. **Uporządkuj izolację i sesję.** Przenieś dwie suite Staff & Fields do
   wzorca `*.isolated.spec.ts` i potwierdź przez `--list`, że nie uruchamiają
   setupu demo. W testach logowania użyj świeżego konta; po logout ponownie
   wejdź na profil i oczekuj loginu. Odbiorcę przelewu również twórz osobno,
   bez logowania na `EMPTY_USER`. Gotowe: scenariusze nie zależą od wspólnej
   sesji ani kolejności. Każdą z tych zmian wykonaj w osobnym małym commicie.
4. **Zapisz aktualny wynik bazowy.** Uruchom `check:ci`, `api-tests`,
   `smoke-tests` i poprawione pliki auth kolejno, z jednym workerem i bez retry.
   Zapisz datę, wersję aplikacji, komendę i wynik. Dla porażki ustal, czy
   przyczyną jest test, dane, środowisko czy zachowanie aplikacji.
   `check:ci` jest już zielone; wyniki uruchomień testów wymagają odświeżenia.
   Pełną regresję dodaj po tym kroku; snapshot wizualny diagnozuj osobno.
5. **Dodaj mały kontrakt API gospodarstwa.** Zacznij od anonimowego
   `GET /api/v1/fields`: oczekuj `401` i odpowiedzi błędu bez danych pól.
   Do negatywnego przypadku użyj surowej odpowiedzi HTTP, aby móc sprawdzić
   status. Następnie na świeżym koncie utwórz pole i potwierdź odczyt jego ID,
   nazwy i powierzchni. Dodaj jeden przypadek walidacji na podstawie poznanego
   kontraktu. Gotowe: mały zestaw API uruchamia się samodzielnie i sprząta
   wyłącznie własne dane. To krótkie ćwiczenie przed szerszą kolejnością
   domen z etapu 3.
6. **Przejdź do finansów.** Najpierw popraw istniejący overdraft: oblicz kwotę
   opróżnienia z rzeczywistego salda, zamiast wpisywać `18450`. Po odrzuconym
   przelewie ponownie pobierz saldo przez API. Obecny `currentBalance` jest
   odczytany przed akcją, więc jego końcowa asercja nie dowodzi braku zmiany.
   Następnie dodaj kontrakt przychodu/wydatku i granic przelewu.
   Gotowe: sprawdzasz stan po akcji oraz brak skutków odrzuconej operacji.

### Narzędzia do kolejnych ćwiczeń

Na obecnym etapie wystarczy zainstalowany Playwright i terminal. Do własnej
obserwacji używaj `--headed` albo `--debug`, a `--list` traktuj jako kontrolę
przypisania testów do projektów. Badanie z 7 września wykonano przez istniejącą
bibliotekę Playwright z terminala, bez dodawania pliku sondy i konfiguracji MCP.

MCP jest opcjonalnym narzędziem do eksploracji przeglądarki przez asystenta;
nie jest warunkiem pisania ani uruchamiania testów. Można wrócić do jego
konfiguracji jako osobnego ćwiczenia, gdy pojawi się potrzeba takiej pracy.
Dokumentacja projektu opisuje również CLI jako opcję dla agentów:
[Playwright MCP](https://github.com/microsoft/playwright-mcp).
