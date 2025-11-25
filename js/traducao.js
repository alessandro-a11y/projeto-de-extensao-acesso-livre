const API_URL = 'https://projeto-de-extensao-acesso-livre-backend.onrender.com';

const listaDepoimentos = document.getElementById('listaDepoimentos');
const textoParaTraduzir = document.getElementById('textoParaTraduzir');
const inputDepoimento = document.getElementById('inputDepoimento');

// Detecção de suporte a Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

function iniciarSpeechRecognition(targetElement) {
  // Verificar suporte a Speech Recognition
  if (!SpeechRecognition) {
    alert("Desculpe, seu navegador não suporta reconhecimento de voz. Tente atualizar seu navegador.");
    console.warn("Speech Recognition não suportado neste navegador");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = function () {
      console.log("Reconhecimento de voz iniciado");
    };

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript;
      targetElement.value = transcript;
      console.log("Texto reconhecido: " + transcript);
    };

    recognition.onerror = function (event) {
      console.error('Erro no reconhecimento de voz:', event.error);
      
      // Mensagens de erro mais amigáveis
      const erroMensagens = {
        'no-speech': 'Nenhuma fala foi detectada. Tente novamente.',
        'audio-capture': 'Nenhum microfone foi encontrado. Verifique as permissões.',
        'network': 'Erro de conexão. Verifique sua internet.',
        'permission-denied': 'Acesso ao microfone foi negado. Verifique as permissões do navegador.'
      };
      
      const mensagem = erroMensagens[event.error] || `Erro: ${event.error}`;
      alert(`Erro no reconhecimento de voz: ${mensagem}`);
    };

    recognition.onend = function () {
      console.log("Reconhecimento de voz finalizado");
    };

    recognition.start();
    alert("Reconhecimento de voz iniciado. Fale agora!");
  } catch (error) {
    console.error('Erro ao iniciar Speech Recognition:', error);
    alert("Erro ao iniciar reconhecimento de voz. Tente novamente.");
  }
}

function traduzirTexto() {
  alert("Função 'Traduzir para Libras' chamada. Use o VLibras para iniciar a tradução!");
  console.log("Ação: Traduzindo texto para Libras.");
}

function alternarAcessibilidade() {
  document.body.classList.toggle('alto-contraste');
  console.log("Ação: Alternando alto contraste.");
}

function falarTexto() {
  if (!SpeechSynthesis) {
    alert("Seu navegador não suporta síntese de voz (TTS).");
    return;
  }

  if (!textoParaTraduzir.value) {
    alert("Por favor, digite algum texto para ouvir.");
    return;
  }

  try {
    // Cancelar fala anterior se houver
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textoParaTraduzir.value);
    
    // Configurações para melhor compatibilidade
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = function () {
      console.log("Síntese de voz iniciada");
    };

    utterance.onend = function () {
      console.log("Síntese de voz finalizada");
    };

    utterance.onerror = function (event) {
      console.error("Erro na síntese de voz:", event.error);
      alert(`Erro ao falar texto: ${event.error}`);
    };

    window.speechSynthesis.speak(utterance);
    console.log("Ação: Iniciando síntese de voz (TTS).");
  } catch (error) {
    console.error("Erro ao executar síntese de voz:", error);
    alert("Erro ao executar síntese de voz. Tente novamente.");
  }
}

function pararFala() {
  if (SpeechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    console.log("Síntese de voz cancelada");
  }
}

function iniciarReconhecimento() {
  iniciarSpeechRecognition(textoParaTraduzir);
}

function reconhecerDepoimento() {
  iniciarSpeechRecognition(inputDepoimento);
}

function limparTextoArea() {
  textoParaTraduzir.value = '';
  console.log("Ação: Limpando área de texto principal.");
}

function criarDepoimentoElemento(depoimento) {
  const div = document.createElement('div');
  div.classList.add('depoimento-item');

  const dataObj = new Date(depoimento.data);
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlContent = `
  <strong>${depoimento.nome}</strong> — ${dataFormatada} · ${horaFormatada}
  <p>${depoimento.texto}</p>
 `;

  div.innerHTML = htmlContent;
  return div;
}

async function carregarDepoimentos() {
  if (listaDepoimentos) {
    listaDepoimentos.innerHTML = '';
  } else {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/depoimentos`);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const depoimentos = await response.json();

    depoimentos.forEach(depoimento => {
      const elemento = criarDepoimentoElemento(depoimento);
      listaDepoimentos.appendChild(elemento);
    });

  } catch (error) {
    console.error("Erro ao carregar depoimentos:", error);
    listaDepoimentos.innerHTML = `<p class="depoimento-item">Erro ao carregar depoimentos do servidor.</p>`;
  }
}

async function salvarDepoimento(nome, texto) {
  if (!nome || !texto) {
    alert('Por favor, preencha o nome e o texto do depoimento.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/depoimentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, texto })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    document.getElementById('inputDepoimento').value = '';
    document.getElementById('nomeDepoimento').value = '';
    alert('Depoimento enviado com sucesso!');

    await carregarDepoimentos();

  } catch (error) {
    console.error("Erro ao salvar depoimento:", error);
    alert(`Erro ao salvar depoimento. Detalhe: ${error.message}.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btnEnviarDepoimento');

  if (btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      const nome = document.getElementById('nomeDepoimento').value;
      const texto = document.getElementById('inputDepoimento').value;
      salvarDepoimento(nome, texto);
    });
  }

  const btnLimpar = document.getElementById('btnLimpar');
  if (btnLimpar && btnLimpar.getAttribute('onclick') === null) {
    btnLimpar.addEventListener('click', limparTextoArea);
  }

  carregarDepoimentos();

  // Verificar suporte ao carregar a página
  console.log("Suporte a Speech Recognition:", !!SpeechRecognition);
  console.log("Suporte a Speech Synthesis:", !!SpeechSynthesis);
});

function enviarDepoimento() {
  const nome = document.getElementById('nomeDepoimento').value;
  const texto = document.getElementById('inputDepoimento').value;
  salvarDepoimento(nome, texto);
}