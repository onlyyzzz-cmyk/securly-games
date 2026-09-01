// Harness: extracts the bookmarklet from README.md and simulates it in Node
// with a persistent fake DOM, hitting the real CDN.
import { readFileSync } from "node:fs";

const md = readFileSync("README.md", "utf8");
const m = md.match(/```javascript\n([\s\S]*?)\n```/);
if (!m) throw new Error("bookmarklet code block not found");
const code = m[1].replace(/^javascript:/, "");

let current = ""; // accumulated document.write output
const links = []; // persistent link elements (survive write()/draw() calls)
const searchInput = { value: "", oninput: null };
const listEl = { innerHTML: "" };
const countEl = { textContent: "" };

function syncLinks() {
  const files = [];
  const re = /data-file="([^"]+)"/g;
  let mm;
  while ((mm = re.exec(listEl.innerHTML))) files.push(mm[1]);
  for (let i = links.length - 1; i >= 0; i--) {
    if (!files.includes(links[i].file)) links.splice(i, 1);
  }
  for (const f of files) {
    if (!links.some((l) => l.file === f)) {
      links.push({
        file: f,
        textContent: decodeURIComponent(f.split("/").pop()),
        onclick: null,
        getAttribute(a) {
          return a === "data-file" ? this.file : null;
        },
      });
    }
  }
}

const fakeDoc = {
  open() {},
  close() {},
  write(x) {
    // document.write replaces the whole document, so element state resets
    current += String(x);
    searchInput.value = "";
    searchInput.oninput = null;
    listEl.innerHTML = "";
    countEl.textContent = "";
    syncLinks();
  },
  getElementById(id) {
    if (id === "q") return searchInput;
    if (id === "list") return listEl;
    if (id === "count") return countEl;
    if (id === "exit" || id === "full") return { onclick: null };
    return null;
  },
  querySelectorAll(sel) {
    if (sel !== "[data-file]") return [];
    syncLinks();
    return links.slice();
  },
};

const w = { document: fakeDoc, close() {} };
globalThis.window = { open: () => w };
globalThis.alert = (msg) => {
  throw new Error("alert fired: " + msg);
};

new Function(code)();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, ok, detail) {
  if (ok) {
    console.log("PASS " + name);
  } else {
    failures++;
    console.log("FAIL " + name + (detail ? " — " + detail : ""));
  }
}

// 1. Launcher renders all games from the live CDN catalog
await sleep(3000);
check("launcher shell written", current.includes("Securly Games"));
check("launcher shows Games (54 of 54)", countEl.textContent === "Games (54 of 54)", countEl.textContent);
check("google baseball is listed", links.some((l) => l.file === "games/google%20baseball.html"));

// Capture link objects before any DOM replacement.
// basket random has no <base> of its own, so the loader must inject one.
const target = links.find((l) => l.file === "games/basket%20random.html") || links[0];
const bb = links.find((l) => l.file === "games/google%20baseball.html");

// 2. Search box filters the list as you type
const q = fakeDoc.getElementById("q");
check("search input exists", !!q);
q.value = "baseball";
q.oninput();
await sleep(100);
check(
  "search narrows list to baseball games",
  links.length === 2 && links.every((l) => l.textContent.toLowerCase().includes("baseball")),
  "visible: " + links.map((l) => l.textContent).join(", ")
);
check("count updates to Games (2 of 54)", countEl.textContent === "Games (2 of 54)", countEl.textContent);
q.value = "zzzz-no-match";
q.oninput();
await sleep(100);
check("search with no match shows empty list", links.length === 0 && countEl.textContent === "Games (0 of 54)");
q.value = "";
q.oninput();
await sleep(100);
check("clearing search restores all games", links.length === 54);

// 3. Clicking a game without its own <base> injects the securly-games <base>
target.onclick({ preventDefault() {} });
await sleep(3000);
check(
  "normal game gets securly-games <base> injected",
  current.includes('<base href="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/">'),
  current.slice(-300)
);

// 4. Google baseball keeps its own <base> and gets no conflicting one
if (!bb) {
  failures++;
  console.log("FAIL google baseball link missing");
} else {
  const before = current.length;
  bb.onclick({ preventDefault() {} });
  await sleep(3000);
  const added = current.slice(before);
  check(
    "google baseball keeps its own <base>",
    added.includes("bubblfan/google-doodles@"),
    "own base not found"
  );
  check(
    "google baseball gets no conflicting injected <base>",
    !added.includes('<base href="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/">'),
    "conflicting base was injected"
  );
}

if (failures) {
  console.error(failures + " BOOKMARKLET CHECK(S) FAILED");
  process.exit(1);
}
console.log("ALL BOOKMARKLET TESTS PASSED");
