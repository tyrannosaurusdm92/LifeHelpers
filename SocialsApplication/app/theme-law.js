(function () {
  'use strict';

  const palette = {
    lightest: ['#E8FFFF','#D6FFFA','#C9FFF4','#FFE6C9','#FFF3D6'],
    light: ['#99FFFF','#7EFBEA','#65E9D2','#F7B36B','#EFA35C'],
    medium: ['#00FFFF','#00D9D9','#2FBED8','#CA6309','#B85A08'],
    dark: ['#008B8B','#007A78','#0B6E74','#7A3A07','#643006'],
    darkest: ['#003C42','#003A3A','#062D34','#2A1304','#1A0A02'],
    buttonLightest: ['#FFFFFF','#ECFFFF','#FFF1E6','#F1FFF9','#E9F8FF'],
    buttonDarkest: ['#001E24','#220E02','#09292C','#061F27','#0A241F'],
    navLightest: ['#EFFBFF','#E8FFF9','#FFF3E8','#F4FAF9','#F1F1FF'],
    navDarkest: ['#03161A','#071B1C','#240E02','#0C1416','#0A0B20'],
    pageLightest: ['#CDD7D8','#C7D8D5','#DAC5B2','#D0DDE2','#D9D2E8'],
    pageDarkest: ['#000305','#000000','#050201','#020712','#04030A'],
    textLightest: ['#FFFFFF','#F3E9DB','#FFF8ED','#EFFFFF','#F9FFFC'],
    textDarkest: ['#2D2722','#0B3F43','#3A200B','#162E38','#1A3029'],
    inputLightest: ['#DFFFFF','#E4FFF8','#FFEBD9','#F4FFFC','#E6F7FF'],
    inputDarkest: ['#00242B','#052C2A','#2B1202','#082820','#042631']
  };

  function randomColor(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getReadablePair(lightest = palette.lightest, darkest = palette.darkest) {
    const useLightBackground = Math.random() > 0.5;
    return useLightBackground
      ? { background: randomColor(lightest), text: randomColor(darkest) }
      : { background: randomColor(darkest), text: randomColor(lightest) };
  }

  function getAccentColor() {
    const groups = [palette.light, palette.medium, palette.dark];
    return randomColor(groups[Math.floor(Math.random() * groups.length)]);
  }

  function makeTheme() {
    const page = getReadablePair(palette.pageLightest, palette.pageDarkest);
    const panel = getReadablePair(palette.lightest, palette.darkest);
    const text = page.background && palette.pageDarkest.includes(page.background)
      ? { background: page.background, text: randomColor(palette.textLightest) }
      : { background: page.background, text: randomColor(palette.textDarkest) };
    return {
      page,
      panel,
      text,
      button: getReadablePair(palette.buttonLightest, palette.buttonDarkest),
      navigation: getReadablePair(palette.navLightest, palette.navDarkest),
      input: getReadablePair(palette.inputLightest, palette.inputDarkest),
      border: getAccentColor(),
      divider: getAccentColor(),
      slider: getAccentColor(),
      accent: getAccentColor(),
      glow: getAccentColor()
    };
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const vars = {
      '--law-page-bg': theme.page.background,
      '--law-page-fg': theme.text.text,
      '--law-panel-bg': theme.panel.background,
      '--law-panel-fg': theme.panel.text,
      '--law-button-bg': theme.button.background,
      '--law-button-fg': theme.button.text,
      '--law-nav-bg': theme.navigation.background,
      '--law-nav-fg': theme.navigation.text,
      '--law-input-bg': theme.input.background,
      '--law-input-fg': theme.input.text,
      '--law-border': theme.border,
      '--law-divider': theme.divider,
      '--law-slider': theme.slider,
      '--law-accent': theme.accent,
      '--law-glow': theme.glow
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  }

  function loadTheme() {
    try {
      const stored = JSON.parse(localStorage.getItem('messengerPlugin.colorLawTheme') || 'null');
      if (stored && stored.button && stored.navigation) return stored;
    } catch (error) {}
    const theme = makeTheme();
    try { localStorage.setItem('messengerPlugin.colorLawTheme', JSON.stringify(theme)); } catch (error) {}
    return theme;
  }

  window.MessengerColorLaw = { palette, randomColor, getReadablePair, getAccentColor, makeTheme, applyTheme };
  applyTheme(loadTheme());

  window.addEventListener('DOMContentLoaded', () => {
    const reroll = document.querySelector('#rerollTheme');
    if (reroll) reroll.addEventListener('click', () => {
      const theme = makeTheme();
      try { localStorage.setItem('messengerPlugin.colorLawTheme', JSON.stringify(theme)); } catch (error) {}
      applyTheme(theme);
    });
  });
})();
