/* =====================================================================
   GHL — Thème bleu : moteur complet (V2 "exhaustif")
   ---------------------------------------------------------------------
   Logique lourde déportée ici (chargée depuis GitHub via le loader court).
   Couvre :
     1. Le CSS statique (palette --primary-* + sélecteurs sidebar clés)
     2. Un SCAN dynamique de toutes les feuilles de style : détecte chaque
        couleur orange et la réécrit en bleu équivalent (même luminosité)
     3. Un MutationObserver : re-scan quand de nouveaux <style>/<link> sont
        injectés en async (Extendly, Pendo, widgets tiers...)

   Note : impossible de scanner les feuilles CORS (cross-origin) — elles
   sont ignorées proprement. Les images/logos PNG/SVG ne sont pas du CSS,
   donc non couverts ici.
   ===================================================================== */
(function () {
  var CSS_URL    = 'https://cdn.jsdelivr.net/gh/joe-jns/ghl-blue-theme@main/blue-theme.css';
  var OUT_STYLE  = 'bt-blue-scan';   // <style> où on écrit nos overrides
  var LINK_ID    = 'bt-blue-theme';  // <link> du CSS statique

  /* ---------- Logo : remplace le logo agence par "MLMCoPilot" -------
     - text : le texte affiché à côté de l'icône
     - img  : si tu préfères TA propre image, mets son URL ici
              (sinon laisse '' et on utilise l'icône SVG + texte)        */
  var LOGO = {
    text: 'MLMCoPilot',
    img:  ''
  };

  /* ---------- 1. CSS statique (palette + sidebar) ------------------- */
  if (!document.getElementById(LINK_ID)) {
    var link = document.createElement('link');
    link.id = LINK_ID; link.rel = 'stylesheet'; link.href = CSS_URL;
    document.head.appendChild(link);
  }

  /* ---------- Remplacement du logo agence -------------------------- */
  function buildLogo() {
    if (LOGO.img) {
      return '<img src="' + LOGO.img + '" alt="logo" class="bt-logo" ' +
        'style="height:40px;max-width:80%;object-fit:contain">';
    }
    return '<div class="bt-logo" style="display:flex;align-items:center;' +
      'gap:8px;height:40px">' +
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#188bf6" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round">' +
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>' +
      '<path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
      '<span style="font-weight:700;font-size:20px;color:#1a1f36;' +
      'white-space:nowrap;font-family:inherit">' + LOGO.text + '</span></div>';
  }
  function replaceLogo() {
    var conts = document.querySelectorAll('.agency-logo-container');
    for (var i = 0; i < conts.length; i++) {
      if (conts[i].querySelector('.bt-logo')) continue; // déjà remplacé
      conts[i].innerHTML = buildLogo();
    }
  }

  /* ---------- Helpers couleur -------------------------------------- */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    h /= 360;
    function hue(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue(p, q, h + 1 / 3); g = hue(p, q, h); b = hue(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Un orange/ambre = teinte ~15-50°, assez saturé. On exclut le rouge pur
  // (h<14, états "error") pour ne pas casser les messages d'erreur.
  function isOrange(r, g, b) {
    var hsl = rgbToHsl(r, g, b), h = hsl[0], s = hsl[1], l = hsl[2];
    return h >= 14 && h <= 50 && s >= 0.30 && l >= 0.12 && l <= 0.92;
  }
  // Orange -> bleu : on garde la luminosité, on force la teinte bleue.
  function toBlue(r, g, b) {
    var hsl = rgbToHsl(r, g, b);
    var rgb = hslToRgb(212, Math.max(hsl[1], 0.55), hsl[2]);
    return rgb;
  }

  /* ---------- Remplacement des couleurs dans une valeur CSS --------- */
  var HEX = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
  var RGB = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/gi;

  function replaceColors(val) {
    var changed = false;

    val = val.replace(HEX, function (m, hx) {
      var r, g, b;
      if (hx.length === 3) {
        r = parseInt(hx[0] + hx[0], 16);
        g = parseInt(hx[1] + hx[1], 16);
        b = parseInt(hx[2] + hx[2], 16);
      } else {
        r = parseInt(hx.slice(0, 2), 16);
        g = parseInt(hx.slice(2, 4), 16);
        b = parseInt(hx.slice(4, 6), 16);
      }
      if (!isOrange(r, g, b)) return m;
      changed = true;
      var c = toBlue(r, g, b);
      return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
    });

    val = val.replace(RGB, function (m, r, g, b, a) {
      r = +r; g = +g; b = +b;
      if (!isOrange(r, g, b)) return m;
      changed = true;
      var c = toBlue(r, g, b);
      return (a !== undefined)
        ? 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'
        : 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
    });

    return changed ? val : null;
  }

  /* ---------- Scan d'une liste de règles (récursif @media) ---------- */
  var COLOR_PROPS = ['color', 'background-color', 'background', 'border-color',
    'border-top-color', 'border-right-color', 'border-bottom-color',
    'border-left-color', 'fill', 'stroke', 'outline-color', 'box-shadow',
    'text-decoration-color', 'caret-color', 'column-rule-color'];

  function scanRules(rules, buf) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.cssRules && rule.cssRules.length) {       // @media, @supports...
        scanRules(rule.cssRules, buf);
        continue;
      }
      if (!rule.style || !rule.selectorText) continue;
      var decls = [];
      for (var p = 0; p < COLOR_PROPS.length; p++) {
        var prop = COLOR_PROPS[p];
        var v = rule.style.getPropertyValue(prop);
        if (!v) continue;
        var nv = replaceColors(v);
        if (nv) decls.push(prop + ':' + nv + ' !important');
      }
      // Variables custom (--primary-500: #1F1A14, etc.)
      for (var k = 0; k < rule.style.length; k++) {
        var name = rule.style[k];
        if (name.indexOf('--') !== 0) continue;
        var vv = rule.style.getPropertyValue(name);
        var nvv = replaceColors(vv);
        if (nvv) decls.push(name + ':' + nvv);
      }
      if (decls.length) {
        buf.push(rule.selectorText + '{' + decls.join(';') + '}');
      }
    }
  }

  /* ---------- Scan complet de toutes les feuilles ------------------- */
  function fullScan() {
    var buf = [];
    var out = document.getElementById(OUT_STYLE);
    for (var s = 0; s < document.styleSheets.length; s++) {
      var sheet = document.styleSheets[s];
      if (sheet.ownerNode && sheet.ownerNode.id === OUT_STYLE) continue;
      var rules;
      try { rules = sheet.cssRules; } catch (e) { continue; } // CORS -> skip
      if (rules) scanRules(rules, buf);
    }
    if (!buf.length) return;
    if (!out) {
      out = document.createElement('style');
      out.id = OUT_STYLE;
      document.head.appendChild(out);
    }
    out.textContent = buf.join('\n');
  }

  /* ---------- Lancement + debounce --------------------------------- */
  var t = null;
  function schedule() {
    replaceLogo();
    if (t) clearTimeout(t);
    t = setTimeout(fullScan, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
  window.addEventListener('load', schedule);

  /* ---------- MutationObserver : nouvelles feuilles injectées ------- */
  var obs = new MutationObserver(function (muts) {
    replaceLogo();   // re-applique le logo si GHL a re-rendu la sidebar
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var n = added[j];
        if (n.nodeType !== 1) continue;
        var tag = n.tagName;
        if (tag === 'STYLE' || tag === 'LINK') {
          if (n.id === OUT_STYLE || n.id === LINK_ID) continue;
          if (tag === 'LINK') n.addEventListener('load', schedule);
          schedule();
        }
      }
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
