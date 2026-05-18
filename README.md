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

Struktura plików została podzielona zgodnie z najlepszymi praktykami SvelteKit na logikę globalną (`src/lib/`) oraz widoki podstron (`src/routes/`).

```text
src/
├── lib/                        # Kod współdzielony w całej aplikacji (Alias: $lib)
│   ├── components/             # Reużywalne komponenty wizualne (SFC)
│   │   ├── AdminPanel.svelte   # Formularz dodawania nowych gier do Supabase
│   │   ├── EditModal.svelte    # Wyskakujące okno do edycji gier przez Admina
│   │   ├── Footer.svelte       # Globalna stopka z linkami (Regulamin, Kontakt)
│   │   ├── GameCard.svelte     # Karta pojedynczej gry (wygląd, logiki akcji)
│   │   └── Navbar.svelte       # Główna, pływająca nawigacja z licznikiem koszyka
│   │
│   ├── services/               # Serwisy (zewnętrzne API, logika biznesowa backendu)
│   ├── index.ts                # Główny plik eksportujący moduły z folderu lib
│   ├── store.svelte.js         # GLOBALNY STAN APLIKACJI (Svelte 5) - user i koszyk
│   └── supabaseClient.js       # Inicjalizacja klienta bazy danych Supabase
│
└── routes/                     # File-based routing (Każdy folder to adres URL)
    ├── auth/                   # Moduł autoryzacji użytkowników
    │   ├── login/              # Podstrona logowania (/auth/login)
    │   │   ├── +page.server.ts # Logika backendowa (np. weryfikacja ciasteczek sesji)
    │   │   └── +page.svelte    # Formularz wizualny logowania
    │   └── register/           # Podstrona rejestracji (/auth/register)
    │       ├── +page.server.ts # Logika backendowa (np. tworzenie konta w bazie)
    │       └── +page.svelte    # Formularz wizualny zakładania konta
    │
    ├── gry/                    # Podstrona: /gry (Główny katalog)
    │   ├── +page.js            # Pobieranie wszystkich gier z bazy
    │   └── +page.svelte        # Siatka gier i wywołania komponentów Admin/Karty
    │
    ├── koszyk/                 # Podstrona koszyka klienta (/koszyk)
    │   ├── +page.js            # Loader dla widoku koszyka
    │   ├── +page.svelte        # Widok podsumowania zamówienia
    │   └── koszyk.css          # Style CSS dedykowane wyłącznie dla koszyka
    │
    ├── +layout.js              # Główny loader strony (pobiera kategorie do menu)
    ├── +layout.svelte          # Główna rama aplikacji (Navbar + zawartość + Footer)
    ├── +page.js                # Loader dla strony głównej (pobiera gry z bazy)
    ├── +page.server.ts         # Globalny kod backendowy dla strony głównej
    ├── +page.svelte            # Strona główna (/): Hero banner i infinite scroll
    ├── layout.css              # Globalne style dla całej aplikacji
    └── page.css
└── static/assets               # Pliki statyczne (np. globalne grafiki, ikony, fonty)