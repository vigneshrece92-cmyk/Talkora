// Talkora FULL AUDIT harness — static DOM integrity + per-tab functional sweep (11 views + scenes)
require("/home/user/tests/domstub.js");
const fs = require("fs");
const APP = fs.readFileSync("/tmp/app_v3.js", "utf8");
const HTML = fs.readFileSync("/home/user/index.html", "utf8");

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("PASS  " + name); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  → " + extra : "")); }
}
function nothrow(name, fn) {
  try { fn(); ok(name, true); } catch (e) { ok(name, false, e.message); }
}

// ---------- A. STATIC DOM INTEGRITY ----------
const MARKUP = HTML.replace(/<script>[\s\S]*?<\/script>/g, "<script></script>");
const htmlIds = new Set([...MARKUP.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const jsGenIds = new Set([...APP.matchAll(/id=["']([A-Za-z][\w-]*)["']/g)].map(m => m[1]));
const allIds = new Set([...htmlIds, ...jsGenIds]);
const wanted = new Set([...APP.matchAll(/getElementById\("([^"]+)"\)/g)].map(m => m[1]));
for (const m of APP.matchAll(/querySelector(?:All)?\("#([a-zA-Z][\w-]*)/g)) wanted.add(m[1]);
const missing = [...wanted].filter(id => !allIds.has(id));
ok("static: every JS-referenced id exists (" + wanted.size + " checked)", missing.length === 0, missing.join(","));

const dup = [...htmlIds].filter(id => (MARKUP.match(new RegExp('id="' + id + '"', "g")) || []).length > 1);
ok("static: no duplicate ids in markup", dup.length === 0, dup.join(","));

const tabViews = [...HTML.matchAll(/data-view="([^"]+)"/g)].map(m => m[1]);
const secViews = [...HTML.matchAll(/<section class="view[^"]*" id="view-([^"]+)"/g)].map(m => m[1]);
ok("static: every tab has a section (" + tabViews.length + " tabs)", tabViews.every(v => secViews.includes(v)), tabViews.filter(v => !secViews.includes(v)).join(","));
ok("static: every section has a tab", secViews.every(v => tabViews.includes(v)), secViews.filter(v => !tabViews.includes(v)).join(","));

// ---------- B. FUNCTIONAL SWEEP ----------
const BRIDGE = `
globalThis.__T = {
  get S(){return S;}, get QZ(){return QZ;}, get CATS(){return CATS;}, get PHRASEMAPS(){return PHRASEMAPS;},
  init, save, switchView, applyDirection, applyDark, updateAiBadge, aiReady, openSettings,
  renderWords, renderProgress, renderBadges, checkBadges, renderCatbar, renderCard,
  startQuiz, endQuiz, renderLessonCats, startLesson, pNewPhrase, pScore,
  renderWot, refreshChips, botGreet, botRespond, translate, addMsg, exportBackup,
  initBot, renderBotSeg, botListen, botTranslate, botCorrect, aiQuiz,
  renderScript, scriptQuiz, initScript, get SCR(){return SCR;}, get SCQ(){return SCQ;}, get SCRIPTS(){return SCRIPTS;},
  renderGrammar, tourStart, tourEnd, shareProgress, packInit, get GRAMMAR(){return GRAMMAR;},
  renderScenes, startScene, finishScene, get SCENES(){return SCENES;},
  get BOT(){return BOT;},
};
`;
delete globalThis.__T;
eval(APP + BRIDGE);
const T = globalThis.__T;

nothrow("boot: init() full startup", () => T.init());
nothrow("boot: DOMContentLoaded listeners fire", () => (document._l || []).filter(x => x[0] === "DOMContentLoaded").forEach(x => x[1]()));
ok("boot: state defaults sane", T.S && typeof T.S.xp === "number" && T.S.bot && T.S.ai);

for (const v of ["chat","bot","translate","cards","quiz","lesson","speak","script","grammar","words","progress"]) {
  nothrow("switchView → " + v, () => T.switchView(v));
}

nothrow("chat: botGreet()", () => T.botGreet());
nothrow("chat: renderWot + refreshChips", () => { T.renderWot(); T.refreshChips(); });
nothrow("chat: botRespond offline intent", () => T.botRespond("hello"));

nothrow("bot: initBot() wiring", () => T.initBot());
nothrow("bot: renderBotSeg()", () => T.renderBotSeg());
nothrow("bot: botListen() without SR → toast only", () => T.botListen());

(async () => {
  try { T.S.bot.voice = false; await T.botTranslate("hello"); ok("bot: translate path (curated offline)", true); }
  catch (e) { ok("bot: translate path (curated offline)", false, e.message); }
  try { await T.botCorrect("hello"); ok("bot: correct path (AI offline → fallback)", true); }
  catch (e) { ok("bot: correct path (AI offline → fallback)", false, e.message); }

  try { T.renderScenes(); ok("scenes: launcher renders (4 scenes)", T.SCENES.length === 4); } catch (e) { ok("scenes: launcher renders (4 scenes)", false, e.message); }
  try { await T.startScene("resto"); ok("scenes: start with offline AI → graceful fallback", true); } catch (e) { ok("scenes: start with offline AI → graceful fallback", false, e.message); }
  try { T.S.scene = { id: "resto", turns: 3 }; T.finishScene({ score: 90, feedback: "Great!" }); ok("scenes: finish scores + clears + badge counter", T.S.scenesDone >= 1 && !T.S.scene); } catch (e) { ok("scenes: finish scores + clears + badge counter", false, e.message); }

  try { T.translate("hello"); ok("translate: translate() runs", true); } catch (e) { ok("translate: translate() runs", false, e.message); }
  try { T.renderCatbar(); T.renderCard(); ok("cards: catbar + card render", true); } catch (e) { ok("cards: catbar + card render", false, e.message); }

  for (const m of ["unscramble","cloze","type","read","listen"]) {
    try { T.startQuiz(m); ok("quiz mode: " + m, true); } catch (e) { ok("quiz mode: " + m, false, e.message); }
  }
  try { await T.aiQuiz("food"); ok("quiz mode: ai (aiQuiz, offline fetch → graceful)", true); } catch (e) { ok("quiz mode: ai (aiQuiz, offline fetch → graceful)", false, e.message); }

  try { T.renderLessonCats(); T.startLesson(T.CATS[0].id); ok("lesson: cats + start lesson", true); } catch (e) { ok("lesson: cats + start lesson", false, e.message); }
  try { T.pNewPhrase(); T.pScore("hello hello"); ok("speak: new phrase + scoring", true); } catch (e) { ok("speak: new phrase + scoring", false, e.message); }

  try { T.renderScript(); T.scriptQuiz(); ok("script: trainer renders + letter quiz (5 items)", T.SCQ.items.length === 5); } catch (e) { ok("script: trainer renders + letter quiz (5 items)", false, e.message); }

  try { T.renderGrammar(); ok("grammar: guide renders (5 langs)", Object.keys(T.GRAMMAR).length === 5); } catch (e) { ok("grammar: guide renders (5 langs)", false, e.message); }
  try { T.tourStart(); T.tourEnd(); ok("tour: start + finish persists flag", T.S.tourDone === 1); } catch (e) { ok("tour: start + finish persists flag", false, e.message); }
  try { T.packInit(); T.shareProgress(); ok("pack: init + share card (fallback path)", true); } catch (e) { ok("pack: init + share card (fallback path)", false, e.message); }

  try { T.renderWords(); T.renderProgress(); T.renderBadges(); T.checkBadges(); ok("words/progress/badges render", true); } catch (e) { ok("words/progress/badges render", false, e.message); }
  try { T.openSettings(); T.applyDark(); T.updateAiBadge(); ok("settings modal + dark + ai badge", true); } catch (e) { ok("settings modal + dark + ai badge", false, e.message); }
  try { T.exportBackup(); ok("backup export runs", true); } catch (e) { ok("backup export runs", false, e.message); }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
