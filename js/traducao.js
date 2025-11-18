/* ===== FALAR TEXTO ===== */
function falarTexto() {
  const texto = document.getElementById("textoParaTraduzir").value;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  speechSynthesis.speak(fala);
}

/* ===== RECONHECIMENTO DE VOZ ===== */
function iniciarReconhecimento() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "pt-BR";

  rec.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    document.getElementById("textoParaTraduzir").value = texto;
  };

  rec.start();
}

/* ===== TRADUZIR PARA LIBRAS ===== */
function traduzirTexto() {
  const texto = document.getElementById("textoParaTraduzir").value.trim();
  const painel = document.getElementById("areaLibras");

  if (texto === "") {
    alert("Digite algo para traduzir!");
    return;
  }

  painel.textContent = texto;

  painel.dispatchEvent(new Event("DOMSubtreeModified", { bubbles: true }));
}

/* ===== ACESSIBILIDADE ===== */
function alternarAcessibilidade() {
  document.body.classList.toggle("alto-contraste");
}

/* ============================================================
   DEPOIMENTOS — SALVANDO NOME + TEXTO + DATA
   ============================================================ */

function carregarDepoimentos() {
  const lista = document.getElementById("listaDepoimentos");
  lista.innerHTML = "";

  const dados = JSON.parse(localStorage.getItem("depoimentos_acessolivre") || "[]");

  dados.reverse().forEach(dep => {
    const p = document.createElement("p");
    p.textContent = `${dep.nome} — ${dep.data}\n${dep.texto}`;
    p.style.whiteSpace = "pre-line";
    lista.appendChild(p);
  });
}

function salvarDepoimento(nome, texto) {
  const dados = JSON.parse(localStorage.getItem("depoimentos_acessolivre") || "[]");

  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR") +
               " · " +
               agora.toLocaleTimeString("pt-BR", {
                 hour: "2-digit",
                 minute: "2-digit"
               });

  dados.push({ nome, texto, data });

  localStorage.setItem("depoimentos_acessolivre", JSON.stringify(dados));
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formDepoimento");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("nomeDepoimento").value.trim();
      const texto = document.getElementById("inputDepoimento").value.trim();

      if (nome.length < 2) {
        alert("Digite um nome válido!");
        return;
      }

      if (texto.length < 8) {
        alert("Depoimento muito curto!");
        return;
      }

      salvarDepoimento(nome, texto);
      carregarDepoimentos();

      document.getElementById("inputDepoimento").value = "";
      document.getElementById("nomeDepoimento").value = "";
    });
  }

  carregarDepoimentos();
});
