/* OurSpace Module Designer v7 - plain DOM, scoped to one module. */
(()=>{'use strict';
const CONFIG={"id":"household","title":"Household","parts":[{"id":"headings","label":"Section headings","selectors":["h1","h2",".ms-card-head h1",".module-hd h2"],"fields":["text","font","size"],"kind":""},{"id":"subheadings","label":"Subheadings","selectors":["h3","h4",".ms-strip"],"fields":["text","font","size"],"kind":""},{"id":"body-copy","label":"Body copy","selectors":["p","li",".ms-card-body"],"fields":["text","font","size"],"kind":""},{"id":"actions","label":"Action buttons","selectors":["button",".ms-actions button"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"navigation","label":"Navigation tabs","selectors":["nav button","nav a",".jump-tab",".nav-button"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"fields","label":"Inputs and form controls","selectors":["input:not([type=hidden])","textarea","select"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"links","label":"Links","selectors":["a"],"fields":["text","font","size"],"kind":""},{"id":"cards","label":"Cards and panels","selectors":[".ms-card",".module",".panel",".section-card",".card",".ms-item"],"fields":["fill","border"],"kind":""},{"id":"labels","label":"Labels and captions","selectors":["label","small",".muted",".ms-tag"],"fields":["text","font","size"],"kind":""}]};
const CATALOG=[];
const MID=CONFIG.id;
const SCOPE=`[data-os-design-scope="${MID}"]`;
const ROOTS=()=>Array.from(document.querySelectorAll(SCOPE));
const rootValid=()=>ROOTS().length>0;
if(!rootValid()) { console.warn('Designer: module boundary was not found',MID); return; }
const prefix='osd-'+MID;
const ID=s=>`${prefix}-${s}`;
const html=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const colorOk=s=>/^#[0-9a-f]{6}$/i.test(s||'');
const FONT={"Default":"","Verdana":"Verdana,Arial,sans-serif","Arial":"Arial,Helvetica,sans-serif","Georgia":"Georgia,serif","Trebuchet":"'Trebuchet MS',Arial,sans-serif","Times":"'Times New Roman',serif","Courier":"'Courier New',monospace","Tahoma":"Tahoma,Arial,sans-serif"};
const profile=document.documentElement.dataset.ourspaceProfile||document.body.dataset.profile||document.documentElement.dataset.profile||'local';
const STORAGE=`ourspace.module-design.v7.${MID}.${profile}`;
const PARTS=CONFIG.parts;
const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
const COPY=o=>JSON.parse(JSON.stringify(o));
let saved={},working={},pending=false,category='',page=0,activeTab='parts',activePart=PARTS[0]?.id||'',filteredCache=[],lastChoice='';
try { const d=JSON.parse(localStorage.getItem(STORAGE)||'null'); if(d&&typeof d==='object'&&!Array.isArray(d)){saved=sanitize(d);} }catch(e){}
working=COPY(saved);

// User-supplied Wikimedia Commons direct-image and source/license links.
// Only the current category/page creates preview image elements.
const IMAGE_LIBRARY=[{"id":"image-001","category":"1. Aesthetics & Styles","interest":"Naturecore","name":"Misty forest and mountains","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Sri_Lanka%2C_mountains_and_cloud_forest.jpg","source":"https://commons.wikimedia.org/wiki/File:Sri_Lanka%2C_mountains_and_cloud_forest.jpg"},{"id":"image-002","category":"1. Aesthetics & Styles","interest":"Naturecore","name":"Fog-shrouded mountain forest","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Mount_Lushan_-_fog.JPG","source":"https://commons.wikimedia.org/wiki/File:Mount_Lushan_-_fog.JPG"},{"id":"image-003","category":"1. Aesthetics & Styles","interest":"Naturecore","name":"Cloud forest landscape","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ella_Valley%2C_Sri_Lanka%2C_Cloud_forest_on_the_slopes_in_clouds.jpg","source":"https://commons.wikimedia.org/wiki/File:Ella_Valley%2C_Sri_Lanka%2C_Cloud_forest_on_the_slopes_in_clouds.jpg"},{"id":"image-005","category":"1. Aesthetics & Styles","interest":"Witchcore","name":"Wiccan altar arrangement","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Wiccan_altar.png","source":"https://commons.wikimedia.org/wiki/File:Wiccan_altar.png"},{"id":"image-006","category":"1. Aesthetics & Styles","interest":"Goth","name":"Gothic cathedral architecture","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Salisbury_Cathedral_Nave%2C_Wiltshire%2C_UK_-_Diliff.jpg","source":"https://commons.wikimedia.org/wiki/File:Salisbury_Cathedral_Nave%2C_Wiltshire%2C_UK_-_Diliff.jpg"},{"id":"image-015","category":"1. Aesthetics & Styles","interest":"Sci-fi","name":"Futuristic spaceship corridor","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Spaceship_Corridor_%2815836048073%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Spaceship_Corridor_%2815836048073%29.jpg"},{"id":"image-022","category":"2. Colors & Color Preferences","interest":"Teal / turquoise","name":"Turquoise waterfall pool","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Kuang_Si_Falls_and_a_turquoise_water_pool_in_Luang_Prabang_province_Laos.jpg","source":"https://commons.wikimedia.org/wiki/File:Kuang_Si_Falls_and_a_turquoise_water_pool_in_Luang_Prabang_province_Laos.jpg"},{"id":"image-023","category":"2. Colors & Color Preferences","interest":"Teal / turquoise","name":"Turquoise water and submerged tree","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Kuang_Si_Falls_with_submerged_tree_in_turquoise_water_near_Luang_Prabang_Laos.jpg","source":"https://commons.wikimedia.org/wiki/File:Kuang_Si_Falls_with_submerged_tree_in_turquoise_water_near_Luang_Prabang_Laos.jpg"},{"id":"image-024","category":"2. Colors & Color Preferences","interest":"Limited purple","name":"Close-up of amethyst crystals","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Amethyst_crystals_close.jpg","source":"https://commons.wikimedia.org/wiki/File:Amethyst_crystals_close.jpg"},{"id":"image-026","category":"3. Themes & General Interests","interest":"Nature","name":"Forest waterfall, Virginia","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Waterfalls-forest-landscape_-_Virginia_-_ForestWander.jpg","source":"https://commons.wikimedia.org/wiki/File:Waterfalls-forest-landscape_-_Virginia_-_ForestWander.jpg"},{"id":"image-027","category":"3. Themes & General Interests","interest":"Nature","name":"Forest stream and waterfall","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Forest-Stream-Waterfall_ForestWander.JPG","source":"https://commons.wikimedia.org/wiki/File:Forest-Stream-Waterfall_ForestWander.JPG"},{"id":"image-030","category":"3. Themes & General Interests","interest":"Dinosaurs (especially T-Rex)","name":"T-Rex skeleton at Cleveland museum","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Tyrannosaurus_rex_skeleton_%28cast_of_specimen_MOR_555%29_at_Cleveland_Museum_of_Natural_History.jpg","source":"https://commons.wikimedia.org/wiki/File:Tyrannosaurus_rex_skeleton_%28cast_of_specimen_MOR_555%29_at_Cleveland_Museum_of_Natural_History.jpg"},{"id":"image-032","category":"3. Themes & General Interests","interest":"Magic and witchcraft","name":"Historical magical grimoire","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Grimoire_du_Pape_Honorius_%28allegedly_1760%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Grimoire_du_Pape_Honorius_%28allegedly_1760%29.jpg"},{"id":"image-033","category":"3. Themes & General Interests","interest":"Magic and witchcraft","name":"Magical sigil","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Sigil_of_the_spirit_Surgat.jpg","source":"https://commons.wikimedia.org/wiki/File:Sigil_of_the_spirit_Surgat.jpg"},{"id":"image-034","category":"3. Themes & General Interests","interest":"Supernatural","name":"1899 ghost double exposure","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Image_of_a_ghost%2C_produced_by_double_exposure_in_1899.jpg","source":"https://commons.wikimedia.org/wiki/File:Image_of_a_ghost%2C_produced_by_double_exposure_in_1899.jpg"},{"id":"image-035","category":"3. Themes & General Interests","interest":"Supernatural","name":"Canterville Ghost historical illustration","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Canterville_Ghost_illustration.jpg","source":"https://commons.wikimedia.org/wiki/File:The_Canterville_Ghost_illustration.jpg"},{"id":"image-036","category":"3. Themes & General Interests","interest":"Halloween","name":"Jack-o-lantern pumpkins","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Jack-o-lantern_pumpkins.jpg","source":"https://commons.wikimedia.org/wiki/File:Jack-o-lantern_pumpkins.jpg"},{"id":"image-037","category":"3. Themes & General Interests","interest":"Halloween","name":"Glowing jack-o-lantern","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Lit_Jack-o%27-lantern_glowing_menacingly.jpg","source":"https://commons.wikimedia.org/wiki/File:Lit_Jack-o%27-lantern_glowing_menacingly.jpg"},{"id":"image-038","category":"3. Themes & General Interests","interest":"Mythology","name":"Athena Greek goddess statue","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Athena_statue_at_the_Parthenon_replica_in_Tennessee.jpg","source":"https://commons.wikimedia.org/wiki/File:Athena_statue_at_the_Parthenon_replica_in_Tennessee.jpg"},{"id":"image-040","category":"3. Themes & General Interests","interest":"Greek history","name":"Ancient Eleusis ruins","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ancient_ruins_of_Eleusis_-_Greece%2C_2023.jpg","source":"https://commons.wikimedia.org/wiki/File:Ancient_ruins_of_Eleusis_-_Greece%2C_2023.jpg"},{"id":"image-041","category":"3. Themes & General Interests","interest":"Greek history","name":"Ancient Sparta archaeological ruins","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ancient_Sparta_ruins_%281%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Ancient_Sparta_ruins_%281%29.jpg"},{"id":"image-042","category":"3. Themes & General Interests","interest":"Galaxies and outer space","name":"Andromeda Galaxy","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Andromeda_Galaxy_M31_-_Heic1502a_Full_resolution.jpg","source":"https://commons.wikimedia.org/wiki/File:Andromeda_Galaxy_M31_-_Heic1502a_Full_resolution.jpg"},{"id":"image-043","category":"3. Themes & General Interests","interest":"Galaxies and outer space","name":"Andromeda Galaxy in Hubble image","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Andromeda_galaxy.jpg","source":"https://commons.wikimedia.org/wiki/File:Andromeda_galaxy.jpg"},{"id":"image-044","category":"3. Themes & General Interests","interest":"Galaxies and outer space","name":"Andromeda infrared galaxy","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Andromeda_galaxy_Ssc2005-20a1.jpg","source":"https://commons.wikimedia.org/wiki/File:Andromeda_galaxy_Ssc2005-20a1.jpg"},{"id":"image-045","category":"3. Themes & General Interests","interest":"Stars and constellations","name":"Orion constellation star field","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Orion_Head_to_Toe.jpg","source":"https://commons.wikimedia.org/wiki/File:Orion_Head_to_Toe.jpg"},{"id":"image-047","category":"3. Themes & General Interests","interest":"Gemstones and crystals","name":"Quartz crystals from Tibet","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Quartz%2C_Tibet.jpg","source":"https://commons.wikimedia.org/wiki/File:Quartz%2C_Tibet.jpg"},{"id":"image-048","category":"3. Themes & General Interests","interest":"Gemstones and crystals","name":"Quartz-filled geode","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Geode-with-encrustation-of-quartz-crystals-on-a-base-of-limonite-01.jpg","source":"https://commons.wikimedia.org/wiki/File:Geode-with-encrustation-of-quartz-crystals-on-a-base-of-limonite-01.jpg"},{"id":"image-049","category":"3. Themes & General Interests","interest":"Tarot","name":"Rider-Waite Major Arcana","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Rider-Waite_Major_Arcana_full.png","source":"https://commons.wikimedia.org/wiki/File:Rider-Waite_Major_Arcana_full.png"},{"id":"image-050","category":"3. Themes & General Interests","interest":"Tarot","name":"The Moon tarot card","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/The_Moon%2C_Waite-Smith_Tarot_Deck%2C_Yale_University.jpg","source":"https://commons.wikimedia.org/wiki/File:The_Moon%2C_Waite-Smith_Tarot_Deck%2C_Yale_University.jpg"},{"id":"image-053","category":"3. Themes & General Interests","interest":"Dungeons & Dragons","name":"Black polyhedral roleplaying dice","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Black_Polyhedral_Game_Dice.jpg","source":"https://commons.wikimedia.org/wiki/File:Black_Polyhedral_Game_Dice.jpg"},{"id":"image-054","category":"3. Themes & General Interests","interest":"Dungeons & Dragons","name":"Roleplaying dice set","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Dados_de_juegos_de_rol.jpg","source":"https://commons.wikimedia.org/wiki/File:Dados_de_juegos_de_rol.jpg"},{"id":"image-056","category":"3. Themes & General Interests","interest":"Lo-fi","name":"Turntable playing vinyl record","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Audio-Technica_turntable_playing_coloured_vinyl.jpg","source":"https://commons.wikimedia.org/wiki/File:Audio-Technica_turntable_playing_coloured_vinyl.jpg"},{"id":"image-057","category":"3. Themes & General Interests","interest":"Puns and wordplay","name":"Visual pun public artwork","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Woolloomooloo-visual-pun-Cathedral-Street.jpg","source":"https://commons.wikimedia.org/wiki/File:Woolloomooloo-visual-pun-Cathedral-Street.jpg"},{"id":"image-058","category":"3. Themes & General Interests","interest":"Puns and wordplay","name":"Pun gent wordplay license plate","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/New_York_Pun_gent_license_plate.jpg","source":"https://commons.wikimedia.org/wiki/File:New_York_Pun_gent_license_plate.jpg"},{"id":"image-062","category":"4. Music","interest":"Three Days Grace","name":"Three Days Grace at Rock am Ring 2023","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Three_Days_Grace_-_2023155162203_2023-06-04_Rock_am_Ring_-_Sven_-_5DS_R_-_0057_-_5DSR4006.jpg","source":"https://commons.wikimedia.org/wiki/File:Three_Days_Grace_-_2023155162203_2023-06-04_Rock_am_Ring_-_Sven_-_5DS_R_-_0057_-_5DSR4006.jpg"},{"id":"image-063","category":"4. Music","interest":"Three Days Grace","name":"Three Days Grace at Alpen Flair 2023","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Three_Days_Grace_-_2023173202017_2023-06-22_Alpen_Flair_-_Sven_-_5DS_R_-_0331_-_5DSR4793.jpg","source":"https://commons.wikimedia.org/wiki/File:Three_Days_Grace_-_2023173202017_2023-06-22_Alpen_Flair_-_Sven_-_5DS_R_-_0331_-_5DSR4793.jpg"},{"id":"image-064","category":"4. Music","interest":"Breaking Benjamin","name":"Breaking Benjamin live in 2015","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Breaking_Benjamin_Rotr_2015_%28109542445%29.jpeg","source":"https://commons.wikimedia.org/wiki/File:Breaking_Benjamin_Rotr_2015_%28109542445%29.jpeg"},{"id":"image-065","category":"4. Music","interest":"Breaking Benjamin","name":"Breaking Benjamin at Louder Than Life 2019","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Breaking_Benjamin_Louder_Than_Life_Louisville_2019-09-29.jpg","source":"https://commons.wikimedia.org/wiki/File:Breaking_Benjamin_Louder_Than_Life_Louisville_2019-09-29.jpg"},{"id":"image-066","category":"4. Music","interest":"Evanescence","name":"Evanescence at Rock am Ring 2023","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Evanescence_-_Rock_am_Ring_2023-7536.jpg","source":"https://commons.wikimedia.org/wiki/File:Evanescence_-_Rock_am_Ring_2023-7536.jpg"},{"id":"image-067","category":"4. Music","interest":"Evanescence","name":"Evanescence live in London","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Evanescence_live_at_the_O2_Dome_London_141122_-_52508238783.jpg","source":"https://commons.wikimedia.org/wiki/File:Evanescence_live_at_the_O2_Dome_London_141122_-_52508238783.jpg"},{"id":"image-068","category":"4. Music","interest":"Fall Out Boy","name":"Fall Out Boy at Hella Mega Tour","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Fall_Out_Boy_Hella_Mega_Tour_Denver_2021.jpg","source":"https://commons.wikimedia.org/wiki/File:Fall_Out_Boy_Hella_Mega_Tour_Denver_2021.jpg"},{"id":"image-069","category":"4. Music","interest":"Fall Out Boy","name":"Fall Out Boy performing","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Fall_Out_Boy_in_concert.jpg","source":"https://commons.wikimedia.org/wiki/File:Fall_Out_Boy_in_concert.jpg"},{"id":"image-070","category":"4. Music","interest":"Aerosmith","name":"Aerosmith band photograph","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Aerosmith.jpg","source":"https://commons.wikimedia.org/wiki/File:Aerosmith.jpg"},{"id":"image-071","category":"4. Music","interest":"Aerosmith","name":"Aerosmith concert 2014","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Aerosmith_July_16_2014.jpg","source":"https://commons.wikimedia.org/wiki/File:Aerosmith_July_16_2014.jpg"},{"id":"image-072","category":"4. Music","interest":"AC/DC","name":"AC/DC London concert 2016","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/ACDC_concert_in_London_2016-1.jpg","source":"https://commons.wikimedia.org/wiki/File:ACDC_concert_in_London_2016-1.jpg"},{"id":"image-073","category":"4. Music","interest":"AC/DC","name":"AC/DC at Metropolitano stadium","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/ACDC_Concert_at_Estadio_Metropolitano.jpg","source":"https://commons.wikimedia.org/wiki/File:ACDC_Concert_at_Estadio_Metropolitano.jpg"},{"id":"image-074","category":"4. Music","interest":"Nirvana","name":"Nirvana group photo c. 1992","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Nirvana_around_1992.jpg","source":"https://commons.wikimedia.org/wiki/File:Nirvana_around_1992.jpg"},{"id":"image-075","category":"4. Music","interest":"Nirvana","name":"Nirvana group photo alternate crop","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Nirvana_around_1992_%28cropped%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Nirvana_around_1992_%28cropped%29.jpg"},{"id":"image-076","category":"4. Music","interest":"Bullet for My Valentine","name":"Bullet for My Valentine live at Full Force 2022","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Bullet_for_My_Valentine_Full_Force_2022_17.jpg","source":"https://commons.wikimedia.org/wiki/File:Bullet_for_My_Valentine_Full_Force_2022_17.jpg"},{"id":"image-077","category":"4. Music","interest":"Bullet for My Valentine","name":"Bullet for My Valentine Ursynalia concert","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ursynalia_2013%2C_Bullet_For_My_Valentine_C06.jpg","source":"https://commons.wikimedia.org/wiki/File:Ursynalia_2013%2C_Bullet_For_My_Valentine_C06.jpg"},{"id":"image-078","category":"4. Music","interest":"Sleep Token","name":"Sleep Token at Wembley Arena","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Sleep_Token%2C_Wembley_Arena%2C_London.jpg","source":"https://commons.wikimedia.org/wiki/File:Sleep_Token%2C_Wembley_Arena%2C_London.jpg"},{"id":"image-079","category":"4. Music","interest":"Sleep Token","name":"Sleep Token at Bloodstock 2022","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Sleep_Token_Bloodstock_2022.jpg","source":"https://commons.wikimedia.org/wiki/File:Sleep_Token_Bloodstock_2022.jpg"},{"id":"image-088","category":"5. Movies & Television","interest":"Supernatural (TV)","name":"Supernatural TV series wordmark","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Supernatural_%28Warner_Bros._Television%29_logo.svg","source":"https://commons.wikimedia.org/wiki/File:Supernatural_%28Warner_Bros._Television%29_logo.svg"},{"id":"image-090","category":"5. Movies & Television","interest":"Warehouse 13","name":"Warehouse 13 actors Saul Rubinek and Eddie McClintock","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Saul_Rubinek_%26_Eddie_McClintock.jpg","source":"https://commons.wikimedia.org/wiki/File:Saul_Rubinek_%26_Eddie_McClintock.jpg"},{"id":"image-091","category":"5. Movies & Television","interest":"Warehouse 13","name":"Warehouse 13 cast member Allison Scagliotti at Comic-Con","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Allison_Scagliotti_-_Comic-Con_2010_%28cropped%29.jpg","source":"https://commons.wikimedia.org/wiki/File:Allison_Scagliotti_-_Comic-Con_2010_%28cropped%29.jpg"},{"id":"image-092","category":"5. Movies & Television","interest":"Charmed (1998 original)","name":"Original Charmed triquetra symbol","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Charmed_%281998%29_triquetra.svg","source":"https://commons.wikimedia.org/wiki/File:Charmed_%281998%29_triquetra.svg"},{"id":"image-096","category":"5. Movies & Television","interest":"Teen Wolf","name":"Teen Wolf 2011 TV series logo","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Teen_Wolf_%282011_TV_series%29_logo.svg","source":"https://commons.wikimedia.org/wiki/File:Teen_Wolf_%282011_TV_series%29_logo.svg"},{"id":"image-104","category":"5. Movies & Television","interest":"Disney","name":"Disney Cinderella Castle","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Cinderella_Castle_January_2021_Portrait.jpg","source":"https://commons.wikimedia.org/wiki/File:Cinderella_Castle_January_2021_Portrait.jpg"},{"id":"image-105","category":"5. Movies & Television","interest":"Disney","name":"Shanghai Disneyland Enchanted Storybook Castle","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Enchanted_Storybook_Castle_on_the_opening_day_of_Shanghai_Disneyland_Park.jpg","source":"https://commons.wikimedia.org/wiki/File:Enchanted_Storybook_Castle_on_the_opening_day_of_Shanghai_Disneyland_Park.jpg"},{"id":"image-112","category":"6. Video Games","interest":"Minecraft","name":"Minecraft Beta gameplay screenshot","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Minecraft_Beta_1.8.1_Gameplay_Screenshot.png","source":"https://commons.wikimedia.org/wiki/File:Minecraft_Beta_1.8.1_Gameplay_Screenshot.png"},{"id":"image-113","category":"6. Video Games","interest":"Minecraft","name":"Minecraft The End screenshot","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Screenshot_from_the_Minecraft_End.png","source":"https://commons.wikimedia.org/wiki/File:Screenshot_from_the_Minecraft_End.png"},{"id":"image-118","category":"6. Video Games","interest":"Call of Duty","name":"Call of Duty Modern Warfare II Ghost art","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Modern_Warfare_II_%282022%29_-_Ghost.jpg","source":"https://commons.wikimedia.org/wiki/File:Modern_Warfare_II_%282022%29_-_Ghost.jpg"},{"id":"image-119","category":"6. Video Games","interest":"Call of Duty","name":"Call of Duty MWII image","image":"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Call_Of_Duty_MWII.jpg","source":"https://commons.wikimedia.org/wiki/File:Call_Of_Duty_MWII.jpg"}];
let imageSaved=null,imageWorking=null,imageCategory='',imageInterest='',imagePage=0;
const IMAGE_STORAGE=STORAGE+'.image.v1';
const IMAGE_BATCH=8;
const IMAGE_SELECTORS={
 record_player:[{id:'display',label:'Now-playing display (not the cabinet)',selector:'.display-panel'},{id:'label',label:'Record center artwork',selector:'.record-label'}],
 profile_record_player:[{id:'display',label:'Now-playing display (not the cabinet)',selector:'.display-panel'},{id:'label',label:'Record center artwork',selector:'.record-label'}],
 bulletin_board:[{id:'board',label:'Board surface (notes remain unchanged)',selector:'.board-surface'},{id:'householdSidebar',label:'Board library panel',selector:'.sidebar'}],complete_profile:[{id:'profile',label:'Profile content area',selector:'.ms-profile,.profile-shell,.profile-card,.page-frame'}],
 household:[{id:'workspace',label:'Household workspace (not navigation)',selector:'main.app'}],
 portal_sign_in:[{id:'portal',label:'Sign-in portal content (not navigation)',selector:'.shell'}],
};
function findImageSurface(t){
 const roots=ROOTS();if(!roots.length)return null;
 if(!t||t.selector===':scope')return roots[0];
 for(const root of roots){const direct=root.matches(t.selector)?root:root.querySelector(t.selector);if(direct && (direct===root || root.contains(direct)))return direct;}
 return null;
}
function availableImageSurfaces(){
 const defs=IMAGE_SELECTORS[MID]||[{id:'module',label:'Background inside this module',selector:':scope'},{id:'panel',label:'Main panel background',selector:'.module-body,.panel-body,.ms-card-body,.content-body,.profile-card,.section-body,.card-body,.main-area,.module,.card,.gallery'}];
 const available=defs.filter(t=>findImageSurface(t));
 return available.length?available:[{id:'module',label:'Background inside this module',selector:':scope'}];
}
function sanitizeImage(v){
 if(!v||typeof v!=='object'||!IMAGE_LIBRARY.some(x=>x.id===v.id))return null;
 const surfaces=availableImageSurfaces();
 const target=surfaces.some(t=>t.id===v.target)?v.target:surfaces[0].id;
 return {id:v.id,target,strength:Math.min(80,Math.max(15,Math.round(Number(v.strength)||45)))};
}
try{
 const previousRaw=localStorage.getItem(IMAGE_STORAGE);
 if(previousRaw){
  const previousSelection=JSON.parse(previousRaw);
  imageSaved=sanitizeImage(previousSelection);
  if(!imageSaved)localStorage.removeItem(IMAGE_STORAGE); // purge previously kept removed image IDs
 }
}catch(_){imageSaved=null;}
imageWorking=imageSaved?COPY(imageSaved):null;
function imageIsPending(){return JSON.stringify(imageSaved)!==JSON.stringify(imageWorking);}
const imageInlineOriginals=new Map();
function imageCss(){
 // Restore the exact original inline declarations before each preview. Avoid stacking CSS overrides.
 for(const [node,prior] of imageInlineOriginals){
  if(prior.value)node.style.setProperty('background-image',prior.value,prior.priority);
  else node.style.removeProperty('background-image');
  node.removeAttribute('data-osd-image-surface');
 }
 imageInlineOriginals.clear();
 if(!imageWorking)return '';
 const entry=IMAGE_LIBRARY.find(x=>x.id===imageWorking.id);
 const surface=availableImageSurfaces().find(t=>t.id===imageWorking.target);
 const node=surface&&findImageSurface(surface);
 if(!entry||!node)return '';
 const col=getComputedStyle(node).color;
 const c=(col.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
 const luminance=c.length===3?(c[0]*.2126+c[1]*.7152+c[2]*.0722):0;
 const layer=luminance>165?'15,23,38':'255,255,255';
 const alpha=(1-imageWorking.strength/100).toFixed(2);
 const bg=`linear-gradient(rgba(${layer},${alpha}),rgba(${layer},${alpha})),url(${JSON.stringify(entry.image)})`;
 imageInlineOriginals.set(node,{value:node.style.getPropertyValue('background-image'),priority:node.style.getPropertyPriority('background-image')});
 node.setAttribute('data-osd-image-surface',MID);
 node.style.setProperty('background-image',bg,'important');
 return '';
}

function renderImages(){
 if(!control)return;
 const el=control.querySelector('[data-osd-images]');if(!el)return;
 const names=CATNAMES;
 const rows=IMAGE_LIBRARY.filter(x=>x.category===imageCategory);
 const interests=[...new Set(rows.map(x=>x.interest))];
 if(imageInterest&&!interests.includes(imageInterest))imageInterest='';
 const selectedInterest=imageInterest?rows.filter(x=>x.interest===imageInterest):rows;
 const pages=Math.max(1,Math.ceil(selectedInterest.length/IMAGE_BATCH));
 imagePage=Math.max(0,Math.min(imagePage,pages-1));
 const items=imageCategory?selectedInterest.slice(imagePage*IMAGE_BATCH,(imagePage+1)*IMAGE_BATCH):[];
 const surfaces=availableImageSurfaces();
 const currentTarget=imageWorking?.target||imageSaved?.target||surfaces[0].id;
 const strength=imageWorking?.strength||imageSaved?.strength||45;
 el.innerHTML=`
 <label class="osd-field"><span>1. Image category</span><select data-role="image-category"><option value="">Select category…</option>${names.map(cat=>`<option value="${html(cat)}" ${cat===imageCategory?'selected':''}>${html(cat)} (${IMAGE_LIBRARY.filter(x=>x.category===cat).length})</option>`).join('')}</select></label>
 ${imageCategory?`<label class="osd-field"><span>2. Interest or fandom</span><select data-role="image-interest"><option value="">All interests (${rows.length})</option>${interests.map(cat=>`<option value="${html(cat)}" ${cat===imageInterest?'selected':''}>${html(cat)} (${rows.filter(x=>x.interest===cat).length})</option>`).join('')}</select></label>`:''}
 <label class="osd-field"><span>3. Background area within ${html(CONFIG.title)}</span><select data-role="image-target">${surfaces.map(t=>`<option value="${html(t.id)}" ${t.id===currentTarget?'selected':''}>${html(t.label)}</option>`).join('')}</select></label>
 <label class="osd-field"><span>Image strength <output data-osd-image-strength-value>${strength}%</output></span><input type="range" data-role="image-strength" min="15" max="80" step="5" value="${strength}" aria-label="Image strength"></label>
 <p class="osd-help">Images change only the selected module area. Original records, needles, scrapbook notes, and mood artwork are not replaced. Select an image to preview; use Keep or Undo below.</p>
 ${!imageCategory?'<p class="osd-help">Choose one of the six categories. Image previews are loaded eight at a time.</p>':`<p class="osd-help">${selectedInterest.length} image links · Page ${imagePage+1} of ${pages}</p><div class="osd-image-grid">${items.map(item=>`<div class="osd-image-card" ${imageWorking?.id===item.id?'data-selected="true"':''}><button type="button" class="osd-image-choice" data-osd-image="${item.id}" aria-label="Preview ${html(item.name)}" aria-pressed="${imageWorking?.id===item.id}"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${html(item.image)}" alt="${html(item.name)}"><span class="osd-image-fallback">Image preview unavailable</span><strong>${html(item.name)}</strong><small>${html(item.interest)}</small></button><a class="osd-image-credit" href="${html(item.source)}" rel="noopener noreferrer" target="_blank" title="View image license, attribution, and source">File &amp; license</a></div>`).join('')}</div><div class="osd-page-actions"><button type="button" class="osd-secondary" data-osd-action="image-prev" ${imagePage===0?'disabled':''}>Previous</button><span>${imagePage+1} / ${pages}</span><button type="button" class="osd-secondary" data-osd-action="image-next" ${imagePage===pages-1?'disabled':''}>Next</button></div>`}
 <div class="osd-page-actions"><button type="button" class="osd-secondary" data-osd-action="image-clear" ${!imageWorking?'disabled':''}>Remove background (preview)</button></div>
 <p class="osd-help">Wikimedia Commons source links are preserved for credits and license conditions. Remote previews may be unavailable offline or if Commons changes a file. Fandom photos do not automatically clear third-party character or trademark rights.</p>`;
}
function chooseImage(id){
 const item=IMAGE_LIBRARY.find(i=>i.id===id);if(!item)return;
 // A new selection is always compared with the last saved/kept image.
 working=COPY(saved);
 const surfaces=availableImageSurfaces();
 const target=control.querySelector('[data-role="image-target"]')?.value||imageWorking?.target||imageSaved?.target||surfaces[0].id;
 const strength=Number(control.querySelector('[data-role="image-strength"]')?.value)||45;
 imageWorking=sanitizeImage({id,target,strength});
 lastChoice='Image: '+item.name;
 markPreview(`Previewing ${item.name} inside ${CONFIG.title}. Keep or Undo.`);
 renderImages();
}
function changeImageSetting(key,val){
 if(!imageWorking)return;
 if(key==='target')imageWorking=sanitizeImage({...imageWorking,target:val});
 if(key==='strength')imageWorking=sanitizeImage({...imageWorking,strength:Number(val)});
 lastChoice='Image: '+(IMAGE_LIBRARY.find(x=>x.id===imageWorking?.id)?.name||'background');
 markPreview('Image background preview updated. Keep or Undo.');
 if(key==='target')renderImages();
 else {const out=control.querySelector('[data-osd-image-strength-value]');if(out)out.textContent=imageWorking.strength+'%';}
}

function sanitize(raw){const v={};for(const part of PARTS){const entry=raw[part.id];if(!entry||typeof entry!=='object')continue;const values={};for(const k of part.fields){const x=entry[k];if(k==='font'&&Object.prototype.hasOwnProperty.call(FONT,x||''))values[k]=x;
else if(k==='size'&&Number.isFinite(Number(x)))values[k]=Math.max(10,Math.min(30,Math.round(Number(x))));
else if(['text','fill','border','color'].includes(k)&&colorOk(x))values[k]=String(x).toUpperCase();}
if(Object.keys(values).length)v[part.id]=values;}return v;}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(saved));return true;}catch(e){return false;}}
function status(s,err=false){const e=document.getElementById(ID('status'));if(e){e.textContent=s;e.dataset.error=String(Boolean(err));}}
function hexColor(x){return colorOk(x)?x:'#466682'}
function rgb(x){return [1,3,5].map(i=>parseInt(hexColor(x).slice(i,i+2),16));}
function scale(x,amt){const a=rgb(x);return '#'+a.map(v=>Math.min(255,Math.max(0,Math.round(v+(amt>0?(255-v)*amt:v*amt)))).toString(16).padStart(2,'0')).join('');}
function contrast(x){const y=rgb(x).map(v=>{v=v/255;return v<.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*y[0]+.7152*y[1]+.0722*y[2] >.18?'#162435':'#FFFFFF';}
function cssFor(part, vals){if(!vals)return '';
 if(part.kind==='wave')return colorOk(vals.color)?`${SCOPE}{${part.wave}:${vals.color}!important}`:'';
 const sels=part.selectors.map(s=>s===':scope'?SCOPE:ROOTS().length&&part.self?`${SCOPE}${s}`:`${SCOPE} ${s}`);
 const selectors=sels.join(', ');
 if(!selectors)return '';
 const out=[];
 const props=[];
 if(colorOk(vals.text))props.push(`color:${vals.text}!important`);
 if(colorOk(vals.border))props.push(`border-color:${vals.border}!important`);
 if(vals.font&&FONT[vals.font])props.push(`font-family:${FONT[vals.font]}!important`);
 if(vals.size)props.push(`font-size:${vals.size}px!important`);
 if(colorOk(vals.color)){
 const c=vals.color;
 if(part.kind==='wood')props.push(`background:repeating-linear-gradient(102deg,rgba(0,0,0,.10) 0 1px,transparent 1px 13px),linear-gradient(112deg,${scale(c,-.48)},${scale(c,.22)} 30%,${c} 53%,${scale(c,.34)} 76%,${scale(c,-.5)})!important`);
 if(part.kind==='vinyl')props.push(`background:repeating-radial-gradient(circle,${scale(c,-.40)} 0 2px,${scale(c,.1)} 4px 6px,${scale(c,-.53)} 7px 10px)!important`);
 if(part.kind==='label')props.push(`background:radial-gradient(circle at 36% 28%,rgba(255,255,255,.32) 0 19%,transparent 32%),radial-gradient(circle,${scale(c,.20)} 0 60%,${scale(c,-.23)} 62%)!important`);
 if(part.kind==='metal')props.push(`background:linear-gradient(90deg,${scale(c,-.60)},${scale(c,.47)} 38%,${c} 70%,${scale(c,-.50)})!important`);
 if(part.kind==='needle')props.push(`background:${c}!important`);
 if(part.kind==='brass')props.push(`background:radial-gradient(circle at 30% 28%,${scale(c,.52)},${c} 45%,${scale(c,-.5)} 90%)!important`);
 }
 if(colorOk(vals.fill)){
  if(part.kind==='transport')props.push(`background:linear-gradient(145deg,${scale(vals.fill,.18)},${scale(vals.fill,-.18)})!important`);
  else props.push(`background:${vals.fill}!important`);
 }
 if(props.length)out.push(`${selectors}{${props.join(';')};}`);
 return out.join('\n');
}
const styleTag=document.createElement('style');styleTag.id=ID('scoped-css');styleTag.dataset.moduleDesignerStyle=MID;document.head.append(styleTag);
function paint(){styleTag.textContent=[...PARTS.map(p=>cssFor(p,working[p.id])).filter(Boolean),imageCss()].filter(Boolean).join('\n');}
function markPreview(note){pending=JSON.stringify(saved)!==JSON.stringify(working)||imageIsPending();const actions=document.getElementById(ID('decision'));
 if(actions)actions.hidden=!pending;
 const caption=document.getElementById(ID('preview-label'));
 if(caption)caption.textContent=lastChoice?`Previewing ${lastChoice} on this module only`:pending?'Unsaved changes on this module':'No pending changes';
 const source=control?.querySelector('[data-osd-source-link]');const preset=CATALOG.find(x=>x.title===lastChoice);if(source){source.hidden=!preset;if(preset){source.href=preset.source;source.textContent='View original archive layout';}}
 if(note)status(note);paint();}
function restore(){working=COPY(saved);imageWorking=imageSaved?COPY(imageSaved):null;lastChoice='';markPreview('Preview undone. Previously kept design and image restored.');renderControls();renderImages();}
function keep(){saved=sanitize(working);imageSaved=imageWorking?COPY(imageWorking):null;const stored=persist();let imageStored=false;try{if(imageSaved)localStorage.setItem(IMAGE_STORAGE,JSON.stringify(imageSaved));else localStorage.removeItem(IMAGE_STORAGE);imageStored=true;}catch(_){}lastChoice='';markPreview(stored&&imageStored?'Design and image kept for this module.':'Kept in this session; browser storage may be blocked.');renderControls();renderImages();}
function selectedPart(){return PART_BY_ID[activePart]||PARTS[0];}
function fieldBlock(part,key,vals){const val=vals[key]||'';
 if(['text','fill','border','color'].includes(key))return `<label class="osd-field"><span>${html({text:'Text color',fill:'Fill / surface color',border:'Border color',color:part.colorLabel||'Material color'}[key])}</span><input type="color" data-field="${key}" value="${val||'#6699CC'}" aria-label="${html(part.label)}: ${key}"></label>`;
 if(key==='font')return `<label class="osd-field"><span>Font family</span><select data-field="font">${Object.keys(FONT).map(k=>`<option value="${html(k)}" ${k===(val||'Default')?'selected':''}>${html(k)}</option>`).join('')}</select></label>`;
 if(key==='size')return `<label class="osd-field"><span>Font size <output data-size-output="">${val||16}px</output></span><input type="range" data-field="size" min="10" max="30" step="1" value="${val||16}"></label>`;return '';
}
let control=null,suppressToggle=false;
function renderControls(){if(!control)return;
 const part=selectedPart();if(!part)return;
 const el=control.querySelector('[data-osd-controls]');
 const val=working[part.id]||{};
 el.innerHTML=`<label class="osd-field"><span>Part of ${html(CONFIG.title)}</span><select data-role="parts">${PARTS.map(p=>`<option value="${p.id}" ${p.id===part.id?'selected':''}>${html(p.label)}</option>`).join('')}</select></label><div class="osd-fields">${part.fields.map(f=>fieldBlock(part,f,val)).join('')}</div><p class="osd-help">Changes preview on the ${html(part.label.toLowerCase())} only. No website background or other modules are affected.</p><button type="button" class="osd-secondary" data-osd-action="reset-part">Reset this part</button>`;
}
const CATNAMES=['1. Aesthetics & Styles','2. Colors & Color Preferences','3. Themes & General Interests','4. Music','5. Movies & Television','6. Video Games'];
const PAGELEN=8;
function renderGallery(){if(!control)return;const box=control.querySelector('[data-osd-presets]');if(!box)return;
 if(!category){box.innerHTML='<p class="osd-help">Choose one category to browse. No 100-item gallery is loaded at once.</p>';return;}
 filteredCache=CATALOG.filter(x=>x.group===category);const pages=Math.max(1,Math.ceil(filteredCache.length/PAGELEN));page=Math.max(0,Math.min(page,pages-1));const batch=filteredCache.slice(page*PAGELEN,(page+1)*PAGELEN);
 box.innerHTML=`<p class="osd-help">${filteredCache.length} presets · Page ${page+1} of ${pages}. Select one to preview it directly on ${html(CONFIG.title)}.</p><div class="osd-preset-grid">${batch.map(p=>`<button class="osd-preset" type="button" data-preset="${html(p.id)}" aria-label="Preview ${html(p.title)} on ${html(CONFIG.title)}"><img class="osd-source-thumb" loading="lazy" decoding="async" src="${html(p.thumbnail)}" alt="Archived layout preview: ${html(p.title)}"><span class="osd-swatch"><i style="background:${p.ink}"></i><i style="background:${p.base}"></i><i style="background:${p.accent}"></i><i style="background:${p.metal}"></i></span><strong>${html(p.title)}</strong><small>${html(p.originalCategory)}</small></button>`).join('')}</div><div class="osd-page-actions"><button type="button" class="osd-secondary" data-osd-action="prev" ${page===0?'disabled':''}>Previous</button><span>${page+1} / ${pages}</span><button type="button" class="osd-secondary" data-osd-action="next" ${page===pages-1?'disabled':''}>Next</button></div><p class="osd-help">Categories are visual interpretations. Presets are not official music, movie, TV or game merchandise. Wallpapers remain with archive references; only compatible module parts are recolored.</p>`;
}
function presetValues(p,part){const x={};for(const f of part.fields){if(f==='text' && part.fields.includes('fill'))x[f]=p.ink; // Only recolor text where its paired fill changes too.
 else if(f==='text')continue;
 else if(f==='fill')x[f]=p.base;
 else if(f==='border')x[f]=p.accent;
 else if(f==='font')x[f]=p.font;
 else if(f==='size')x[f]=p.size;
 else if(f==='color'){
  x[f]=part.kind==='vinyl'?p.vinyl:part.kind==='wood'?p.wood:part.kind==='metal'?p.metal:part.kind==='needle'?p.metal:part.kind==='brass'?p.accent:part.kind==='label'?p.accent:part.kind==='wave'?(part.id.endsWith('a')?p.accent:part.id.endsWith('b')?p.metal:p.border):p.accent;
 }}return x;}
function applyPreset(id){const p=CATALOG.find(x=>x.id===id);if(!p)return;
 // Each preview starts from the last KEPT state, never from the previously previewed preset.
 working=COPY(saved);
 for(const part of PARTS){if(part.preset===false)continue;working[part.id]={...working[part.id],...presetValues(p,part)};}
 lastChoice=p.title;markPreview(`Previewing ${p.title}. Choose Keep or Undo.`);renderControls();}
function switchTab(tab){activeTab=tab;for(const b of control.querySelectorAll('[data-osd-tab]'))b.setAttribute('aria-selected',String(b.dataset.osdTab===tab));
 control.querySelector('[data-osd-controls]').hidden=tab!=='parts';control.querySelector('[data-osd-gallery]').hidden=tab!=='presets';control.querySelector('[data-osd-images]').hidden=tab!=='images';
 const retro=control.querySelector('[data-osd-retro]');if(retro){retro.hidden=tab!=='retro';retro.classList.toggle('is-open',tab==='retro');}if(tab==='presets')renderGallery();else if(tab==='images')renderImages();else if(tab!=='retro')renderControls();}
function build(){const div=document.createElement('div');div.id=ID('widget');div.className='osd-ui';div.dataset.osdModule=MID;div.innerHTML=`
 <button type="button" class="osd-bubble" data-osd-action="toggle" aria-controls="${ID('panel')}" aria-expanded="false" aria-label="Open ${html(CONFIG.title)} design widget" title="Design ${html(CONFIG.title)}"><span class="osd-quill-crest" aria-hidden="true">🪶</span></button>
 <aside class="osd-panel" id="${ID('panel')}" hidden aria-label="Design ${html(CONFIG.title)}"><header class="osd-heading"><div><strong>${html(CONFIG.title)} Designer</strong><small>Only this module can change</small></div><button class="osd-exit" type="button" data-osd-action="close" aria-label="Close design editor">×</button></header>
 <nav class="osd-tabs" aria-label="Designer tabs"><button type="button" data-osd-tab="parts" aria-selected="true">Individual parts</button><button type="button" data-osd-tab="images" aria-selected="false">Images</button><button type="button" data-osd-tab="retro" aria-selected="false">Profile appearance</button></nav>
 <div class="osd-content"><div data-osd-controls></div><div data-osd-gallery hidden><label class="osd-field"><span>Choose a category</span><select data-role="category"><option value="">Select category…</option>${CATNAMES.map(x=>`<option value="${html(x)}">${html(x)} (${CATALOG.filter(p=>p.group===x).length})</option>`).join('')}</select></label><div data-osd-presets></div></div><div data-osd-images hidden></div></div>
 <div id="${ID('decision')}" class="osd-decision" hidden><div id="${ID('preview-label')}" aria-live="polite"></div><div class="osd-page-actions"><button type="button" class="osd-primary" data-osd-action="keep">Keep design</button><button type="button" class="osd-secondary" data-osd-action="undo">Undo preview</button></div><a class="osd-source-link" data-osd-source-link hidden href="#" rel="noopener noreferrer" target="_blank">View original archive layout</a></div>
 <footer class="osd-footer"><span id="${ID('status')}" role="status">Select a part or preset.</span><button class="osd-secondary" type="button" data-osd-action="reset-all">Restore defaults</button></footer></aside>`;
 document.body.append(div);control=div;renderControls();renderGallery();renderImages();markPreview();const absorb=()=>{const original=document.querySelector('.os-retro-customizer-backdrop');const content=control?.querySelector('.osd-content');if(!original||!content)return;original.dataset.osdRetro='';original.classList.add('osd-retro-embedded');original.classList.remove('is-open');original.hidden=true;original.setAttribute('aria-hidden','true');original.querySelector('.os-retro-customizer')?.setAttribute('aria-modal','false');content.append(original);document.querySelector('.os-retro-customizer-launcher')?.remove();};absorb();if(!control.querySelector('[data-osd-retro]'))window.addEventListener('ourspace:retro-ready',absorb,{once:true});}
function edit(part,key,value){const old=working[part.id]||{};const next={...old,[key]:value};working[part.id]=next;lastChoice='';markPreview(`Previewing ${part.label} changes. Choose Keep or Undo.`);}
function toggle(open){const panel=control.querySelector('.osd-panel');const bubble=control.querySelector('.osd-bubble');panel.hidden=!open;bubble.setAttribute('aria-expanded',String(open));if(open)panel.querySelector('.osd-exit')?.focus();else bubble.focus();}
function onClick(e){const b=e.target.closest('button');if(!b||!control.contains(b))return;
 const imageId=b.dataset.osdImage;if(imageId){chooseImage(imageId);return;}
 const preset=b.dataset.preset;if(preset){applyPreset(preset);return;}
 if(b.dataset.osdTab){switchTab(b.dataset.osdTab);return;}
 const a=b.dataset.osdAction;
 if(a==='toggle'){if(suppressToggle){suppressToggle=false;return;}return toggle(control.querySelector('.osd-panel').hidden);}
 if(a==='close')return toggle(false);
 if(a==='keep')return keep();if(a==='undo')return restore();
 if(a==='reset-part'){const part=selectedPart();delete working[part.id];lastChoice='';markPreview(`${part.label} reset for preview.`);renderControls();return;}
 if(a==='reset-all'){working={};imageWorking=null;lastChoice='';markPreview('Default appearance previewed. Choose Keep or Undo.');renderControls();return;}
 if(a==='next'){page++;renderGallery();return;}if(a==='prev'){page--;renderGallery();return;}
 if(a==='image-prev'){imagePage--;renderImages();return;}if(a==='image-next'){imagePage++;renderImages();return;}
 if(a==='image-clear'){working=COPY(saved);imageWorking=null;lastChoice='';markPreview('Background removal previewed. Keep or Undo.');renderImages();return;}
}
function onChange(e){const t=e.target;
 if(t.dataset.role==='image-category'){imageCategory=t.value;imageInterest='';imagePage=0;renderImages();return;}
 if(t.dataset.role==='image-interest'){imageInterest=t.value;imagePage=0;renderImages();return;}
 if(t.dataset.role==='image-target'){changeImageSetting('target',t.value);return;}
 if(t.dataset.role==='image-strength'){changeImageSetting('strength',t.value);return;}
 if(t.dataset.role==='category'){category=t.value;page=0;renderGallery();return;}
 if(t.dataset.role==='parts'){activePart=t.value;renderControls();return;}
 const key=t.dataset.field;if(!key)return;const part=selectedPart();if(!part.fields.includes(key))return;
 let value=t.value;if(['text','fill','border','color'].includes(key)&&!colorOk(value))return;
 if(key==='size')value=Math.max(10,Math.min(30,Number(value)||16));
 if(key==='font'&&!Object.prototype.hasOwnProperty.call(FONT,value))return;
 edit(part,key,value);
 const out=t.closest('.osd-field')?.querySelector('[data-size-output]');if(out)out.textContent=value+'px';
}
function installDragging(){
 const bubble=control.querySelector('.osd-bubble'),panel=control.querySelector('.osd-panel'),bar=control.querySelector('.osd-heading');
 const POS=STORAGE+'.position';
 try {const stored=JSON.parse(localStorage.getItem(POS)||'null');if(stored){
  for(const [node,pos] of [[bubble,stored.bubble],[panel,stored.panel]]){
   if(!pos)continue;const maxX=Math.max(4,innerWidth-(node===bubble?84:410)-4);
   node.style.setProperty('left',Math.min(maxX,Math.max(4,pos.x))+'px','important');
   node.style.setProperty('top',Math.max(4,pos.y)+'px','important');
   node.style.setProperty('right','auto','important');node.style.setProperty('bottom','auto','important');
   if(node===panel)node.style.setProperty('height','min(680px,calc(100dvh - 30px))','important');
  }
 }}catch(e){}
 function drag(node,handle,isBubble){
  handle.addEventListener('pointerdown',e=>{
   if(e.button!==0||innerWidth<=560)return;
   if(!isBubble&&e.target.closest('button,input,select,a'))return;
   const r=node.getBoundingClientRect();const x=e.clientX,y=e.clientY;
   let moved=false;
   try{handle.setPointerCapture(e.pointerId)}catch(_){}
   const move=event=>{let dx=event.clientX-x,dy=event.clientY-y;
    if(Math.abs(dx)+Math.abs(dy)<7&&!moved)return;moved=true;
    if(isBubble)suppressToggle=true;
    const left=Math.min(Math.max(4,innerWidth-r.width-4),Math.max(4,r.left+dx));
    const top=Math.min(Math.max(4,innerHeight-r.height-4),Math.max(4,r.top+dy));
    for(const [k,v] of [['left',left+'px'],['top',top+'px'],['right','auto'],['bottom','auto']])node.style.setProperty(k,v,'important');
    if(!isBubble)node.style.setProperty('height',r.height+'px','important');
   };
   const done=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',done);handle.removeEventListener('pointercancel',done);
    if(moved){if(isBubble)setTimeout(()=>{suppressToggle=false;},200);try{const pos=JSON.parse(localStorage.getItem(POS)||'{}');pos[isBubble?'bubble':'panel']={x:node.getBoundingClientRect().left,y:node.getBoundingClientRect().top};localStorage.setItem(POS,JSON.stringify(pos))}catch(_){}}};
   handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',done);handle.addEventListener('pointercancel',done);
  });
 }
 drag(bubble,bubble,true);drag(panel,bar,false);
}
function mount(){if(!rootValid())return;build();installDragging();control.addEventListener('click',onClick);control.addEventListener('input',onChange);control.addEventListener('change',onChange);control.addEventListener('error',e=>{if(e.target.matches('.osd-image-choice img'))e.target.closest('.osd-image-card')?.classList.add('osd-image-failed');},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&control&&!control.querySelector('.osd-panel').hidden){e.stopPropagation();toggle(false);}});
 window.OurSpaceModuleDesigners=window.OurSpaceModuleDesigners||{};
 window.OurSpaceModuleDesigners[MID]={open:()=>toggle(true),close:()=>toggle(false),preview:id=>applyPreset(id),previewImage:id=>chooseImage(id),keep,undo:restore,availableImages:()=>COPY(IMAGE_LIBRARY),availableParts:()=>COPY(PARTS),getSaved:()=>COPY(saved),getSavedImage:()=>COPY(imageSaved),getScope:()=>ROOTS()};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
