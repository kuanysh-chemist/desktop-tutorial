/* Іске қосу (window.__NOBOOT — тек мәтінді экспорттау құралы үшін) */
(function () { function go() { if (!window.__NOBOOT) Deck.start(); } if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); })();
