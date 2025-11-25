const API_URL = 'https://projeto-de-extensao-acesso-livre-backend.onrender.com';

const listaDepoimentos = document.getElementById('listaDepoimentos');
const textoParaTraduzir = document.getElementById('textoParaTraduzir');
const inputDepoimento = document.getElementById('inputDepoimento');
const campoLibrasVisual = document.getElementById('campoLibrasVisual');

const SpeechRecognition = window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.msSpeechRecognition ||
  window.oSpeechRecognition;

const SpeechSynthesis = window.speechSynthesis;

let isRecognizing = false;
let currentRecognition = null;
let utteranceAtiva = null;
const FONT_STEP = 0.1;
const MAX_FONT_SCALE = 2.0;
const MIN_FONT_SCALE = 1.0;

let fonteAumentada = false;

function mostrarStatus(mensagem, ativo) {
  const statusEl = document.getElementById('statusVoz');
  if (statusEl) {
    statusEl.textContent = mensagem;
    statusEl.style.color = ativo ? '#ff9800' : '#4caf50';
    if (mensagem.includes('❌') || mensagem.includes('Erro')) {
      statusEl.style.color = '#f44336';
    }
  }
  console.log(`Status: ${mensagem}`);
}

function escapeHtml(texto) {
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(texto).replace(/[&<>"']/g, char => mapa[char] || char);
}

function iniciarSpeechRecognition(targetElement) {
  if (isRecognizing && currentRecognition) {
    currentRecognition.stop();
    isRecognizing = false;
    return;
  }

  if (!SpeechRecognition) {
    console.warn("Speech Recognition não disponível");
    alert("⚠️ Seu navegador não suporta reconhecimento de voz.");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    currentRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    isRecognizing = true;

    recognition.onstart = function () {
      mostrarStatus("🎤 Ouvindo...", true);
    };

    recognition.onresult = function (event) {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        targetElement.value = targetElement.value ? targetElement.value + ' ' + finalTranscript.trim() : finalTranscript.trim();
        mostrarStatus("✓ Texto capturado", false);
      } else if (interimTranscript) {
        mostrarStatus(`📝 ${interimTranscript}`, true);
      }
    };

    recognition.onerror = function (event) {
      const erros = {
        'no-speech': 'Nenhuma fala detectada.',
        'audio-capture': 'Nenhum microfone encontrado.',
        'network': 'Sem conexão de internet.',
        'permission-denied': 'Acesso ao microfone negado.',
        'not-allowed': 'Reconhecimento não permitido.',
      };

      const mensagem = erros[event.error] || `Erro: ${event.error}`;
      console.error(`❌ ${mensagem}`);
      mostrarStatus(`❌ ${mensagem}`, false);

      isRecognizing = false;
      currentRecognition = null;
    };

    recognition.onend = function () {
      isRecognizing = false;
      currentRecognition = null;
      mostrarStatus("✓ Pronto", false);
    };

    recognition.start();

  } catch (error) {
    console.error('Erro ao iniciar reconhecimento:', error);
    alert("Erro ao iniciar reconhecimento. Recarregue a página.");
    isRecognizing = false;
  }
}

function falarTexto() {
  if (!SpeechSynthesis) {
    alert("❌ Seu navegador não suporta áudio.");
    return;
  }

  const texto = textoParaTraduzir.value.trim();
  if (!texto) {
    alert("Digite algo para ouvir.");
    return;
  }

  try {
    window.speechSynthesis.cancel();
    utteranceAtiva = null;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => { mostrarStatus("🔊 Falando...", true); };
    utterance.onend = () => { mostrarStatus("✓ Pronto", false); };
    utterance.onerror = (event) => {
      console.error("Erro na síntese:", event);
      mostrarStatus(`❌ Erro: ${event.error}`, false);
    };

    utteranceAtiva = utterance;
    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.error('Erro ao falar texto:', error);
    alert("Erro ao falar texto.");
  }
}

function iniciarReconhecimento() {
  // CORRIGIDO: Agora chama a função de reconhecimento de voz e direciona para o campo de texto.
  iniciarSpeechRecognition(textoParaTraduzir);
}

function reconhecerDepoimento() {
  iniciarSpeechRecognition(inputDepoimento);
}

function limparTextoArea() {
  textoParaTraduzir.value = '';
  if (campoLibrasVisual) {
    campoLibrasVisual.textContent = '';
  }
  console.log("Área de tradução limpa");
}

function traduzirTexto() {
  const texto = textoParaTraduzir.value.trim();

  if (!texto) {
    mostrarStatus("⚠️ Digite um texto para traduzir.", false);
    if (campoLibrasVisual) {
      campoLibrasVisual.textContent = '';
    }
    return;
  }

  if (campoLibrasVisual) {
    campoLibrasVisual.textContent = texto;
    mostrarStatus("", false);
  }

  console.log("Tradução para Libras acionada. Texto: " + texto);
}

function alternarAcessibilidade() {
  document.body.classList.toggle('alto-contraste');
  console.log("Alto contraste alternado");
}

function alternarTamanhoFonte() {
  const btnFonte = document.getElementById('btnAlternarFonte');

  if (!fonteAumentada) {
    const newScale = MAX_FONT_SCALE;
    document.documentElement.style.setProperty('--font-scale', newScale.toFixed(2));

    btnFonte.innerHTML = '🔡 Diminuir Fonte';
    fonteAumentada = true;
    console.log(`Fonte aumentada para ${newScale.toFixed(2)}x`);

  } else {
    const newScale = MIN_FONT_SCALE;
    document.documentElement.style.setProperty('--font-scale', newScale.toFixed(2));

    btnFonte.innerHTML = '🔠 Aumentar Fonte';
    fonteAumentada = false;
    console.log(`Fonte restaurada para ${newScale.toFixed(2)}x`);
  }
}

function criarDepoimentoElemento(depoimento) {
  const div = document.createElement('div');
  div.classList.add('depoimento-item');

  try {
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

    div.innerHTML = `
<strong>${escapeHtml(depoimento.nome)}</strong> — ${dataFormatada} · ${horaFormatada}
<p>${escapeHtml(depoimento.texto)}</p>
`;
  } catch (error) {
    console.error("Erro ao criar depoimento:", error);
    div.innerHTML = '<p>Erro ao carregar depoimento</p>';
  }

  return div;
}

async function carregarDepoimentos() {
  if (!listaDepoimentos) return;

  listaDepoimentos.innerHTML = '<p style="text-align:center;">⏳ Carregando depoimentos...</p>';

  try {
    const response = await fetch(`${API_URL}/api/depoimentos`);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const depoimentos = await response.json();

    if (!Array.isArray(depoimentos)) {
      throw new Error("Resposta da API inválida.");
    }

    listaDepoimentos.innerHTML = '';

    if (depoimentos.length === 0) {
      listaDepoimentos.innerHTML = '<p style="text-align:center;">Nenhum depoimento ainda. Seja o primeiro! 🎉</p>';
      return;
    }

    depoimentos.reverse().forEach(depoimento => {
      const elemento = criarDepoimentoElemento(depoimento);
      listaDepoimentos.appendChild(elemento);
    });

  } catch (error) {
    console.error("Erro ao carregar depoimentos:", error);
    listaDepoimentos.innerHTML = `<p style="color:red; text-align:center;">❌ Erro ao carregar depoimentos do servidor.</p>`;
  }
}

async function salvarDepoimento(nome, texto) {
  nome = String(nome).trim();
  texto = String(texto).trim();

  if (!nome || !texto) {
    alert('⚠️ Preencha seu nome e compartilhe sua experiência.');
    return;
  }

  if (nome.length > 100 || texto.length > 5000) {
    alert('⚠️ Nome (máx. 100) ou texto (máx. 5000) muito longos.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/depoimentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ nome, texto })
    });

    if (!response.ok) {
      let errorMsg = `Erro ${response.status}`;
      try {
        const data = await response.json();
        errorMsg = data.error || data.message || errorMsg;
      } catch (e) { /* ignore */ }
      throw new Error(errorMsg);
    }

    const nomeInput = document.getElementById('nomeDepoimento');
    const textoInput = document.getElementById('inputDepoimento');

    if (nomeInput) nomeInput.value = '';
    if (textoInput) textoInput.value = '';

    alert('✅ Depoimento enviado com sucesso!');

    setTimeout(() => carregarDepoimentos(), 500);

  } catch (error) {
    console.error("Erro ao salvar depoimento:", error);
    alert(`❌ Erro ao salvar depoimento. Detalhe: ${error.message}`);
  }
}

function enviarDepoimento() {
  const nome = (document.getElementById('nomeDepoimento')?.value || '').trim();
  const texto = (document.getElementById('inputDepoimento')?.value || '').trim();
  salvarDepoimento(nome, texto);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const btnEnviar = document.getElementById('btnEnviarDepoimento');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', enviarDepoimento);
    }

    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', limparTextoArea);
    }

    if (!document.documentElement.style.getPropertyValue('--font-scale')) {
      document.documentElement.style.setProperty('--font-scale', MIN_FONT_SCALE.toFixed(2));
    }

    carregarDepoimentos();

  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
});

window.iniciarReconhecimento = iniciarReconhecimento;
window.reconhecerDepoimento = reconhecerDepoimento;
window.falarTexto = falarTexto;
window.traduzirTexto = traduzirTexto;
window.alternarAcessibilidade = alternarAcessibilidade;
window.alternarTamanhoFonte = alternarTamanhoFonte;
window.limparTextoArea = limparTextoArea;
window.enviarDepoimento = enviarDepoimento;