function falarTexto() {
  const texto = document.getElementById("textoParaTraduzir").value;
  if (texto === "") {
    alert("Digite algo para ser falado!");
    return;
  }
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  speechSynthesis.speak(fala);
}

function iniciarReconhecimento() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Seu navegador não suporta o Reconhecimento de Voz.");
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = "pt-BR";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    document.getElementById("textoParaTraduzir").value = texto;
  };

  rec.onerror = (event) => {
    console.error('Erro de reconhecimento de voz: ', event.error);
  };

  rec.start();
}

function reconhecerDepoimento() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Seu navegador não suporta o Reconhecimento de Voz.");
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = "pt-BR";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    document.getElementById("inputDepoimento").value = texto;
  };

  rec.onerror = (event) => {
    console.error('Erro de reconhecimento de voz: ', event.error);
  };

  rec.start();
}

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

function alternarAcessibilidade() {
  document.body.classList.toggle("alto-contraste");
}

function carregarDepoimentos() {
  const lista = document.getElementById("listaDepoimentos");
  lista.innerHTML = "";

  const dados = JSON.parse(localStorage.getItem("depoimentos_acessolivre") || "[]");

  dados.reverse().forEach(dep => {
    const div = document.createElement("div");
    div.className = "depoimento-item";

    const meta = document.createElement("span");
    meta.className = "depoimento-meta";
    meta.textContent = `${dep.nome} — ${dep.data}`;
    div.appendChild(meta);

    const textoDepoimento = document.createTextNode(dep.texto);
    div.appendChild(textoDepoimento);

    lista.appendChild(div);
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

      alert("Depoimento enviado com sucesso!");
    });
  }

  carregarDepoimentos();
});