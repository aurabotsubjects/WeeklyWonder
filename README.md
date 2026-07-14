# Weekly Wonders

A lightweight, static web app for browsing your class's "Weekly Wonder"
trivia cards: a clue, an answer reveal, and three fun facts (each with its
own GIF).

## How it's structured

```
index.html          the page shell
style.css            all styling
app.js                app logic (loads data, renders the selected wonder)
data/
  index.js           lists every data file to load
  wonders-01.js       Weekly Wonders #1-8  (an array pushed onto window.WONDER_DATA)
  wonders-02.js       Weekly Wonders #9-17 (an array pushed onto window.WONDER_DATA)
  wonders-03.js       Weekly Wonders #18-24 (an array pushed onto window.WONDER_DATA)
  wonders-04.js       Weekly Wonders #25-27 (an array pushed onto window.WONDER_DATA)
  wonders-05.js       Weekly Wonders #28-32 (an array pushed onto window.WONDER_DATA)
  wonders-06.js       Weekly Wonders #33-36 (an array pushed onto window.WONDER_DATA)
assets/
  gifs/               compressed GIFs, one per fact (~50KB-1.2MB each)
```

Each data file is capped at roughly 10 wonders to keep individual files
small and fast to load. GIFs were re-encoded (resized + palette-reduced)
with gifsicle, shrinking the original PowerPoint exports by about 90%
while keeping the animation.

Memory verses that appeared in some of the original slides were
intentionally left out of this app.

## Teacher unlock feature

By default every wonder shows only its clue — no "Reveal Answer" button —
so students can attempt the clue as homework before seeing the answer.

To unlock one or more wonders:

1. Click the **Weekly Wonders** logo/title in the top-left.
2. Enter the password: `JesusLovesMe3`
3. Check the box next to any wonder you want to unlock. Unchecked wonders
   stay clue-only; checked ones get their "Reveal Answer" button back
   immediately.
4. Click **Done**.

Unlock choices are saved in the browser's local storage, so they persist
on that device/browser across visits (until it's cleared). They are set
per-device, not shared across students automatically — each computer/
browser that opens the site keeps its own unlock list, so this works best
if the class shares one device/screen, or if you unlock ahead of time on
each device the students will use.

**Note on security:** this is a simple classroom UX lock, not real
security. All wonder data (including answers and facts) is present in
the page's JavaScript files as soon as the page loads — the lock just
hides it from the interface. A student who opens the browser's dev tools
or views the page source could still find the answers. It's meant to
prevent casual/accidental spoilers, not determined snooping.

The password isn't stored as a plain string in the code — it's built from
character codes disguised as leftover layout constants, so a casual
glance at `app.js` won't obviously reveal it. To change the password,
open `app.js`, find the `RHYTHM_A` ... `RHYTHM_M` values near the top and
the `deriveSessionToken()` function that turns them into text, and swap
in codes for your new password. In a browser console you can get the
codes for any word with:

```js
[..."YourNewPassword"].map(c => c.charCodeAt(0))
```

(As before, this is light camouflage for a classroom setting, not real
security — anyone who runs that snippet in dev tools could decode it.)

## Adding more Weekly Wonders

1. Create a new file, e.g. `data/wonders-02.js`, following the same
   pattern as `wonders-01.js`:

   ```js
   window.WONDER_DATA = window.WONDER_DATA || [];
   window.WONDER_DATA.push(
     {
       id: 9,
       clue: "...",
       answer: "...",
       facts: [
         { text: "...", gif: "assets/gifs/w9_f1.gif" },
         { text: "...", gif: "assets/gifs/w9_f2.gif" },
         { text: "...", gif: "assets/gifs/w9_f3.gif" }
       ]
     }
     // ...up to ~10 wonders per file
   );
   ```

   Use a unique, sequential `id` for every wonder across all files (no
   duplicates).

2. Add GIFs to `assets/gifs/`. Compress them first so the repo doesn't
   bloat — with gifsicle:

   ```
   gifsicle --resize-width 240 --colors 64 -O3 --lossy=100 input.gif -o assets/gifs/w9_f1.gif
   ```

3. Register the new file in `data/index.js`:

   ```js
   window.WONDER_FILES = [
     "data/wonders-01.js",
     "data/wonders-02.js"
   ];
   ```

That's it — the dropdown picks up new wonders automatically, sorted by id.

## Hosting on GitHub Pages

Push this folder to a repo and enable GitHub Pages (Settings → Pages →
deploy from branch, root folder). No build step needed — it's plain
HTML/CSS/JS.
