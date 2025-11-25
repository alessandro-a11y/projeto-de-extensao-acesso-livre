const API_URL = 'https://projeto-de-extensao-acesso-livre-backend.onrender.com';

// Elementos do DOM
const listaDepoimentos = document.getElementById('listaDepoimentos');
const textoParaTraduzir = document.getElementById('textoParaTraduzir');
const inputDepoimento = document.getElementById('inputDepoimento');

// Detecção universal de APIs
const SpeechRecognition = window.SpeechRecognition || 
                          window.webkitSpeechRecognition || 
                          window.mozSpeechRecognition || 
                          window.msSpeechRecognition ||
                          window.oSpeechRecognition;

const SpeechSynthesis = window.speechSynthesis;

let isRecognizing = false;
let currentRecognition = null;
let utteranceAtiva = null;

// ===== RECONHECIMENTO DE VOZ =====
function iniciarSpeechRecognition(targetElement) {
  if (isRecognizing && currentRecognition) {
    currentRecognition.stop();
    isRecognizing = false;
    return;
  }

  if (!SpeechRecognition) {
    console.warn("Speech Recognition não disponível");
    alert("⚠️ Seu navegador não suporta reconhecimento de voz. Use Chrome, Firefox, Edge ou Safari recente.");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    currentRecognition = recognition;
    
    // Configurações otimizadas para móveis
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    isRecognizing = true;

    recognition.onstart = function () {
      console.log("✓ Escutando...");
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
        targetElement.value = finalTranscript.trim();
        mostrarStatus("✓ Texto capturado", false);
      } else if (interimTranscript) {
        targetElement.value = interimTranscript;
        mostrarStatus("📝 " + interimTranscript, true);
      }
    };

    recognition.onerror = function (event) {
      const erros = {
        'no-speech': 'Nenhuma fala detectada. Fale mais alto ou mais perto.',
        'audio-capture': 'Nenhum microfone encontrado.',
        'network': 'Sem conexão de internet.',
        'permission-denied': 'Acesso ao microfone negado. Permita em Configurações.',
        'not-allowed': 'Reconhecimento não permitido.',
        'service-not-allowed': 'Serviço indisponível.',
        'bad-grammar': 'Erro na configuração.',
        'aborted': 'Reconhecimento cancelado.'
      };
      
      const mensagem = erros[event.error] || `Erro: ${event.error}`;
      console.error(`❌ ${mensagem}`);
      mostrarStatus(`❌ ${mensagem}`, false);
      
      if (event.error !== 'no-speech') {
        alert(`Erro: ${mensagem}`);
      }
      
      isRecognizing = false;
    };

    recognition.onend = function () {
      isRecognizing = false;
      currentRecognition = null;
      mostrarStatus("✓ Pronto", false);
    };

    // Timeout de 15 segundos para móveis
    setTimeout(() => {
      if (isRecognizing) {
        recognition.stop();
      }
    }, 15000);

    recognition.start();
    console.log("Reconhecimento iniciado");

  } catch (error) {
    console.error('Erro:', error);
    alert("Erro ao iniciar reconhecimento. Recarregue a página.");
    isRecognizing = false;
  }
}

// ===== SÍNTESE DE VOZ =====
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
    // Cancelar fala anterior
    window.speechSynthesis.cancel();
    utteranceAtiva = null;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      mostrarStatus("🔊 Falando...", true);
    };

    utterance.onend = () => {
      mostrarStatus("✓ Pronto", false);
    };

    utterance.onerror = (event) => {
      console.error("Erro na síntese:", event);
      mostrarStatus(`❌ Erro: ${event.error}`, false);
    };

    utteranceAtiva = utterance;
    window.speechSynthesis.speak(utterance);
    console.log("Síntese iniciada");

  } catch (error) {
    console.error('Erro:', error);
    alert("Erro ao falar texto.");
  }
}

function pararFala() {
  if (SpeechSynthesis) {
    window.speechSynthesis.cancel();
    utteranceAtiva = null;
    mostrarStatus("⏹️ Pausado", false);
  }
  
  if (isRecognizing && currentRecognition) {
    currentRecognition.stop();
    isRecognizing = false;
  }
}

// ===== FUNÇÕES AUXILIARES =====
function mostrarStatus(mensagem, ativo) {
  const statusEl = document.getElementById('statusVoz');
  if (statusEl) {
    statusEl.textContent = mensagem;
    statusEl.style.color = ativo ? '#ff9800' : '#4caf50';
  }
  console.log(mensagem);
}

function iniciarReconhecimento() {
  console.log("Botão: Falar para Converter - reconhecimento para área de tradução");
  iniciarSpeechRecognition(textoParaTraduzir);
}

function reconhecerDepoimento() {
  console.log("Botão: Falar para Depoimento - reconhecimento para campo de depoimento");
  iniciarSpeechRecognition(inputDepoimento);
}

function traduzirTexto() {
  alert("Função 'Traduzir para Libras' ativa. Use o VLibras para traduzir!");
  console.log("Tradução para Libras acionada");
}

function alternarAcessibilidade() {
  document.body.classList.toggle('alto-contraste');
  console.log("Alto contraste alternado");
}

// ===== DEPOIMENTOS =====
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
    const response = await fetch(`${API_URL}/api/depoimentos`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    const depoimentos = await response.json();

    if (!Array.isArray(depoimentos)) {
      throw new Error("Dados inválidos");
    }

    listaDepoimentos.innerHTML = '';

    if (depoimentos.length === 0) {
      listaDepoimentos.innerHTML = '<p style="text-align:center;">Nenhum depoimento ainda. Seja o primeiro! 🎉</p>';
      return;
    }

    // Adicionar depoimentos em ordem reversa (mais novo primeiro)
    depoimentos.reverse().forEach(depoimento => {
      const elemento = criarDepoimentoElemento(depoimento);
      listaDepoimentos.appendChild(elemento);
    });

    console.log(`✓ ${depoimentos.length} depoimento(s) carregado(s)`);

  } catch (error) {
    console.error("Erro ao carregar:", error);
    listaDepoimentos.innerHTML = `<p style="color:red; text-align:center;">❌ Erro ao carregar depoimentos</p>`;
  }
}

async function salvarDepoimento(nome, texto) {
  nome = String(nome).trim();
  texto = String(texto).trim();

  if (!nome || !texto) {
    alert('⚠️ Preencha seu nome e compartilhe sua experiência.');
    return;
  }

  if (nome.length > 100) {
    alert('Nome muito longo (máx. 100 caracteres).');
    return;
  }

  if (texto.length > 5000) {
    alert('Texto muito longo (máx. 5000 caracteres).');
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
      } catch (e) {
        console.error("Erro ao parsear resposta:", e);
      }
      throw new Error(errorMsg);
    }

    // Limpar campos
    const nomeInput = document.getElementById('nomeDepoimento');
    const textoInput = document.getElementById('inputDepoimento');
    
    if (nomeInput) nomeInput.value = '';
    if (textoInput) textoInput.value = '';
    
    alert('✅ Depoimento enviado com sucesso!');
    
    // Recarregar depoimentos
    setTimeout(() => carregarDepoimentos(), 500);

  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert(`❌ Erro: ${error.message}`);
  }
}

function enviarDepoimento() {
  const nome = (document.getElementById('nomeDepoimento')?.value || '').trim();
  const texto = (document.getElementById('inputDepoimento')?.value || '').trim();
  salvarDepoimento(nome, texto);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Botão enviar depoimento
    const btnEnviar = document.getElementById('btnEnviarDepoimento');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', enviarDepoimento);
    }

    // Botão limpar (já tem onclick no HTML, mas adiciona event listener também)
    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', () => {
        textoParaTraduzir.value = '';
        console.log("Área de tradução limpa");
      });
    }

    // Carregar depoimentos
    carregarDepoimentos();

    // Criar div de status se não existir
    if (!document.getElementById('statusVoz')) {
      const status = document.createElement('div');
      status.id = 'statusVoz';
      status.style.cssText = 'text-align:center; color:#4caf50; font-weight:bold; margin:10px 0; font-size:14px;';
      status.textContent = '✓ Sistema pronto';
      document.body.insertBefore(status, document.body.firstChild);
    }

    // Log de diagnóstico
    console.log('=== ACESSO LIVRE - DIAGNÓSTICO ===');
    console.log('Speech Recognition:', !!SpeechRecognition);
    console.log('Speech Synthesis:', !!SpeechSynthesis);
    console.log('User Agent:', navigator.userAgent);
    console.log('Plataforma:', navigator.platform);
    console.log('Sistema:', getBrowserInfo());
    console.log('=================================');

  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
});

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Win/.test(ua)) return 'Windows';
  if (/Mac/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Desconhecido';
}