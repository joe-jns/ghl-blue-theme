# GHL — Thème bleu (Business Toolbox)

Re-skin de l'UI GoHighLevel / Business Toolbox : remplace l'orange BT par du bleu (`#188bf6`, le bleu natif GHL).

Basé sur l'inventaire `orange-instances.md`.

## Fichiers

- **`loader.js`** — le snippet COURT à coller dans le Custom JS de GHL. Vérifie le `location ID` dans l'URL (`/v2/location/<ID>`) et, si autorisé, charge `theme.js`.
- **`theme.js`** — le moteur complet (V2) : injecte le CSS statique + **scanne dynamiquement toutes les feuilles de style et réécrit chaque orange en bleu** + `MutationObserver` pour les CSS injectés en async (Extendly, etc.).
- **`blue-theme.css`** — CSS statique : palette `--primary-*` + sélecteurs sidebar clés (chargé par `theme.js`, évite le flash orange au démarrage).

## Installation dans GHL

Coller le contenu de `loader.js` dans le **Custom JS / Footer Code** (niveau agence ou sous-compte). Le thème ne s'applique qu'aux sous-comptes dont l'ID figure dans `ALLOWED_IDS`.

## Ajouter un sous-compte

Éditer le tableau `ALLOWED_IDS` dans `loader.js` (et republier le snippet dans GHL).

## CDN

Le CSS est servi via jsDelivr :

```
https://cdn.jsdelivr.net/gh/joe-jns/ghl-blue-theme@main/blue-theme.css
```

> ⚠️ jsDelivr met `@main` en cache jusqu'à ~12h. Pour forcer le rafraîchissement après modif : utiliser un tag de version (`@v1.0.1`) ou purger via `https://purge.jsdelivr.net/gh/joe-jns/ghl-blue-theme@main/blue-theme.css`.
