const THEMES = ["dark", "lightmode", "ambermode"];
const LABELS = {
  dark: "MUDAR TEMA",
  lightmode: "MUDAR TEMA",
  ambermode: "MUDAR TEMA",
};

const themeSwitch = document.getElementById("theme-switch");

function applyTheme(theme) {
  document.body.classList.remove("lightmode", "ambermode");
  if (theme === "lightmode") document.body.classList.add("lightmode");
  if (theme === "ambermode") document.body.classList.add("ambermode");
  localStorage.setItem("theme", theme);
  themeSwitch.textContent = LABELS[theme];
}

function cycleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  applyTheme(next);
}

/* Restaura o tema salvo ao carregar */
applyTheme(localStorage.getItem("theme") || "dark");

themeSwitch.addEventListener("click", cycleTheme);
