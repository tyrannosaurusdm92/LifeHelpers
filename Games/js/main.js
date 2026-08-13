(() => {
  "use strict";

  const GAMEBOTS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbxtg0qeYabfixQTiWwe3v_MhKt1TpaSb4XAwSDgopms3q5EQMXPJUM5gHga0AnVFLc06A/exec";

  // LifeHelpers Arcade catalog generated from docs/README_BOTH.md,
  // docs/README_DESKTOP.md, plus the 9 existing loader games assigned to Both.
  const GAMES = [
  { title: "8 Ball Classic", path: "Both/8ballclassic.html", platform: "both" },
  { title: "Bloons TD", path: "Both/bloonsTD.html", platform: "both" },
  { title: "Bob the Robber 5", path: "Both/bobtherobber5.html", platform: "both" },
  { title: "CircloO", path: "Both/circloO.html", platform: "both" },
  { title: "Flood Runner 3", path: "Both/floodrunner3.html", platform: "both" },
  { title: "Google Baseball", path: "Both/googlebaseball.html", platform: "both" },
  { title: "Jumping Shell", path: "Both/jumpingshell.html", platform: "both" },
  { title: "Papa's Cheeseria", path: "Both/papascheeseria.html", platform: "both" },
  { title: "Papa's Pizzeria", path: "Both/papaspizzeria.html", platform: "both" },
  { title: "Riddle School 2", path: "Both/riddleschool2.html", platform: "both" },
  { title: "Stacktris", path: "Both/stacktris.html", platform: "both" },
  { title: "Trap the Cat", path: "Both/trapthecat.html", platform: "both" },
  { title: "Age of War", path: "Both/ageofwar.html", platform: "both" },
  { title: "Bloons TD 2", path: "Both/bloonsTD2.html", platform: "both" },
  { title: "Breaking the Bank", path: "Both/breakingthebank.html", platform: "both" },
  { title: "Clash of Vikings", path: "Both/clashofvikings.html", platform: "both" },
  { title: "Flood Runner 4", path: "Both/floodrunner4.html", platform: "both" },
  { title: "Hanger 2", path: "Both/hanger2.html", platform: "both" },
  { title: "Learn to Fly Idle", path: "Both/learntoflyidle.html", platform: "both" },
  { title: "Papa's Cupcakeria", path: "Both/papascupcakeria.html", platform: "both" },
  { title: "Papa's Taco Mia", path: "Both/papastacomia.html", platform: "both" },
  { title: "Riddle School 3", path: "Both/riddleschool3.html", platform: "both" },
  { title: "State.io", path: "Both/stateio.html", platform: "both" },
  { title: "Trivia Crack", path: "Both/triviacrack.html", platform: "both" },
  { title: "Age of War 2", path: "Both/ageofwar2.html", platform: "both" },
  { title: "Bloons TD 3", path: "Both/bloonsTD3.html", platform: "both" },
  { title: "Bubble Shooter", path: "Both/bubbleshooter.html", platform: "both" },
  { title: "Connect the Pipes", path: "Both/Connect the Pipes.html", platform: "both" },
  { title: "Five Nights at Freddy’s", path: "Both/fnaf.html", platform: "both" },
  { title: "HTML Tower Defence", path: "Both/HTML Tower Defence.html", platform: "both" },
  { title: "Level Devil", path: "Both/leveldevil.html", platform: "both" },
  { title: "Papa's Donuteria", path: "Both/papasdonuteria.html", platform: "both" },
  { title: "Papa's Wingeria", path: "Both/papaswingeria.html", platform: "both" },
  { title: "Riddle School 4", path: "Both/riddleschool4.html", platform: "both" },
  { title: "Stick Fighter", path: "Both/stickfighter.html", platform: "both" },
  { title: "Wordle Unlimited", path: "Both/wordleunlimited.html", platform: "both" },
  { title: "Ages of Conflict", path: "Both/agesofconflict.html", platform: "both" },
  { title: "Bloons TD 4", path: "Both/bloonsTD4.html", platform: "both" },
  { title: "Candy Crush", path: "Both/candycrush.html", platform: "both" },
  { title: "Draw Climber", path: "Both/drawclimber.html", platform: "both" },
  { title: "Five Nights at Freddy’s 4", path: "Both/fnaf4.html", platform: "both" },
  { title: "Idle Breakout", path: "Both/idlebreakout.html", platform: "both" },
  { title: "Melon Playground", path: "Both/melonplayground.html", platform: "both" },
  { title: "Papa's Freezeria", path: "Both/papasfreezeria.html", platform: "both" },
  { title: "Plants vs. Zombies", path: "Both/plantsvszombies.html", platform: "both" },
  { title: "Run 3", path: "Both/run3.html", platform: "both" },
  { title: "Stickman Hook", path: "Both/stickmanhook.html", platform: "both" },
  { title: "World's Hardest Game 3", path: "Both/worldshardestgame3.html", platform: "both" },
  { title: "Angry Birds Space", path: "Both/angrybirdsspace.html", platform: "both" },
  { title: "Bloons TD 5", path: "Both/bloonsTD5.html", platform: "both" },
  { title: "Capybara Clicker", path: "Both/capybaraclicker.html", platform: "both" },
  { title: "Duck Life", path: "Both/ducklife.html", platform: "both" },
  { title: "Fruit Ninja", path: "Both/fruitninja.html", platform: "both" },
  { title: "Iron Snout", path: "Both/ironsnout.html", platform: "both" },
  { title: "Merge Round Racers", path: "Both/mergeroundracers.html", platform: "both" },
  { title: "Papa's Hot Doggeria", path: "Both/papashotdoggeria.html", platform: "both" },
  { title: "Plonky", path: "Both/plonky.html", platform: "both" },
  { title: "Spacebar Clicker", path: "Both/spacebarclicker.html", platform: "both" },
  { title: "Stick Merge", path: "Both/stickmerge.html", platform: "both" },
  { title: "Zombie Rush", path: "Both/zombierush.html", platform: "both" },
  { title: "Bad Piggies", path: "Both/badpiggies.html", platform: "both" },
  { title: "Blumgi Racers", path: "Both/blumgiracers.html", platform: "both" },
  { title: "Car Drawing", path: "Both/cardrawing.html", platform: "both" },
  { title: "Escaping the Prison", path: "Both/escapingtheprison.html", platform: "both" },
  { title: "Funny Battle", path: "Both/funnybattle.html", platform: "both" },
  { title: "Jetpack Joyride", path: "Both/jetpackjoyride.html", platform: "both" },
  { title: "Pac-Man", path: "Both/pacman.html", platform: "both" },
  { title: "Papa's Pancakeria", path: "Both/papaspancakeria.html", platform: "both" },
  { title: "Poor Bunny", path: "Both/poorbunny.html", platform: "both" },
  { title: "Space Waves", path: "Both/spacewaves.html", platform: "both" },
  { title: "Temple of Boom", path: "Both/templeofboom.html", platform: "both" },
  { title: "Blocky Snakes", path: "Both/blockysnakes.html", platform: "both" },
  { title: "Blumgi Rocket", path: "Both/blumgirocket.html", platform: "both" },
  { title: "Chess", path: "Both/chess.html", platform: "both" },
  { title: "Flappy Bird", path: "Both/flappybird.html", platform: "both" },
  { title: "Geometry Dash", path: "Both/geometrydash.html", platform: "both" },
  { title: "Johnny Trigger", path: "Both/johnnytrigger.html", platform: "both" },
  { title: "Papa's Burgeria", path: "Both/papasburgeria.html", platform: "both" },
  { title: "Papa's Pastaria", path: "Both/papaspastaria.html", platform: "both" },
  { title: "Riddle School", path: "Both/riddleschool.html", platform: "both" },
  { title: "Stack", path: "Both/stack.html", platform: "both" },
  { title: "Tiny Fishing", path: "Both/tinyfishing.html", platform: "both" },
  { title: "Chess Game", path: "Both/03-Chess-Game/index.html", platform: "both" },
  { title: "Solitaire Game", path: "Both/05-Solitaire-Game/index.html", platform: "both" },
  { title: "Sudoku Game", path: "Both/06-Sudoku-Game/index.html", platform: "both" },
  { title: "Wordle Game", path: "Both/11-Wordle-Game/index.html", platform: "both" },
  { title: "Hangman Game", path: "Both/12-Hangman-Game/index.html", platform: "both" },
  { title: "Archery Game", path: "Both/14-Archery-Game/index.html", platform: "both" },
  { title: "Tic-Tac-Toe", path: "Both/15-Tic-Tac-Toe/index.html", platform: "both" },
  { title: "Ping Pong Game", path: "Both/19-Ping-Pong-Game/index.html", platform: "both" },
  { title: "Rainbow Bottles", path: "Both/3d-rainbow-bottles.html", platform: "both" },
  { title: "Angry Birds", path: "Desktop/angrybirds.html", platform: "desktop" },
  { title: "Backrooms", path: "Desktop/backrooms.html", platform: "desktop" },
  { title: "Bacon May Die", path: "Desktop/baconmaydie.html", platform: "desktop" },
  { title: "Bad Ice-Cream", path: "Desktop/badicecream.html", platform: "desktop" },
  { title: "Bad Ice-Cream 2", path: "Desktop/badicecream2.html", platform: "desktop" },
  { title: "Bad Ice-Cream 3", path: "Desktop/badicecream3.html", platform: "desktop" },
  { title: "Bloxorz", path: "Desktop/bloxorz.html", platform: "desktop" },
  { title: "Bob the Robber", path: "Desktop/bobtherobber.html", platform: "desktop" },
  { title: "Bob the Robber 2", path: "Desktop/bobtherobber2.html", platform: "desktop" },
  { title: "Brick Breaker", path: "Desktop/brick-breaker.html", platform: "desktop" },
  { title: "Choppy Orc", path: "Desktop/choppyorc.html", platform: "desktop" },
  { title: "Cluster Rush", path: "Desktop/clusterrush.html", platform: "desktop" },
  { title: "Death Run 3D", path: "Desktop/deathrun3D.html", platform: "desktop" },
  { title: "Doodle Jump", path: "Desktop/doodlejump.html", platform: "desktop" },
  { title: "Duck Life 2", path: "Desktop/ducklife2.html", platform: "desktop" },
  { title: "Duck Life 3", path: "Desktop/ducklife3.html", platform: "desktop" },
  { title: "Duck Life 4", path: "Desktop/ducklife4.html", platform: "desktop" },
  { title: "Duck Life 5", path: "Desktop/ducklife5.html", platform: "desktop" },
  { title: "Eagle Ride", path: "Desktop/eagleride.html", platform: "desktop" },
  { title: "Evil Glitch", path: "Desktop/evilglitch.html", platform: "desktop" },
  { title: "Fancy Pants Adventure", path: "Desktop/fancypantsadventure.html", platform: "desktop" },
  { title: "Fancy Pants Adventure 2", path: "Desktop/fancypantsadventure2.html", platform: "desktop" },
  { title: "Flood Runner 2", path: "Desktop/floodrunner2.html", platform: "desktop" },
  { title: "Free Rider 3", path: "Desktop/freerider3.html", platform: "desktop" },
  { title: "House of Hazards", path: "Desktop/houseofhazards.html", platform: "desktop" },
  { title: "Hover Racer Drive", path: "Desktop/hoverracerdrive.html", platform: "desktop" },
  { title: "Learn to Fly", path: "Desktop/learntofly.html", platform: "desktop" },
  { title: "Learn to Fly 2", path: "Desktop/learntofly2.html", platform: "desktop" },
  { title: "Minesweeper", path: "Desktop/minesweeper.html", platform: "desktop" },
  { title: "Noob Miner", path: "Desktop/noobminer.html", platform: "desktop" },
  { title: "Opposite Day", path: "Desktop/oppositeday.html", platform: "desktop" },
  { title: "Pixel Speedrun", path: "Desktop/pixelspeedrun.html", platform: "desktop" },
  { title: "PolyTrack", path: "Desktop/polytrack.html", platform: "desktop" },
  { title: "Rooftop Snipers 2", path: "Desktop/rooftopsnipers2.html", platform: "desktop" },
  { title: "Run", path: "Desktop/run.html", platform: "desktop" },
  { title: "Run 2", path: "Desktop/run2.html", platform: "desktop" },
  { title: "Snowball.io", path: "Desktop/snowballio.html", platform: "desktop" },
  { title: "Space Is Key", path: "Desktop/spaceiskey.html", platform: "desktop" },
  { title: "Space Is Key 2", path: "Desktop/spaceiskey2.html", platform: "desktop" },
  { title: "Stick Archers Battle", path: "Desktop/stickarchersbattle.html", platform: "desktop" },
  { title: "Tag", path: "Desktop/tag.html", platform: "desktop" },
  { title: "Tetris", path: "Desktop/tetris.html", platform: "desktop" },
  { title: "Time Shooter 2", path: "Desktop/timeshooter2.html", platform: "desktop" },
  { title: "Tube Jumpers", path: "Desktop/tubejumpers.html", platform: "desktop" },
  { title: "Tunnel Rush", path: "Desktop/tunnelrush.html", platform: "desktop" },
  { title: "World's Hardest Game", path: "Desktop/worldshardestgame.html", platform: "desktop" },
  { title: "World's Hardest Game 2", path: "Desktop/worldshardestgame2.html", platform: "desktop" },
  ];

  const MULTIPLAYER_TITLES = new Set([
    "8 Ball Classic","Bad Ice-Cream","Bad Ice-Cream 2","Bad Ice-Cream 3","Chess","Chess Game",
    "Funny Battle","House of Hazards","Ping Pong Game","Rooftop Snipers 2","Stick Archers Battle",
    "Stick Fighter","Tag","Temple of Boom","Tic-Tac-Toe","Tube Jumpers"
  ]);

  const COZY_PATTERNS = [
    /papa's/i,/capybara/i,/tiny fishing/i,/candy crush/i,/solitaire/i,/sudoku/i,/rainbow bottles/i,
    /connect the pipes/i,/car drawing/i,/draw climber/i,/wordle/i,/trivia/i,/duck life/i,/doodle jump/i,
    /flappy bird/i,/stack$/i,/stacktris/i,/bubble shooter/i,/pac-man/i
  ];
  const SPOOKY_PATTERNS = [/five nights/i,/fnaf/i,/backrooms/i,/zombie/i,/evil glitch/i,/world's hardest/i,/worldshardest/i];
  const SILLY_PATTERNS = [/bad piggies/i,/poor bunny/i,/plonky/i,/bacon may die/i,/funny battle/i,/melon playground/i,/bob the robber/i,/breaking the bank/i,/escaping the prison/i,/trap the cat/i];
  const CHALLENGING_PATTERNS = [/world's hardest/i,/worldshardest/i,/level devil/i,/geometry dash/i,/space is key/i,/bloxorz/i,/circloo/i,/pixel speedrun/i,/tunnel rush/i,/run/i,/cluster rush/i,/stacktris/i];
  const FAST_PATTERNS = [/runner/i,/rush/i,/racer/i,/racing/i,/speed/i,/trigger/i,/shooter/i,/jetpack/i,/fruit ninja/i,/geometry dash/i,/hover racer/i,/eagle ride/i,/tube jumpers/i,/rooftop snipers/i,/stick fighter/i,/iron snout/i];

  function hasPattern(title, patterns){ return patterns.some(pattern => pattern.test(title)); }

  function classify(game){
    const title = game.title;
    const t = title.toLowerCase();
    const genres = new Set(["arcade"]);
    const vibes = new Set();
    const modes = new Set(["single"]);

    if(/fnaf|five nights|backrooms|evil glitch/.test(t)) genres.add("horror");
    if(/shooter|trigger|sniper|archer|archery|zombie rush|temple of boom|stick fighter/.test(t)) genres.add("shooter");
    if(/bloons|tower defence|tower defense|age of war|ages of conflict|state\.io|clash of vikings|plants vs|chess/.test(t)) genres.add("strategy");
    if(/papa's|miner|melon playground|duck life|learn to fly|rainbow bottles/.test(t)) genres.add("simulation");
    if(/idle|clicker|spacebar clicker/.test(t)) genres.add("idle");
    if(/wordle|riddle school|trivia|hangman/.test(t)) genres.add("word");
    if(/sudoku|solitaire|minesweeper|bloxorz|connect the pipes|candy crush|bubble shooter|trap the cat|stacktris|stack$|tetris|rainbow bottles|chess/.test(t)) genres.add("puzzle");
    if(/racer|racing|polytrack|free rider|hover racer|eagle ride|blumgi racers/.test(t)) genres.add("racing");
    if(/8 ball|baseball|fishing|ping pong|archery/.test(t)) genres.add("sports");
    if(/stick fighter|iron snout|bacon may die|choppy orc/.test(t)) genres.add("fighting");
    if(/fancy pants|run|flood runner|jumping shell|level devil|geometry dash|stickman hook|blumgi rocket|doodle jump|space is key|cluster rush|poor bunny|circloo|world's hardest|worldshardest|opposite day|pixel speedrun|plonky/.test(t)) genres.add("platformer");
    if(/bob the robber|breaking the bank|escaping the prison|riddle school|fancy pants|backrooms/.test(t)) genres.add("adventure");
    if(/angry birds|fruit ninja|jetpack|johnny trigger|zombie|stick fighter|iron snout|bad piggies|temple of boom|clash of vikings|funny battle/.test(t)) genres.add("action");

    if(hasPattern(title, COZY_PATTERNS)) vibes.add("cozy");
    if(hasPattern(title, SPOOKY_PATTERNS)) vibes.add("spooky");
    if(hasPattern(title, SILLY_PATTERNS)) vibes.add("silly");
    if(hasPattern(title, CHALLENGING_PATTERNS)) vibes.add("challenging");
    if(hasPattern(title, FAST_PATTERNS)) vibes.add("fast");

    if(MULTIPLAYER_TITLES.has(title)){
      modes.delete("single");
      modes.add("multiplayer");
    }

    return {...game, genres:[...genres], vibes:[...vibes], modes:[...modes]};
  }

  const catalog = GAMES.map(classify).sort((a,b) => a.title.localeCompare(b.title));

  const gameSearch = document.getElementById("gameSearch");
  const genreFilter = document.getElementById("genreFilter");
  const vibeFilter = document.getElementById("vibeFilter");
  const playerFilter = document.getElementById("playerFilter");
  const resetFiltersButton = document.getElementById("resetFiltersButton");
  const filterSummary = document.getElementById("filterSummary");
  const bothGameSelect = document.getElementById("bothGameSelect");
  const desktopGameSelect = document.getElementById("desktopGameSelect");
  const loadBothButton = document.getElementById("loadBothButton");
  const loadDesktopButton = document.getElementById("loadDesktopButton");
  const bothCount = document.getElementById("bothCount");
  const desktopCount = document.getElementById("desktopCount");

  const viewerShell = document.getElementById("viewerShell");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerStatus = document.getElementById("viewerStatus");
  const viewerEmpty = document.getElementById("viewerEmpty");
  const gameFrame = document.getElementById("gameFrame");
  const reloadGameButton = document.getElementById("reloadGameButton");
  const closeGameButton = document.getElementById("closeGameButton");
  const bot1Button = document.getElementById("bot1Button");
  const bot2Button = document.getElementById("bot2Button");
  const botsOffButton = document.getElementById("botsOffButton");
  const botStatus = document.getElementById("botStatus");
  const fullscreenDesktopButton = document.getElementById("fullscreenDesktopButton");
  const fullscreenMobileButton = document.getElementById("fullscreenMobileButton");

  let currentGame = null;
  let fullscreenMode = null;

  const normalize = value => String(value ?? "").trim().toLowerCase();

  function matchesFilters(game){
    const query = normalize(gameSearch.value);
    const terms = query.split(/\s+/).filter(Boolean);
    const haystack = normalize([game.title, game.path, ...game.genres, ...game.vibes, ...game.modes].join(" "));
    const queryMatch = terms.every(term => haystack.includes(term));
    const genreMatch = genreFilter.value === "all" || game.genres.includes(genreFilter.value);
    const vibeMatch = vibeFilter.value === "all" || game.vibes.includes(vibeFilter.value);
    const playerMatch = playerFilter.value === "all" || game.modes.includes(playerFilter.value);
    return queryMatch && genreMatch && vibeMatch && playerMatch;
  }

  function fillSelect(select, games, placeholder){
    const previous = select.value;
    select.replaceChildren();
    const first = document.createElement("option");
    first.value = "";
    first.textContent = games.length ? placeholder : "No games match these filters";
    select.appendChild(first);
    games.forEach(game => {
      const option = document.createElement("option");
      option.value = game.path;
      option.textContent = game.title;
      select.appendChild(option);
    });
    if(games.some(game => game.path === previous)) select.value = previous;
  }

  function updateCatalogMenus(){
    const filtered = catalog.filter(matchesFilters);
    const bothGames = filtered.filter(game => game.platform === "both");
    const desktopGames = filtered.filter(game => game.platform === "desktop");
    fillSelect(bothGameSelect, bothGames, "Select a Both game…");
    fillSelect(desktopGameSelect, desktopGames, "Select a Desktop game…");
    loadBothButton.disabled = !bothGames.length;
    loadDesktopButton.disabled = !desktopGames.length;
    bothCount.textContent = `${bothGames.length} game${bothGames.length === 1 ? "" : "s"}`;
    desktopCount.textContent = `${desktopGames.length} game${desktopGames.length === 1 ? "" : "s"}`;
    filterSummary.textContent = `${filtered.length} games • ${bothGames.length} Both • ${desktopGames.length} Desktop`; 
  }

  function findGame(path){ return catalog.find(game => game.path === path); }

  function gameBotsApi(){ return window.LifeHelpersGameBots || null; }

  function configureGameBots(){
    const api = gameBotsApi();
    if(!api?.configure) return;
    const backendUrl = window.LIFEHELPERS_GAMEBOTS_BACKEND_URL || GAMEBOTS_BACKEND_URL;
    api.configure({backendUrl, difficulty:"normal", strategyInterval:3500});
  }

  function updateBotControls(status){
    status = status || gameBotsApi()?.getStatus?.() || {available:[],maxBots:0};
    const b1 = status.available?.[0], b2 = status.available?.[1];
    bot1Button.disabled = !b1;
    bot2Button.disabled = !b2 || (status.maxBots||0) < 2;
    botsOffButton.disabled = !(b1 || b2);
    bot1Button.textContent = b1 ? `Bot 1: ${b1.enabled ? "On" : "Off"}` : "Bot 1";
    bot2Button.textContent = b2 ? `Bot 2: ${b2.enabled ? "On" : "Off"}` : "Bot 2";
    if(!currentGame){ botStatus.textContent = "Bots ready."; return; }
    if(!status.available?.length){ botStatus.textContent = "No bots for this game."; return; }
    const enabled=status.available.filter(b=>b.enabled).map(b=>b.name);
    botStatus.textContent = enabled.length ? `Active: ${enabled.join(", ")}` : `${status.available.length} bot${status.available.length===1?"":"s"} available.`;
  }

  async function attachGameBots(){
    const api=gameBotsApi();
    if(!api || !currentGame) return;
    await api.whenReady?.();
    configureGameBots();
    const status=api.attachToFrame?.(gameFrame,currentGame);
    updateBotControls(status);
  }

  function toggleBot(slot){
    const api=gameBotsApi(); if(!api)return;
    const status=api.getStatus?.(); const bot=status?.available?.[slot-1];
    if(!bot)return;
    if(bot.enabled) api.disableBot?.(slot); else api.enableBot?.(slot);
    updateBotControls(api.getStatus?.());
  }

  function loadSelected(select){
    const game = findGame(select.value);
    if(!game){
      viewerStatus.textContent = "Select a game from the dropdown first.";
      return;
    }
    loadGame(game);
  }

  function loadGame(game){
    currentGame = game;
    viewerTitle.textContent = game.title;
    viewerEmpty.classList.add("hidden");
    viewerStatus.textContent = `Loading ${game.title}…`;
    gameFrame.src = game.path;
    document.getElementById("arcade-viewer").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function closeGame(){
    gameBotsApi()?.detach?.();
    currentGame = null;
    gameFrame.removeAttribute("src");
    viewerTitle.textContent = "No game loaded";
    viewerEmpty.classList.remove("hidden");
    viewerStatus.textContent = "Ready.";
  }

  async function openFullscreen(mode){
    fullscreenMode = mode;
    viewerShell.classList.toggle("fullscreen-desktop", mode === "desktop");
    viewerShell.classList.toggle("fullscreen-mobile", mode === "mobile");
    viewerStatus.textContent = mode === "mobile" ? "Mobile fullscreen." : "Desktop fullscreen.";
    try{
      if(document.fullscreenElement && document.fullscreenElement !== viewerShell) await document.exitFullscreen();
      if(!document.fullscreenElement){
        if(viewerShell.requestFullscreen) await viewerShell.requestFullscreen();
        else viewerShell.classList.add("is-pseudo-fullscreen");
      }
    }catch(error){
      viewerShell.classList.add("is-pseudo-fullscreen");
      viewerStatus.textContent = `${mode === "mobile" ? "Mobile" : "Desktop"} expanded view.`;
      console.warn("Fullscreen request was rejected.", error);
    }
    updateFullscreenButtons();
  }

  function exitExpandedView(){
    viewerShell.classList.remove("is-pseudo-fullscreen","fullscreen-desktop","fullscreen-mobile");
    fullscreenMode = null;
    viewerStatus.textContent = currentGame ? currentGame.title : "Ready.";
    updateFullscreenButtons();
  }

  function updateFullscreenButtons(){
    const expanded = document.fullscreenElement === viewerShell || viewerShell.classList.contains("is-pseudo-fullscreen");
    fullscreenDesktopButton.textContent = expanded && fullscreenMode === "desktop" ? "Exit Desktop Fullscreen" : "Fullscreen Desktop";
    fullscreenMobileButton.textContent = expanded && fullscreenMode === "mobile" ? "Exit Mobile Fullscreen" : "Fullscreen Mobile";
  }

  async function toggleFullscreen(mode){
    const nativeActive = document.fullscreenElement === viewerShell;
    const pseudoActive = viewerShell.classList.contains("is-pseudo-fullscreen");
    if((nativeActive || pseudoActive) && fullscreenMode === mode){
      if(nativeActive){ try{ await document.exitFullscreen(); }catch(error){ console.warn(error); } }
      exitExpandedView();
      return;
    }
    await openFullscreen(mode);
  }

  gameSearch.addEventListener("input", updateCatalogMenus);
  genreFilter.addEventListener("change", updateCatalogMenus);
  vibeFilter.addEventListener("change", updateCatalogMenus);
  playerFilter.addEventListener("change", updateCatalogMenus);
  resetFiltersButton.addEventListener("click", () => {
    gameSearch.value = "";
    genreFilter.value = "all";
    vibeFilter.value = "all";
    playerFilter.value = "all";
    updateCatalogMenus();
    gameSearch.focus();
  });

  loadBothButton.addEventListener("click", () => loadSelected(bothGameSelect));
  loadDesktopButton.addEventListener("click", () => loadSelected(desktopGameSelect));
  bothGameSelect.addEventListener("keydown", event => { if(event.key === "Enter") loadSelected(bothGameSelect); });
  desktopGameSelect.addEventListener("keydown", event => { if(event.key === "Enter") loadSelected(desktopGameSelect); });

  gameFrame.addEventListener("load", () => {
    if(currentGame && gameFrame.getAttribute("src") !== "about:blank"){
      viewerStatus.textContent = `${currentGame.title} loaded.`;
      attachGameBots();
    }
  });
  reloadGameButton.addEventListener("click", () => {
    if(!currentGame){ viewerStatus.textContent = "No game loaded."; return; }
    const path = currentGame.path;
    gameFrame.src = "about:blank";
    requestAnimationFrame(() => { gameFrame.src = path; });
    viewerStatus.textContent = `Reloading ${currentGame.title}…`;
  });
  closeGameButton.addEventListener("click", closeGame);
  bot1Button.addEventListener("click", () => toggleBot(1));
  bot2Button.addEventListener("click", () => toggleBot(2));
  botsOffButton.addEventListener("click", () => { gameBotsApi()?.disableAll?.(); updateBotControls(gameBotsApi()?.getStatus?.()); });
  fullscreenDesktopButton.addEventListener("click", () => toggleFullscreen("desktop"));
  fullscreenMobileButton.addEventListener("click", () => toggleFullscreen("mobile"));

  document.addEventListener("fullscreenchange", () => {
    if(document.fullscreenElement !== viewerShell && !viewerShell.classList.contains("is-pseudo-fullscreen")){
      viewerShell.classList.remove("fullscreen-desktop","fullscreen-mobile");
      fullscreenMode = null;
      viewerStatus.textContent = currentGame ? currentGame.title : "Ready.";
    }
    updateFullscreenButtons();
  });
  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && viewerShell.classList.contains("is-pseudo-fullscreen")) exitExpandedView();
    if(event.key === "/" && !/input|select|textarea/i.test(document.activeElement?.tagName || "")){
      event.preventDefault();
      gameSearch.focus();
    }
  });

  window.addEventListener("lifehelpers-gamebots-ready", () => { configureGameBots(); updateBotControls(); });
  updateCatalogMenus();
  updateFullscreenButtons();
  updateBotControls();
})();
