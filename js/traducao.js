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

async function carregarDepoimentos() {
  const lista = document.getElementById("listaDepoimentos");
  lista.innerHTML = "";

  try {
    const response = await fetch('https://projeto-de-extensao-acesso-livre-backend.onrender.com/api/depoimentos');
    if (!response.ok) {
      lista.innerHTML = "<p class='depoimento-item'>Erro ao carregar depoimentos do servidor.</p>";
      return;
    }

    const dados = await response.json();

    dados.forEach(dep => {
      const div = document.createElement("div");
      div.className = "depoimento-item";

      const meta = document.createElement("span");
      meta.className = "depoimento-meta";

      let dataFormatada = 'Data Inválida';
      const dataObj = new Date(dep.data);

      if (dataObj instanceof Date && !isNaN(dataObj)) {
        dataFormatada = dataObj.toLocaleDateString("pt-BR") +
          " · " +
          dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      }

      meta.textContent = `${dep.nome} — ${dataFormatada}`;
      div.appendChild(meta);

      const textoDepoimento = document.createTextNode(dep.texto);
      div.appendChild(textoDepoimento);

      lista.appendChild(div);
    });
  } catch (error) {
    lista.innerHTML = `<p class='depoimento-item'>Erro de conexão: O servidor API não está ativo.</p>`;
  }
}

async function salvarDepoimento(nome, texto) {
  const response = await fetch('http://localhost:3000/api/depoimentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, texto })
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar depoimento para o servidor. Código: ' + response.status);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formDepoimento");

  if (form) {
    form.addEventListener("submit", async (e) => {
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

      try {
        await salvarDepoimento(nome, texto);
        await carregarDepoimentos();

        document.getElementById("inputDepoimento").value = "";
        document.getElementById("nomeDepoimento").value = "";

        alert("Depoimento enviado com sucesso e salvo no servidor!");
      } catch (error) {
        alert("Erro ao salvar depoimento: Verifique se o servidor está ativo. Detalhe: " + error.message);
      }
    });
  }

  carregarDepoimentos();
});