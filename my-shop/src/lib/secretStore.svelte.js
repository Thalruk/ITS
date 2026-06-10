// src/lib/secretStore.svelte.js

class SecretGameStore {
    // Definiujemy reaktywne pola stanu Svelte 5 wraz z ich typami dla TypeScriptu
    /** @type {boolean} */
    konamiActivated = $state(false);

    /** @type {string[]} */
    solvedPages = $state([]);

    constructor() {
        // Bezpieczne wczytanie stanu z localStorage przy uruchomieniu w przeglądarce
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('gamershop_secret_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.konamiActivated = parsed.konamiActivated || false;
                this.solvedPages = parsed.solvedPages || [];
            }
        }
    }

    /**
     * Aktywuje tryb hakerski (bool) po prawidłowym wpisaniu Konami Code
     */
    activateGame() {
        this.konamiActivated = true;
        this.save();
    }

    /**
     * Oznacza konkretną podstronę jako rozwiązaną i dodaje ją do tablicy
     * @param {string} pageName - Unikalna nazwa identyfikująca stronę (np. 'MessiOrRonaldo')
     */
    markPageAsSolved(pageName) {
        if (!this.solvedPages.includes(pageName)) {
            this.solvedPages.push(pageName);
            this.save();
        }
    }

    /**
     * Całkowity reset stanu gry – przywraca domyślne ustawienia i czyści pamięć podręczną
     */
    resetGame() {
        this.konamiActivated = false;
        this.solvedPages = [];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('gamershop_secret_state');
        }
    }

    /**
     * Pomocnicza metoda zapisu aktualnego stanu do localStorage
     */
    save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('gamershop_secret_state', JSON.stringify({
                konamiActivated: this.konamiActivated,
                solvedPages: this.solvedPages
            }));
        }
    }
}

// Eksportujemy gotową, globalną instancję magazynu do użycia w komponentach
export const secretGameStore = new SecretGameStore();