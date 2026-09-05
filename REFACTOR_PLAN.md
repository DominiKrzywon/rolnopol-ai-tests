# Plan refaktoru warstwy API

Stan na 17.08.2026. Zrobione: `httpClient` z `ApiError`, wszystkie funkcje na
wrapperze, modele w `src/models/{farm,financial,marketplace}.ts`, API podzielone
na `src/api/{farm,financial,marketplace}.api.ts`, `src/helpers/apiHelpers.ts`
usunięty. `tsc` i `eslint` przechodzą na zielono.

**Zasada kolejności:** najpierw stabilny baseline, potem narzędzia do
debugowania, potem testy, a typy na samym końcu. Typ bez testu to komentarz,
nie kontrakt - dlatego testy API idą przed poprawianiem typów, a nie po.

**Jedna zmiana na commit.**

---

## Wiedza o środowisku (nie usuwać, kosztowała sondy)

**Jedna aktywna sesja na użytkownika.** Drugie zalogowanie tego samego konta
unieważnia poprzedni token:

```
after demo login       : GET /staff with demo token -> 200
after other user login : GET /staff with demo token -> 200
after other user logout: GET /staff with demo token -> 200
after second demo login: GET /staff with demo token -> 403
```

Do tego `page` i `request` mają w Playwright osobne słoiki na ciasteczka.
`applySessionCookies` kopiuje je jednokierunkowo z `request` do `context`, więc
odświeżenie sesji w przeglądarce nie wraca do `request`. Stąd obraz
"UI przechodzi, API zwraca 403".

**Rate limiter jest per IP.** Pełny przebieg wszystkich projektów równolegle go
przekracza: `GET /api/v1/marketplace/offers -> 429`. Konto na test dokłada dwa
żądania (rejestracja + logowanie).

**Swaggerowi nie ufaj bez weryfikacji.** Nie ma w nim `GET /fields/assign`,
a schemat `/financial/transactions` pomija `hasMore`, które serwer zwraca.

---

## Krok 0 - zamroź stan wyjściowy

- [ ] `npx playwright test --reporter=list`, zapisz liczbę padnięć i nazwy
- [ ] Zacommituj ten plik

Bez zapisanego baseline'u nie odróżnisz regresji od flaka.

## Krok 1 - EMPTY_USER, ostatni współdzielony stan

`financial.isolated.spec.ts::getEmptyUserId()` loguje się na współdzielone
konto EMPTY_USER tylko po to, żeby poznać ID odbiorcy przelewu.
`login.e2e.spec.ts` loguje się na **to samo konto** przez UI i robi `logout()`.
Biegną w różnych projektach równolegle, więc unieważniają sobie sesje - to ten
sam błąd co z DEMO_USER, tylko na drugim koncie.

- [ ] Sonda: czy `POST /register` zwraca `id` w `data`?
- [ ] Jeśli tak - jednorazowy odbiorca, ID z odpowiedzi rejestracji, zero logowań
- [ ] Jeśli nie - jednorazowy odbiorca przez `registerVerifiedUser` + `loginAs`
      na osobnym kontekście
- [ ] Usuń `getEmptyUserId()` razem z nazwą, która przestała być prawdziwa

## Krok 2 - projekty w configu przestają kłamać

`staff-assign.e2e.spec.ts` i `staff-management.e2e.spec.ts` mają
`test.use({ storageState: undefined })`, ale nadal pasują do `testMatch`
projektu `demo-user-tests`. Nazwa projektu wprowadza w błąd,
`dependencies: ['setup-demo-user']` wymusza logowanie na demo dla testów, które
go nie używają, a `storageState` jest ustawiany i natychmiast nadpisywany.

- [ ] Przemianuj oba pliki na `*.isolated.spec.ts` (konwencja już działa dla
      `financial` i `marketplace`)
- [ ] Usuń z nich `test.use({ storageState: undefined })` - projekt
      `isolated-user-tests` i tak nie ustawia `storageState`
- [ ] Zostaje: realnym konsumentem sesji demo jest **tylko** `profile.e2e`
      (`login.e2e` używa EMPTY_USER i zeruje `storageState`). Zdecyduj, czy
      `demo-user-tests` + `setup-demo-user` mają sens dla jednego testu

## Krok 3 - martwy kod w `login.e2e.spec.ts`

Plik ma `test.use({ storageState: undefined })`, więc przeglądarka nigdy nie ma
sesji demo i przekierowanie na profil nie może się zdarzyć. Warunek w liniach
19-25 jest zawsze fałszywy.

- [ ] Usuń blok `if`, komentarz nad nim i `eslint-disable` dla
      `playwright/no-conditional-in-test`

## Krok 4 - rate limiter

Kolejność prób, nie "albo-albo". `retries` na 429 uderza w limiter, gdy jest
najbardziej wzburzony, i maskuje prawdziwe flaki.

- [ ] Zmierz najpierw - Krok 1 usunął dwa logowania z każdego przebiegu
- [ ] Poluzuj limit w środowisku testowym, jeśli masz dostęp
- [ ] Jeśli nie - `workers: 2` lub `3` w `playwright.config.ts`
- [ ] `retries` dopiero po zazielenieniu suite'u

## Krok 5 - domknij `httpClient`

Wszystko w jednym pliku. Poprawia komunikaty błędów we wszystkim, co zrobisz
później - dlatego przed testami.

- [ ] `ApiEnvelope<T>` z `src/models/ApiResponse.ts` zamiast ręcznego
      `{ success: boolean; data?: T }`
- [ ] Przy `success: false` wrzuć `parsed.error` do komunikatu `ApiError`
      zamiast surowego body
- [ ] Przy `success: false` na 2xx komunikat mówi dziś `-> 200`, co brzmi
      absurdalnie. Rozstrzygnij, co pokazać
- [ ] **Nie dodawaj** obsługi 204 ani `putJson` - dopiero gdy coś padnie
      z `Invalid JSON response:` albo pojawi się pierwszy test aktualizacji

## Krok 6 - `auth.api.ts` na wrapperze

- [ ] `loginAs` i `registerVerifiedUser` na `postJson` - to wrappery happy-path,
      więc rzucanie `ApiError` jest tu pożądane. Znika `expect` **i** ręczny
      `if (!body.data) throw`
- [ ] **Nie ruszaj** `registerUser`, `loginUser`, `logout`,
      `validateAuthorization*`. Zwracają surowe `APIResponse` celowo, bo
      `tests/api/auth.api.spec.ts` asertuje na statusach 400/401/403/409 -
      wrapper rzuciłby wyjątek zamiast pozwolić na asercję

## Krok 7 - testy API

`tests/api/` zawiera dziś tylko `auth.api.spec.ts`. Test **jest** sondą, tylko
taką, która zostaje i pilnuje kontraktu. Sondowanie kształtów rób w tym kroku.

- [ ] `financial.api.spec.ts` - saldo, historia z paginacją (`total`, `limit`,
      `offset`, `hasMore`), income vs expense. Zacznij tutaj: `getAccountBalance`
      i `addTransaction` są realnie używane, więc masz punkt odniesienia
- [ ] `marketplace.api.spec.ts` - lista ofert, oferty własne, anulowanie
- [ ] `farm.api.spec.ts` - CRUD pól, zwierząt, staffu, przypisań
- [ ] Asercja na polu, którego nie ma w modelu, nie skompiluje się - to jest
      Twoja walidacja typów

## Krok 8 - decyzja o martwym kodzie

Te funkcje mają **zero wywołań** w repo. Dla każdej: usuń albo pokryj testem
w Kroku 7. Nie ma trzeciej opcji.

- [ ] `transferFunds` - UI to pokrywa (`FinancialPage.transferFunds`), a POST
      rusza prawdziwe pieniądze. Sugestia: usunąć
- [ ] `getTransactions` - paginacja to sensowny scenariusz API. Sugestia: test
- [ ] `getAssignments` - sugestia: test
- [ ] `createAssignment` + `deleteAssignment` - sugestia: usunąć, chyba że
      przepisujesz setup w `staff-assign` na API (osobne zadanie)
- [ ] `cancelAllMyOffers` + `deleteOneOffer` - pierwsza nieużywana, druga
      używana tylko przez pierwszą. Sugestia: usunąć obie albo pokryć w
      `marketplace.api.spec.ts`

## Krok 9 - typy zgodne z tym, co API naprawdę zwraca

Dopiero tutaj. Po Krokach 7-8 wiesz, co API zwraca, i masz testy, które to
zweryfikują.

- [ ] `getAccountBalance` używa anonimowego `{ account: { balance: number } }`.
      Wyciągnij `Account` do `src/models/financial.ts`, dodaj `getAccount()`
      obok, a `getAccountBalance` zostaw jako skrót delegujący
- [ ] `create*` w `farm.api.ts` deklarują `postJson<{ id: number }>`. Otypuj
      `Field`, `Animal` i zwracaj `created.id`
- [ ] `createField` przyjmuje `district`, a model `Field` nie ma takiego pola.
      Wysyłasz coś, czego nie odbierasz - rozstrzygnij
- [ ] `MarketplaceOffer` pomija `sellerId`, `itemId`, `createdAt`, `updatedAt`,
      `details`, `sellerLabel`. Uzupełnij albo zostaw świadomie jako podzbiór -
      ale **zapisz decyzję w komentarzu**, żeby za pół roku nie sprawdzać znowu

## Krok 10 - drobne długi

Kosmetyka, dowolna kolejność, po jednej na commit.

- [ ] `trace: 'on'` -> `retain-on-failure`. Każdy przebieg zapisuje dziś pełny
      trace ze zrzutami, stąd puchnące `test-results/`. Zmień **po** skończeniu
      sondowania, bo do sond trace jest potrzebny
- [ ] `.playwright-cli/` do `.gitignore` **plus `git rm --cached`** - cztery
      pliki są już śledzone, sam `.gitignore` ich nie usunie
- [ ] Rozbij `src/helpers/testDataHelpers.ts`: stałe (`FIELD_AREA`, `STAFF_AGE`)
      do `src/constants/`, generatory (`newAmount`, `getRandomAnimalType`) do
      `src/factories/`, `generateUniqueEmail` obok `prepareRandomUser`. Potem
      usuń katalog `src/helpers/`
- [ ] `newAmount` - dopisz `: number`, usuń `eslint-disable`
- [ ] `expect` w `MarketplacePage.ts:198` łamie `CODING_STANDARDS.md`. To nie
      asercja, tylko przebrane oczekiwanie - zamień na `waitFor`
- [ ] `createField`/`createStaff` istnieją dwa razy: w `farm.actions.ts` (UI)
      i `farm.api.ts` (API). Nazwij warstwę UI jawnie albo importuj namespace'owo
- [ ] `getFieldByName` w `ManagementPage` jest używane do szukania pracowników.
      Nazwa kłamie o zakresie
- [ ] Magiczne liczby w `financial.isolated.spec.ts`: `18450` to `9500`
      z `beforeEach` + `9000` - `50`. Policz z `getAccountBalance` zamiast
      hardkodować
- [ ] CI ma tylko `on: workflow_dispatch`, więc bramka `quality` nigdy nie
      odpala się przy PR. Dodaj `pull_request`

---

## Jak sprawdzić kształt odpowiedzi

Projekt `api-tests` nie ma `dependencies` ani przeglądarki, więc startuje
w sekundy.

```ts
import { test } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';

import { DEMO_USER_AUTH_FILE } from '../../playwright.config';

test.use({ storageState: DEMO_USER_AUTH_FILE });

test('probe', async ({ request }) => {
  const response = await request.get(`${BASE_API_URL}/fields/assign`);
  await test.info().attach('body', { body: await response.text() });
});
```

`npx playwright test --project=api-tests probe --reporter=list`

Uwaga: `console.log` nie przejdzie - masz `'no-console': 'error'` w eslincie
i `--max-warnings=0` w `lint-staged`. Stąd `test.info().attach()` powyżej.
Sondy i tak są do wyrzucenia, więc ich nie commituj.

Alternatywa: `npx playwright show-trace test-results/.../trace.zip` -> Network
-> response body.
