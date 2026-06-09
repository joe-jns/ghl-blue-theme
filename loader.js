/* =====================================================================
   GHL — Loader thème bleu (à coller dans le Custom JS / footer GHL)
   ---------------------------------------------------------------------
   Snippet court : vérifie le location ID dans l'URL et, si autorisé,
   charge le moteur complet (theme.js) depuis GitHub.
   ===================================================================== */
(function () {
  var IDS = ['mQFJ3gCpL6NWwmyisGFR'];           // 👈 ajoute des IDs ici
  var m = location.pathname.match(/\/location\/([^\/?#]+)/);
  if (!m || IDS.indexOf(m[1]) < 0) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/joe-jns/ghl-blue-theme@main/theme.js';
  document.head.appendChild(s);
})();
