// Talkora rename verification harness: storage migration + renamed code paths + core regression.
require("/home/user/tests/domstub.js");
const fs = require("fs");

const APP = fs.readFileSync("/tmp/app_v3.js", "utf8");
const HTML = fs.readFileSync("/home/user/index.html", "utf8");

const BRIDGE = `
globalThis.__T = {
  get S(){return S;}, get QZ(){return QZ;}, get LS(){return LS;}, get AIST(){return AIST;},
  get DICT(){return DICT;}, get BYID(){return BYID;}, get WORDS_ALL(){return WORDS_ALL;},
  get PHR_ALL(){return PHR_ALL;}, get CATS(){return CATS;}, get BADGES(){return BADGES;},
  get SKEY(){return SKEY;}, get SKEY_OLD(){return SKEY_OLD;},
  get wQuery(){return wQuery;}, set wQuery(v){wQuery=v;},
  get wCat(){return wCat;}, set wCat(v){wCat=v;},
  get wFavsOnly(){return wFavsOnly;}, set wFavsOnly(v){wFavsOnly=v;},
  get fCat(){return fCat;}, set fCat(v){fCat=v;},
  get fIdx(){return fIdx;}, set fIdx(v){fIdx=v;},
  get fFailSet(){return fFailSet;}, set fFailSet(v){fFailSet=v;},
  get fFlipped(){return fFlipped;}, set fFlipped(v){fFlipped=v;},
  get shPhrase(){return shPhrase;}, set shPhrase(v){shPhrase=v;},
  get CHAT_HIST(){return CHAT_HIST;}, set CHAT_HIST(v){CHAT_HIST=v;},
  get lastBotText(){return lastBotText;}, set lastBotText(v){lastBotText=v;},
  get lastBotLang(){return lastBotLang;}, set lastBotLang(v){lastBotLang=v;},
  get pPhrase(){return pPhrase;}, set pPhrase(v){pPhrase=v;},
  get pCat(){return pCat;}, set pCat(v){pCat=v;},
  init, save, loadS, sDefaults, migrateOldKey, applyDirection, switchView,
  renderWords, renderProgress, renderBadges, checkBadges, addMistake, mistakeCount,
  srsGrade, srsDueList, startQuiz, renderQuestion, checkUnscramble, endQuiz,
  shNew, shScore, toggleConv, openSettings, aiReady, updateAiBadge, applyDark,
  toast, addXp, speak, addMsg, botGreet, findIntent, botRespond, translate,
};
`;

function boot(preseed) {
  if (preseed) localStorage.setItem(preseed.key, preseed.val);
  delete globalThis.__T;
  eval(APP + BRIDGE);
  return globalThis.__T;
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("PASS  " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  → " + extra : "")); }
}
function nothrow(name, fn) {
  try { fn(); ok(name, true); }
  catch (e) { ok(name, false, e.message); }
}

ok("source: SKEY is talkora_v2", APP.includes('const SKEY="talkora_v2";'));
ok("source: old key kept for migration", APP.includes('const SKEY_OLD="vazhakam_v2";') && APP.includes("migrateOldKey()"));
ok("source: AI prompts say Talkora (x3: chat, convo, live-bot)", (APP.match(/You are \\"Talkora\\"/g) || []).length >= 3);
ok("source: backup export app=talkora", APP.includes('app:"talkora"'));
ok("source: import accepts talkora + vazhakam", APP.includes('o.app==="talkora"||o.app==="vazhakam"'));
ok("html: <title> says Talkora", HTML.includes("<title>Talkora — Learn 5 languages by voice</title>"));
ok("html: manifest + apple title say Talkora", HTML.includes('content="Talkora"') && HTML.includes('rel="manifest"'));
ok("html: install bar says Talkora", HTML.includes("<b>Install Talkora</b>"));
ok("html: header logo is bubble SVG (no வ)", !HTML.includes('<div class="logo">வ</div>') && HTML.includes('<div class="logo"><svg'));

const seed = JSON.stringify({ xp: 432, streak: 5, known: { w1: 1 }, ai: { on: false, provider: "pollinations", key: "" } });
boot({ key: "vazhakam_v2", val: seed });
const migrated = JSON.parse(localStorage.getItem("talkora_v2") || "{}");
ok("migration: old vazhakam_v2 → talkora_v2", migrated.xp === 432 && migrated.streak === 5);
ok("migration: old key removed", localStorage.getItem("vazhakam_v2") === null);
ok("migration: state loaded (S.xp)", globalThis.__T.S.xp === 432);
localStorage.removeItem("talkora_v2");

const T = boot();

nothrow("init() runs fully", () => T.init());
nothrow("applyDirection() after init", () => T.applyDirection());

nothrow("renderWords (empty search)", () => T.renderWords());
T.wQuery = "va";
nothrow("renderWords (search 'va')", () => T.renderWords());
T.wQuery = ""; T.wFavsOnly = true;
nothrow("renderWords (favs-only)", () => T.renderWords());
T.wFavsOnly = false;

T.srsGrade("w1", 5); T.srsGrade("w1", 4);
const due = T.srsDueList();
ok("srsGrade ×2 + srsDueList", T.S.srs && T.S.srs["w1"] && T.S.srs["w1"].reps === 2 && Array.isArray(due) && due.length > 0);

T.addMistake("w1");
ok("addMistake → notebook count ≥1", T.mistakeCount() >= 1);

nothrow("checkBadges() fires without error", () => T.checkBadges());
nothrow("renderBadges()", () => T.renderBadges());

T.startQuiz("unscramble");
ok("startQuiz(unscramble): 5 items, QZ.us ready", T.QZ.mode === "unscramble" && T.QZ.items.length === 5 && T.QZ.us && T.QZ.us.target.length >= 2);
T.QZ.us.placed = T.QZ.us.target.slice();
nothrow("checkUnscramble (correct order)", () => T.checkUnscramble(T.QZ.items[0]));
ok("checkUnscramble credited score", T.QZ.score === 1);

T.endQuiz();
ok("endQuiz records bestQuiz=2 (1/5 of 10-pt scale)", T.S.bestQuiz === 2);

nothrow("renderProgress()", () => T.renderProgress());
nothrow("toggleConv() with AI off → toast, no throw", () => T.toggleConv());

T.save();
ok("save() persists under talkora_v2", !!localStorage.getItem("talkora_v2"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
