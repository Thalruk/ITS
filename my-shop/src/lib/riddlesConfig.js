// src/lib/riddlesConfig.js
import { secretGameStore } from '$lib/secretStore.svelte.js';
/**
 * @typedef {Object} RiddleConfig
 * @property {number} id - Numer kafelka w Navbarze (1-12)
 * @property {string} pageName - Nazwa podstrony (np. 'MessiOrRonaldo')
 * @property {string} correctPassword - Poprawne hasło
 * @property {any} targetProductId - ID gry w Waszej bazie Supabase (tekst lub liczba, zależnie od bazy)
 * @property {string} rewardName - Komunikat o odblokowanej promocji
 */

/**
 * Centralny rejestr wszystkich 12 zagadek i ukrytych promocji.
 * @type {RiddleConfig[]}
 */
export const riddlesConfig = [
    { 
        id: 1, 
        pageName: 'MessiOrRonaldo', 
        correctPassword: 'love4games', 
        targetProductId: 32, 
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    { 
        id: 2, 
        pageName: 'love4games', 
        correctPassword: 'MessiOrRonaldo', 
        targetProductId: 32, 
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 3,
        pageName: 'szym1',
        correctPassword: 'Novigrad', 
        targetProductId: 32,              
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 4,
        pageName: 'zagadki/4',
        correctPassword: '6721', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 5,
        pageName: 'LoginMystery1',
        correctPassword: 'bit.ly/arg02', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 6,
        pageName: 'LoginMystery2',
        correctPassword: 'bit.ly/arg01', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 7,
        pageName: 'szym2',
        correctPassword: 'NieznoszePortali', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 8,
        pageName: 'cyber-delivery',
        correctPassword: 'Chooh2Collector', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 9,
        pageName: 'zagadki/9',
        correctPassword: '0701', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 10,
        pageName: 'Chooh2Collector',
        correctPassword: 'ViceCityEasterEgg2026', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 11,
        pageName: 'zagadki/kub1',
        correctPassword: 'OVERRIDE_ACCEPTED_2026', 
        targetProductId: 32,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 12,
        pageName: 'zagadki/kub2',
        correctPassword: 'SUDO_MAKE_ME_A_SANDWICH', 
        targetProductId: 80,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    }
];


/**
 * Globalna funkcja sprawdzająca, czy promocja dla danej gry powinna być widoczna.
 * Zapobiega wyświetlaniu przecen przed rozwiązaniem powiązanej zagadki w całym sklepie.
 * * @param {any} game - Obiekt gry z bazy danych
 * @returns {boolean} - True, jeśli promocja ma być aktywna na ekranie
 */
export function isPromoActive(game) {
    if (!game) return false;
    
    const hasPromoPrice = game.promo_price > 0 && game.promo_price < game.price;
    if (!hasPromoPrice) return false;

    const riddle = riddlesConfig.find(r => r.targetProductId === game.id);
    
    if (!riddle) return true;

    return secretGameStore.solvedPages.includes(riddle.pageName);
}