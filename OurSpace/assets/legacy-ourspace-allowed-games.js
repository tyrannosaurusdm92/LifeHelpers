// Auto-generated allowed games list. Includes local and external-fallback tracked games.
(function(){
  'use strict';
  const ids=["candycrush", "amongus", "angrybirds", "plantsvszombies", "fruitninja", "flappybird", "jetpackjoyride", "fnaf", "fnaf4", "fnaf2", "fnaf3", "fnafcustom", "badpiggies", "8ballclassic", "bubbleshooter", "doodlejump", "doodleroad", "paintbynumber", "fancypantsadventure2", "ducklife", "backrooms", "capybaraclicker", "minesweeper", "houseofhazards", "retropingpong", "bloxorz", "noobminer", "clashofvikings", "floodrunner2"];
  const normalize=id=>String(id||'').toLowerCase().replace(/\.html?$/i,'').replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');
  window.OurSpaceAllowedGameIds=ids.slice();
  window.OurSpaceAllowedGames={
    schema:'ourspace.allowed_games.runtime.v3',
    privateInSiteCurrencyOnly:true,
    realMoneyPayouts:false,
    currencyScale:{copper:1,silver:10,gold:100,platinum:1000},
    conversionRules:['10 copper = 1 silver','10 silver = 1 gold','10 gold = 1 platinum','copper/silver/gold always display 0-9; platinum has no display cap'],
    ids:ids.slice(),
    has:id=>ids.map(normalize).includes(normalize(id))
  };
})();
