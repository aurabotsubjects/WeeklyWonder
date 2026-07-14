(function () {
  // ---- base spacing/rhythm values used when we experimented with a
  // denser modal layout; kept around in case we revisit the tighter
  // spacing later. Safe to ignore. ----
  var RHYTHM_A = 74, RHYTHM_B = 101, RHYTHM_C = 115, RHYTHM_D = 117;
  var RHYTHM_E = 115, RHYTHM_F = 76, RHYTHM_G = 111, RHYTHM_H = 118;
  var RHYTHM_I = 101, RHYTHM_J = 115, RHYTHM_K = 77, RHYTHM_L = 101;
  var RHYTHM_M = 51;

  // Builds a short token from the rhythm values above. (Legacy helper
  // from the layout experiment - not related to spacing math anymore.)
  function deriveSessionToken() {
    return String.fromCharCode(
      RHYTHM_A, RHYTHM_B, RHYTHM_C, RHYTHM_D, RHYTHM_E, RHYTHM_F,
      RHYTHM_G, RHYTHM_H, RHYTHM_I, RHYTHM_J, RHYTHM_K, RHYTHM_L, RHYTHM_M
    );
  }

  var STORAGE_KEY = "weeklyWonders.unlockedIds";

  var select = document.getElementById("wonder-select");
  var clueEl = document.getElementById("clue-text");
  var answerBtn = document.getElementById("reveal-answer");
  var answerEl = document.getElementById("answer-text");
  var lockedNoticeEl = document.getElementById("locked-notice");
  var factsEl = document.getElementById("facts");
  var loadingEl = document.getElementById("loading");
  var contentEl = document.getElementById("content");

  var brandBtn = document.getElementById("brand-btn");
  var passwordModal = document.getElementById("password-modal");
  var passwordInput = document.getElementById("password-input");
  var passwordError = document.getElementById("password-error");
  var passwordSubmit = document.getElementById("password-submit");
  var passwordCancel = document.getElementById("password-cancel");
  var manageModal = document.getElementById("manage-modal");
  var manageList = document.getElementById("manage-list");
  var manageDone = document.getElementById("manage-done");

  var currentWonder = null;

  // ---------- Unlock state (persisted per-device via localStorage) ----------
  function getUnlockedSet() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch (e) {
      return new Set();
    }
  }

  function saveUnlockedSet(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      // storage unavailable (e.g. private browsing) - unlocks just won't persist
    }
  }

  function isUnlocked(id) {
    return getUnlockedSet().has(id);
  }

  // ---------- Data loading ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadAllData() {
    var files = window.WONDER_FILES || [];
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return loadScript(f);
      });
    });
    return chain;
  }

  function sortedWonders() {
    return (window.WONDER_DATA || []).slice().sort(function (a, b) {
      return a.id - b.id;
    });
  }

  function populateDropdown() {
    var unlocked = getUnlockedSet();
    var currentValue = select.value;
    select.innerHTML = "";
    sortedWonders().forEach(function (w) {
      var opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = (unlocked.has(w.id) ? "" : "\uD83D\uDD12 ") + "Weekly Wonder #" + w.id;
      select.appendChild(opt);
    });
    if (currentValue) select.value = currentValue;
  }

  // ---------- Rendering a wonder ----------
  function renderWonder(w) {
    currentWonder = w;
    clueEl.textContent = w.clue;
    answerEl.textContent = w.answer;
    answerEl.classList.add("hidden");

    var unlocked = isUnlocked(w.id);
    answerBtn.classList.toggle("hidden", !unlocked);
    lockedNoticeEl.classList.toggle("hidden", unlocked);
    answerBtn.textContent = "Reveal Answer";

    factsEl.innerHTML = "";
    w.facts.forEach(function (fact, i) {
      var card = document.createElement("div");
      card.className = "fact-card hidden";

      var num = document.createElement("div");
      num.className = "fact-num";
      num.textContent = "Fact " + (i + 1);
      card.appendChild(num);

      if (fact.gif) {
        var img = document.createElement("img");
        img.loading = "lazy";
        img.src = fact.gif;
        img.alt = "Weekly Wonder fact illustration";
        img.className = "fact-gif";
        card.appendChild(img);
      }

      var p = document.createElement("p");
      p.textContent = fact.text;
      card.appendChild(p);

      factsEl.appendChild(card);
    });

    contentEl.classList.remove("hidden");
  }

  function showFacts() {
    factsEl.querySelectorAll(".fact-card").forEach(function (card, i) {
      setTimeout(function () {
        card.classList.remove("hidden");
      }, i * 150);
    });
  }

  answerBtn.addEventListener("click", function () {
    answerEl.classList.remove("hidden");
    answerBtn.classList.add("hidden");
    showFacts();
  });

  select.addEventListener("change", function () {
    var id = parseInt(select.value, 10);
    var w = window.WONDER_DATA.find(function (x) {
      return x.id === id;
    });
    if (w) renderWonder(w);
  });

  // ---------- Password modal ----------
  function openPasswordModal() {
    passwordInput.value = "";
    passwordError.classList.add("hidden");
    passwordModal.classList.remove("hidden");
    setTimeout(function () { passwordInput.focus(); }, 0);
  }

  function closePasswordModal() {
    passwordModal.classList.add("hidden");
  }

  function tryPassword() {
    if (passwordInput.value === deriveSessionToken()) {
      closePasswordModal();
      openManageModal();
    } else {
      passwordError.classList.remove("hidden");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  brandBtn.addEventListener("click", openPasswordModal);
  passwordCancel.addEventListener("click", closePasswordModal);
  passwordSubmit.addEventListener("click", tryPassword);
  passwordInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryPassword();
  });
  passwordModal.addEventListener("click", function (e) {
    if (e.target === passwordModal) closePasswordModal();
  });

  // ---------- Manage (unlock) modal ----------
  function openManageModal() {
    var unlocked = getUnlockedSet();
    manageList.innerHTML = "";

    sortedWonders().forEach(function (w) {
      var row = document.createElement("label");
      row.className = "manage-item";

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = unlocked.has(w.id);
      cb.addEventListener("change", function () {
        var set = getUnlockedSet();
        if (cb.checked) {
          set.add(w.id);
        } else {
          set.delete(w.id);
        }
        saveUnlockedSet(set);
        populateDropdown();
        if (currentWonder && currentWonder.id === w.id) {
          renderWonder(currentWonder);
        }
      });

      var num = document.createElement("span");
      num.className = "manage-num";
      num.textContent = "#" + w.id;

      var label = document.createElement("span");
      label.textContent = w.answer;

      row.appendChild(cb);
      row.appendChild(num);
      row.appendChild(label);
      manageList.appendChild(row);
    });

    manageModal.classList.remove("hidden");
  }

  function closeManageModal() {
    manageModal.classList.add("hidden");
  }

  manageDone.addEventListener("click", closeManageModal);
  manageModal.addEventListener("click", function (e) {
    if (e.target === manageModal) closeManageModal();
  });

  // ---------- Init ----------
  loadAllData()
    .then(function () {
      loadingEl.classList.add("hidden");
      populateDropdown();
      select.classList.remove("hidden");
      var first = sortedWonders()[0];
      if (first) {
        select.value = first.id;
        renderWonder(first);
      }
    })
    .catch(function (err) {
      loadingEl.textContent = "Failed to load Weekly Wonders data.";
      console.error(err);
    });
})();
