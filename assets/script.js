// Boot sequence
setTimeout(() => {
	document.getElementById("boot-screen").classList.add("hidden");
}, 3500);

function dateCopyright() {
	const footerContent = document.querySelector(".footer-content");
	const themeButton = document.querySelector("#theme-switch");
	const copyright = document.createElement("p");
	copyright.classList = "glow copy";
	copyright.innerHTML = ` &copy; ${new Date().getFullYear()} Anorak System Log. All rights reserved.`;
	footerContent.insertBefore(copyright, themeButton);
}
dateCopyright();

/* Lista de enfooter-contenttries (novas datas vão aqui)*/

const entries = [
	"2025-07-25",
	"2025-07-28",
	"2025-07-31",
	"2025-08-06",
	"2025-08-16",
	"2025-08-26",
	"2025-12-03",
];

/* Gera links automaticamente  */
function generateLoglinks() {
	const logLinksList = document.querySelector(".log-links");

	entries.forEach((date) => {
		const li = document.createElement("li");
		const a = document.createElement("a");

		a.href = `#${date}`;
		a.textContent = `>_ ${date}.log`;

		/* onClick load the entry */
		a.addEventListener("click", (e) => {
			e.preventDefault();
			loadEntry(date);

			/* remove "active de todos os links" */

			document.querySelectorAll("log-links a").forEach((link) => {
				link.classList.remove("active");
			});

			/* Adiciona "active" quando clickar */
			a.classList.add("active");
		});

		li.appendChild(a);
		logLinksList.appendChild(li);
	});
}

/* Funçao que carrega conteudo do entry */
async function loadEntry(date) {
	const container = document.querySelector(".entries");

	try {
		/* mostra carregando */

		container.innerHTML =
			'<div class="prompt">Carregando...<span class="blinker">_</span></div>';

		/* Procura pelo html */
		const response = await fetch(`./logs/log-${date}.html`);

		/* Verifica se está OK */
		if (!response.ok) {
			throw new Error("Entry não encotrado");
		}

		/* Pega o HTML */
		const html = await response.text();

		/* Injeta no container */
		container.innerHTML = html;
	} catch (error) {
		/* mensagem de erro, caso tenha */

		container.innerHTML = `
    <div class="entry">
        <div class="prompt">anorak@journal:~$ cat ${date}.log</div>
        <div class="entry-content">
          <p style="color: #ff0000;">ERROR: Log file not found!</p>
          <p>O arquivo ./logs/log-${date}.html não existe.</p>
        </div>
      </div>
      `;
		console.error("erro ao carregar entry", error);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	generateLoglinks();
});
