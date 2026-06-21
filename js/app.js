/* Hub + navigatie. */
(function () {
  const el = UI.el;
  const root = document.getElementById("app");

  function showHub() {
    root.innerHTML = "";
    const grid = el("div", { class: "hub-grid" }, []);
    window.GAMES.forEach((game) => {
      const card = el("button", { class: "hub-card", onclick: () => openGame(game) }, [
        el("span", { class: "hub-icon" }, [game.icon]),
        el("span", { class: "hub-name" }, [game.title]),
        el("span", { class: "hub-desc" }, [game.desc]),
      ]);
      grid.appendChild(card);
    });

    root.appendChild(
      el("div", { class: "hub" }, [
        el("header", { class: "hub-header" }, [
          el("h1", null, ["Herken de Oranje Selectie"]),
          el("p", { class: "subtitle" }, ["Kies een mini-game ⚽🟠"]),
        ]),
        grid,
      ])
    );
  }

  function openGame(game) {
    root.innerHTML = "";
    const container = el("div", { class: "game-container" }, []);
    root.appendChild(container);
    game.start(container, { onExit: showHub });
  }

  showHub();
})();
