# Plan rozwoju testów Rolnopol

> Stan zweryfikowany 5 września 2026 na aplikacji Rolnopol v1.79.0
> działającej pod `http://localhost:3000`.

## 1. Cel repozytorium

To repozytorium służy przede wszystkim do nauki TypeScriptu, Playwrighta,
projektowania testów i pracy z API. Celem nie jest pokrycie każdego przycisku,
lecz zbudowanie małego, wiarygodnego i łatwego do debugowania frameworka.

Najważniejsze zasady rozwoju:

1. Najpierw naprawiamy wiarygodność istniejących testów.
2. Logikę biznesową sprawdzamy głównie szybkimi testami API.
3. Testy UI zostawiamy dla zachowania widocznego dla użytkownika.
4. Pełny E2E łączy UI z API tylko dla kilku najważniejszych podróży.
5. Jeden test ma jeden czytelny powód do niepowodzenia.
6. Jedna mała zmiana powinna trafiać do jednego commita.

## 2. Zweryfikowany stan początkowy

### Repozytorium

- Playwright zbiera **57 testów w 15 plikach** i 6 projektach.
- Obecne warstwy to Page Objects, actions, fixtures, fabryki danych i klient API.
- `npm run lint` przechodzi.
- `npm run tsc:check` przechodzi.
- `npm run check:ci` nie przechodzi, ponieważ Prettier sprawdza artefakty
  `.playwright-cli/*.yml`.
- CI uruchamia się tylko ręcznie przez `workflow_dispatch`; nie jest bramką dla
  pull requestów.
- `trace: 'on'` zapisuje trace dla każdego testu i niepotrzebnie powiększa
  `test-results`.

### Wyniki kontrolne

- `setup-demo-user`: **1/1 przeszedł**.
- `tests/api/auth.api.spec.ts`: **11/11 przeszło** przy `--workers=1`.
- projekt `smoke-tests`: **14/18 przeszło**, **4 testy nie przeszły** przy
  `--workers=1`.
- Pełny zestaw nie jest jeszcze wiarygodnym baseline'em. Najpierw trzeba usunąć
  znane błędy testów i konflikt współdzielonych sesji.

### Dlaczego cztery testy smoke są czerwone

1. Snapshot strony głównej pochodzi z aplikacji v1.0.120, a badana aplikacja ma
   v1.79.0. Różnią się nagłówek, ikony i stopka. Ikony zależą też od zewnętrznego
   CDN Font Awesome, więc wynik zależy od dostępu do sieci.
2. Dwa testy poprawnej rejestracji wykonują tę samą podróż. Metoda
   `RegisterPage.register()` czeka na przejście do `/login.html`, po czym test
   próbuje znaleźć komunikat sukcesu ze starej strony rejestracji.
3. Test duplikatu wywołuje drugi raz ten sam `RegisterPage` już po przejściu na
   stronę logowania. Test nie odtwarza więc poprawnie scenariusza duplikatu.

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

Ważna obserwacja: niezalogowany użytkownik jest przekierowywany z profilu,
marketplace i finansów na `/login.html`, ale strony `staff-fields-main`,
`staff-fields-assign` i `staff-fields-charts` pozostają otwarte. W tle generują
wiele odpowiedzi 401. To należy zapisać jako test ujawniający prawdopodobny błąd
ochrony tras, a nie omijać słabszą asercją.

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

- [ ] Dodać `.playwright-cli/` do `.gitignore` i `.prettierignore`.
- [ ] Usunąć `tests/api/probe.spec.ts` po zapisaniu wniosków albo zamienić sondę
      w nazwany test kontraktu bez `console.log`.
- [ ] Rozdzielić w `RegisterPage` operacje `fillForm()` i `submit()`. Metoda
      używana przez negatywne testy nie może zawsze czekać na sukces i przekierowanie.
- [ ] Zostawić jeden UI test poprawnej rejestracji. Drugi duplikat nie zwiększa
      wartości edukacyjnej.
- [ ] Test poprawnej rejestracji powinien sprawdzić status odpowiedzi `201` i
      końcowy URL `/login.html`. Nie powinien szukać znikającego komunikatu na
      poprzedniej stronie.
- [ ] Test duplikatu przygotować przez API, następnie otworzyć świeżą stronę
      rejestracji i sprawdzić `409` oraz komunikat widoczny w UI.
- [ ] Każde krótkie hasło i każdy błędny email wykonywać jako osobny przypadek
      testowy, aby raport wskazywał dokładną wartość wejściową.
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
- [ ] Nazwać projekt `no-auth-tests` zgodnie z rolą, np. `user-journeys`, bo
      scenariusze rejestrują i logują użytkownika w trakcie testu.
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

### Etap 2 — mały i szybki zestaw P0

- [ ] Sparametryzowany smoke publicznych stron: Home, Login, Register, Docs,
      Swagger iframe, Alerts i Contact.
- [ ] Macierz ochrony tras dla użytkownika anonimowego i zalogowanego:
      Profile, Staff Main, Assign, Charts, Marketplace, Financial.
- [ ] Dla chronionej trasy sprawdzać końcowy URL i brak nieoczekiwanych błędów
      konsoli, nie tylko status dokumentu HTML równy 200.
- [ ] Po logowaniu sprawdzić utrzymanie sesji po reloadzie i jej usunięcie po
      logout.
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
`@playwright/test` + `zod` albo `ajv`. Swagger jest wskazówką, ale odpowiedź
serwera pozostaje źródłem prawdy.

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
npx playwright test --grep @p0 --workers=2

# Kontrola flaków
npx playwright test --grep @p0 --repeat-each=5 --workers=2

# Pełny baseline bez równoległości
npx playwright test --workers=1 --reporter=list
```

## 8. Proponowane następne 10 commitów

1. `chore: ignore Playwright CLI artifacts`
2. `test: remove or promote temporary API probe`
3. `refactor: split registration form submit from success navigation`
4. `test: repair and deduplicate UI registration coverage`
5. `test: stabilize homepage visual contract`
6. `test: add anonymous route access matrix`
7. `refactor: move staff suites to isolated-user project`
8. `ci: run quality and smoke checks on pull requests`
9. `test: add financial API contract coverage`
10. `test: add farm API CRUD and assignment contracts`

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
