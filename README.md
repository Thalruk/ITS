# 🛒 Sklep Internetowy - Projekt Zespołowy (SvelteKit)

Projekt nowoczesnego sklepu internetowego realizowany w technologii SvelteKit.

## 🚀 Jak zacząć? (Instrukcja dla zespołu)

Aby uruchomić projekt lokalnie na swoim komputerze, wykonaj poniższe kroki:

### 1. Wymagane oprogramowanie
Upewnij się, że masz zainstalowane:
* **Node.js** (wersja 20 LTS lub nowsza) -> [Pobierz stąd](https://nodejs.org/)
* **Visual Studio Code** -> [Pobierz stąd](https://code.visualstudio.com/)
* **GitHub Desktop** (ułatwia pracę z gitem) -> [Pobierz stąd](https://desktop.github.com/)

### 2. Pobieranie projektu
1. Otwórz **GitHub Desktop**.
2. Wybierz `File` -> `Clone Repository`.
3. Wybierz ten projekt z listy Twoich repozytoriów na GitHubie.

### 3. Pierwsze uruchomienie
Otwórz folder z projektem w **Visual Studio Code**, otwórz terminal (``Ctrl + ` ``).

# Instalacja wszystkich potrzebnych bibliotek (node_modules)
```
npm install
```
# Uruchomienie serwera deweloperskiego
```
npm run dev
```

# Instalacja bazy danych supabase
```
npm install @supabase/supabase-js
```


# 🎮 GamerShop Pro - Sklep Internetowy (SvelteKit)

Poniżej znajduje się opis aktualnej architektury projektu, aby każdy wiedział, za co odpowiadają poszczególne pliki i gdzie dodawać nowy kod.

# Rady Dotyczące pisania kodu

- Dodajemy ścieżki bezwględne do tekstur
- Jak plik ma ponad 300 lini to go dzielisz no mniejsze
- Jeśli różne podstrony muszą widzieć te same dane (np. ilość przedmiotów w koszyku), modyfikuj plik src/lib/store.svelte.js zamiast przekazywać dane w dół drzewa.

## 📁 Architektura Projektu

Struktura plików została podzielona zgodnie z logiką SvelteKit na kod współdzielony (`src/lib/`) oraz widoki podstron (`src/routes/`).

```txt
src/
├── lib/                                # Kod współdzielony w całej aplikacji (Alias: $lib)
│   ├── components/                     # Reużywalne komponenty wizualne (SFC)
│   │   ├── AdminPanel.svelte           # Formularz dodawania nowych gier do Supabase
│   │   ├── CheckoutForm.svelte         # Formularz finalizacji zamówienia
│   │   ├── EditModal.svelte            # Wyskakujące okno do edycji gier przez Admina
│   │   ├── Footer.svelte               # Globalna stopka z linkami (Regulamin, Kontakt)
│   │   ├── GameCard.svelte             # Karta pojedynczej gry (wygląd, logiki akcji)
│   │   └── Navbar.svelte               # Główna, pływająca nawigacja z licznikiem koszyka, filtrowaniem i kategoriami
│   │
│   ├── services/                       # Serwisy (zewnętrzne API, logika biznesowa backendu)
│   │   ├── admin.js                    # Logika akcji administratora (produkty, zwroty, zapytania)
│   │   ├── auth.js                     # Logika pomocnicza związana z autoryzacją
│   │   ├── cart.js                     # Logika koszyka i dodawania produktów
│   │   └── orders.js                   # Logika zamówień, historii zamówień i zwrotów
│   │
│   ├── index.ts                        # Główny plik eksportujący moduły z folderu lib
│   ├── store.svelte.js                 # GLOBALNY STAN APLIKACJI (Svelte 5) - user, koszyk i filtry
│   └── supabaseClient.js               # Inicjalizacja klienta bazy danych Supabase
│
├── routes/                             # File-based routing (każdy folder to adres URL)
│   ├── auth/                           # Moduł autoryzacji użytkowników
│   │   ├── login/                      # Podstrona logowania (/auth/login)
│   │   │   ├── +page.server.ts         # Logika backendowa logowania
│   │   │   └── +page.svelte            # Formularz wizualny logowania
│   │   └── register/                   # Podstrona rejestracji (/auth/register)
│   │       ├── +page.server.ts         # Logika backendowa tworzenia konta w bazie
│   │       └── +page.svelte            # Formularz wizualny zakładania konta
│   │
│   ├── admin/                          # Podstrona panelu administratora (/admin)
│   │   ├── +page.js                    # Loader danych dla panelu administratora
│   │   └── +page.svelte                # Panel administratora i zarządzanie sklepem
│   │
│   ├── gry/                            # Podstrona: /gry (Główny katalog)
│   │   ├── kategoria/
│   │   │   └── [nazwa_kategorii]/      # Dynamiczna podstrona kategorii (/gry/kategoria/...)
│   │   │       ├── +page.js            # Pobieranie gier z wybranej kategorii
│   │   │       └── +page.svelte        # Widok produktów z wybranej kategorii
│   │   ├── +page.js                    # Pobieranie wszystkich gier z bazy
│   │   └── +page.svelte                # Siatka gier i wywołania komponentów Admin/Karty
│   │
│   ├── koszyk/                         # Podstrona koszyka klienta (/koszyk)
│   │   ├── +page.js                    # Loader dla widoku koszyka
│   │   ├── +page.svelte                # Widok koszyka i podsumowania zamówienia
│   │   └── koszyk.css                  # Style CSS dedykowane wyłącznie dla koszyka
│   │
│   ├── products/
│   │   ├── details/
│   │   │   └── [id]/                   # Dynamiczny widok pojedynczego produktu
│   │   │       ├── +page.js            # Pobieranie danych pojedynczej gry
│   │   │       └── +page.svelte        # Szczegóły produktu i dodawanie do koszyka
│   │   └── products.svelte             # Pomocniczy widok produktów
│   │
│   ├── zamowienia/                     # Podstrona panelu klienta (/zamowienia)
│   │   └── +page.svelte                # Historia zamówień, statusy i zgłaszanie zwrotów
│   │
│   ├── +layout.server.ts               # Globalny loader layoutu (pobiera użytkownika i kategorie do menu)
│   ├── +layout.svelte                  # Główna rama aplikacji (Navbar + zawartość + Footer)
│   ├── +page.server.ts                 # Globalny kod backendowy dla strony głównej
│   ├── +page.svelte                    # Strona główna (/): Hero banner i sekcje produktów
│   ├── layout.css                      # Globalne style dla układu aplikacji
│   └── page.css                        # Style strony głównej
│
└── assets/                             # Pliki statyczne projektu (np. grafiki, ikony, fonty)
