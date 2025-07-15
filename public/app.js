const imagemUpload = document.getElementById('upload');
const converterBtn = document.getElementById('converter');
const mensagem = document.getElementById('mensagem');
const downloadLink = document.getElementById('downloadLink');
const formatoSaidaSelect = document.getElementById('formatoSaida');

converterBtn.addEventListener('click', async () => {
    const arquivos = imagemUpload.files;
    const formatoSaidaValor = formatoSaidaSelect.value; 

    if (arquivos.length === 0) {
        mensagem.textContent = "Por favor, selecione uma ou mais imagens para dar certo!";
        mensagem.classList.add('error');
        mensagem.classList.remove('success');
        return;
    }

    mensagem.textContent = `Convertendo ${arquivos.length} imagem(ns) para ${formatoSaidaValor.toUpperCase()}... Aguarde, estamos trabalhando!`;
    downloadLink.style.display = 'none';

    const formData = new FormData();
    for (let i = 0; i < arquivos.length; i++) {
        formData.append('imagens', arquivos[i]);
    }
    formData.append('formato', formatoSaidaValor);

    try {
        const response = await fetch('/upload-e-converter', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            downloadLink.href = url;
            downloadLink.download = `imagens_convertidas_${Date.now()}.zip`;
            downloadLink.textContent = `Baixar Imagens Convertidas (${formatoSaidaValor.toUpperCase()}s)`;
            downloadLink.style.display = 'block';

            mensagem.textContent = `Conversão de ${arquivos.length} imagem Prontinho! Clique para baixar o ZIP :3.`;
            mensagem.classList.add('success');
            mensagem.classList.remove('error');
        } else {
            const erroTexto = await response.text();
            mensagem.textContent = `Erro na conversão: ${erroTexto || response.statusText}`;
            mensagem.classList.add('error');
            mensagem.classList.remove('success');
            console.error("Erro do servidor:", response.status, erroTexto);
        }
    } catch (error) {
        mensagem.textContent = `Erro de rede ou servidor: ${error.message}`;
        mensagem.classList.add('error');
        mensagem.classList.remove('success');
        console.error("Erro no frontend ao fazer requisição:", error);
    }
});
