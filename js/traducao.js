
const API_URL = 'https://projeto-de-extensao-acesso-livre-backend.onrender.com'; 
const listaDepoimentos = document.getElementById('listaDepoimentos');



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

    carregarDepoimentos();
});


function enviarDepoimento() {
    const nome = document.getElementById('nomeDepoimento').value;
    const texto = document.getElementById('inputDepoimento').value;
    salvarDepoimento(nome, texto);
}