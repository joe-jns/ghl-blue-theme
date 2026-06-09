/* =====================================================================
   GHL — Loader thème bleu (à coller dans le Custom JS / footer GHL)
   ---------------------------------------------------------------------
   - N'active le thème QUE pour les location IDs listés ci-dessous.
   - L'ID est lu dans l'URL : /v2/location/<ID>/...
   - GHL est une SPA : on surveille les changements d'URL pour
     activer/désactiver le thème quand on change de sous-compte.
   ===================================================================== */
(function () {
  // 👉 Ajoute ici les IDs des sous-comptes à thémer en bleu :
  var ALLOWED_IDS = [
    'mQFJ3gCpL6NWwmyisGFR'
    // , 'AUTRE_ID_ICI'
    // , 'ENCORE_UN_ID'
  ];

  var CSS_URL  = 'https://cdn.jsdelivr.net/gh/joe-jns/ghl-blue-theme@main/blue-theme.css';
  var STYLE_ID = 'bt-blue-theme';

  function currentLocationId() {
    var m = location.pathname.match(/\/location\/([^\/?#]+)/);
    return m ? m[1] : null;
  }

  function apply() {
    var allowed  = ALLOWED_IDS.indexOf(currentLocationId()) !== -1;
    var existing = document.getElementById(STYLE_ID);

    if (allowed && !existing) {
      var link = document.createElement('link');
      link.id   = STYLE_ID;
      link.rel  = 'stylesheet';
      link.href = CSS_URL;
      document.head.appendChild(link);
    } else if (!allowed && existing) {
      existing.remove();
    }
  }

  apply();

  // SPA : re-checke quand l'URL change (navigation entre sous-comptes)
  var lastPath = location.pathname;
  setInterval(function () {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      apply();
    }
  }, 500);
})();
