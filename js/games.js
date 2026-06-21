/* De mini-games. Elk spel: { id, title, icon, desc, start(container, { onExit }) } */
(function () {
  const el = UI.el, shuffle = UI.shuffle, sample = UI.sample, distractors = UI.distractors;
  const PLAYERS = window.PLAYERS;
  const POSITIONS = ["Keeper", "Verdediger", "Middenvelder", "Aanvaller"];

  function avatarNode(player, opts) {
    return el("div", { class: "avatar", html: window.makeAvatar(player, opts) });
  }

  function header(title, onExit) {
    return el("div", { class: "game-header" }, [
      el("button", { class: "btn-ghost", onclick: onExit, "aria-label": "Terug" }, ["‹ Terug"]),
      el("h2", { class: "game-title" }, [title]),
      el("span", { class: "spacer" }),
    ]);
  }

  function resultsScreen(container, title, score, total, onAgain, onExit) {
    const pct = Math.round((score / total) * 100);
    let msg = "Lekker bezig! 🟠";
    if (pct === 100) msg = "Perfect! Echte Oranje-kenner! 🏆";
    else if (pct >= 70) msg = "Sterk gespeeld! 💪";
    else if (pct < 40) msg = "Oefenen in de selectie-modus? 📚";

    container.innerHTML = "";
    container.appendChild(
      el("div", { class: "results" }, [
        el("h2", null, [title]),
        el("div", { class: "score-big" }, [String(score), el("span", null, [" / " + total])]),
        el("p", { class: "results-msg" }, [msg]),
        el("div", { class: "results-actions" }, [
          el("button", { class: "btn", onclick: onAgain }, ["Opnieuw"]),
          el("button", { class: "btn-secondary", onclick: onExit }, ["Naar menu"]),
        ]),
      ])
    );
  }

  function progressBar(current, total) {
    return el("div", { class: "progress" }, [
      el("div", { class: "progress-fill", style: "width:" + (current / total) * 100 + "%" }),
    ]);
  }

  /* ---------- 1. Raad de speler ---------- */
  const guessPlayer = {
    id: "guess-player",
    title: "Raad de speler",
    icon: "🕵️",
    desc: "Wie zie je? Kies de juiste naam.",
    start: function (container, ctx) {
      const ROUNDS = 10;
      let round = 0, score = 0;

      function next() {
        if (round >= ROUNDS) {
          return resultsScreen(container, this.title, score, ROUNDS,
            () => this.start(container, ctx), ctx.onExit);
        }
        const target = sample(PLAYERS, 1)[0];
        const options = shuffle([target].concat(distractors(PLAYERS, target, 3)));

        container.innerHTML = "";
        const optionsWrap = el("div", { class: "options" }, []);
        const view = el("div", { class: "game" }, [
          header(this.title, ctx.onExit),
          progressBar(round, ROUNDS),
          el("div", { class: "prompt" }, [avatarNode(target, { size: 180 })]),
          optionsWrap,
        ]);

        options.forEach((p) => {
          const btn = el("button", { class: "option", onclick: () => choose(p, target, btn) }, [p.name]);
          optionsWrap.appendChild(btn);
        });
        container.appendChild(view);
        round++;
      }

      const self = this;
      function choose(p, target, btn) {
        const all = container.querySelectorAll(".option");
        all.forEach((b) => (b.disabled = true));
        if (p.id === target.id) {
          btn.classList.add("correct");
          score++;
        } else {
          btn.classList.add("wrong");
          all.forEach((b) => { if (b.textContent === target.name) b.classList.add("correct"); });
        }
        setTimeout(next.bind(self), 900);
      }

      next.call(this);
    },
  };

  /* ---------- 2. Koppel het rugnummer ---------- */
  const matchNumber = {
    id: "match-number",
    title: "Koppel het rugnummer",
    icon: "🔢",
    desc: "Tik een speler en daarna zijn rugnummer.",
    start: function (container, ctx) {
      const COUNT = 6;
      const players = sample(PLAYERS, COUNT);
      const numbers = shuffle(players.map((p) => p.number));
      let selected = null, matched = 0, mistakes = 0;

      container.innerHTML = "";
      const playersCol = el("div", { class: "match-col players-col" }, []);
      const numbersCol = el("div", { class: "match-col numbers-col" }, []);
      const status = el("p", { class: "match-status" }, ["Tik een speler om te beginnen."]);

      players.forEach((p) => {
        const card = el("button", { class: "match-player", dataset: { id: p.id } }, [
          avatarNode(p, { size: 64 }),
          el("span", { class: "match-name" }, [p.name]),
        ]);
        card.addEventListener("click", () => selectPlayer(p, card));
        playersCol.appendChild(card);
      });

      numbers.forEach((n) => {
        const chip = el("button", { class: "num-chip", dataset: { n: String(n) } }, [String(n)]);
        chip.addEventListener("click", () => selectNumber(n, chip));
        numbersCol.appendChild(chip);
      });

      container.appendChild(
        el("div", { class: "game" }, [
          header(this.title, ctx.onExit),
          status,
          el("div", { class: "match-board" }, [playersCol, numbersCol]),
        ])
      );

      function clearSelection() {
        if (selected) selected.card.classList.remove("selected");
        selected = null;
      }

      function selectPlayer(p, card) {
        if (card.classList.contains("locked")) return;
        clearSelection();
        selected = { player: p, card: card };
        card.classList.add("selected");
        status.textContent = "Welk rugnummer hoort bij " + p.name + "?";
      }

      const self = this;
      function selectNumber(n, chip) {
        if (chip.classList.contains("locked")) return;
        if (!selected) { status.textContent = "Kies eerst een speler."; return; }
        if (selected.player.number === n) {
          selected.card.classList.add("locked");
          selected.card.classList.remove("selected");
          chip.classList.add("locked");
          chip.disabled = true;
          selected.card.disabled = true;
          matched++;
          selected = null;
          status.textContent = "Goed! Nog " + (COUNT - matched) + " te gaan.";
          if (matched === COUNT) {
            setTimeout(() => {
              const score = Math.max(0, COUNT - mistakes);
              resultsScreen(container, self.title, score, COUNT,
                () => self.start(container, ctx), ctx.onExit);
            }, 600);
          }
        } else {
          mistakes++;
          chip.classList.add("shake");
          setTimeout(() => chip.classList.remove("shake"), 400);
          status.textContent = "Nee, dat is niet het nummer van " + selected.player.name + ".";
        }
      }
    },
  };

  /* ---------- 3. Raad de positie ---------- */
  const guessPosition = {
    id: "guess-position",
    title: "Raad de positie",
    icon: "📍",
    desc: "Waar speelt deze speler?",
    start: function (container, ctx) {
      const ROUNDS = 10;
      let round = 0, score = 0;
      const self = this;

      function next() {
        if (round >= ROUNDS) {
          return resultsScreen(container, self.title, score, ROUNDS,
            () => self.start(container, ctx), ctx.onExit);
        }
        const target = sample(PLAYERS, 1)[0];

        container.innerHTML = "";
        const grid = el("div", { class: "pos-grid" }, []);
        container.appendChild(
          el("div", { class: "game" }, [
            header(self.title, ctx.onExit),
            progressBar(round, ROUNDS),
            el("div", { class: "prompt" }, [
              avatarNode(target, { size: 150 }),
              el("p", { class: "prompt-name" }, [target.name]),
            ]),
            grid,
          ])
        );

        POSITIONS.forEach((pos) => {
          const btn = el("button", { class: "option pos-option", onclick: () => choose(pos, target, btn) }, [pos]);
          grid.appendChild(btn);
        });
        round++;
      }

      function choose(pos, target, btn) {
        const all = container.querySelectorAll(".pos-option");
        all.forEach((b) => (b.disabled = true));
        if (pos === target.position) {
          btn.classList.add("correct");
          score++;
        } else {
          btn.classList.add("wrong");
          all.forEach((b) => { if (b.textContent === target.position) b.classList.add("correct"); });
        }
        setTimeout(next, 900);
      }

      next();
    },
  };

  /* ---------- Leermodus: bekijk de selectie ---------- */
  const study = {
    id: "study",
    title: "Bekijk de selectie",
    icon: "📚",
    desc: "Leer de avatars, namen en nummers.",
    start: function (container, ctx) {
      container.innerHTML = "";
      const grid = el("div", { class: "study-grid" }, []);
      PLAYERS.slice().sort((a, b) => a.number - b.number).forEach((p) => {
        grid.appendChild(
          el("div", { class: "study-card" }, [
            avatarNode(p, { size: 96, showNumber: true }),
            el("strong", null, [p.name]),
            el("span", { class: "study-meta" }, [p.position]),
            el("span", { class: "study-club" }, [p.club || ""]),
          ])
        );
      });
      container.appendChild(
        el("div", { class: "game" }, [header(this.title, ctx.onExit), grid])
      );
    },
  };

  window.GAMES = [guessPlayer, matchNumber, guessPosition, study];
})();
