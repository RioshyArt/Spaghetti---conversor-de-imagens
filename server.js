// server.js

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({storage:multer.memoryStorage()});

app.use(express.static(path.join(__dirname,'public')));

// Define a rota POST para o upload e conversão de imagens
app.post('/upload-e-converter', upload.array('imagens'), async (req,res)=>{
    const arquivosRecebidos = req.files;
    const formatoSaida = req.body.formato;

    if(!arquivosRecebidos || arquivosRecebidos.length === 0){
        return res.status(400).send('Nenhuma imagem foi enviada ou arquivos inválidos');
    }

    const archive = archiver('zip',{
        zlib:{level: 9}
    });

    res.set('Content-Type','application/zip');
    res.set('Content-Disposition', 'attachment; filename="imagens_convertidas.zip"');         
    archive.pipe(res);

    // Início do loop para processar cada arquivo
    for (const arquivo of arquivosRecebidos){
        const bufferOriginal = arquivo.buffer;
        const nomeOriginal = arquivo.originalname;
        const nomeBase = path.parse(nomeOriginal).name;
        const nomeArquivoConvertido = `${nomeBase}.${formatoSaida}`;

        // Início do bloco try para tratamento de erros por arquivo
        try{
            let imagemSharp = sharp(bufferOriginal);

            switch(formatoSaida){
                case 'jpeg':
                    imagemSharp = imagemSharp.jpeg({quality:80});
                    break;

                case 'png':
                    imagemSharp = imagemSharp.png({compressionLevel:9});
                    break;

                case 'webp':
                    // CORREÇÃO CRÍTICA: Removido o espaço entre 'webp' e '('.
                    // A atribuição também estava incorreta.
                    imagemSharp = imagemSharp.webp({quality:80});
                    break;

                case 'tiff':
                    imagemSharp = imagemSharp.tiff();
                    break;

                case 'gif':
                    imagemSharp = imagemSharp.gif();
                    break;

                default:    
                    console.warn(`Formato de saída '${formatoSaida}' não suportado ou inválido para '${nomeOriginal}'.`);
                    continue; // Pula para o próximo arquivo no loop
            } 

            const bufferConvertido = await imagemSharp.toBuffer();
            archive.append(bufferConvertido, { name: nomeArquivoConvertido });

        // Fim do bloco try, início do catch para erros de conversão por arquivo
        } catch(error){
            console.error(`Erro ao converter imagem '${nomeOriginal}' para ${formatoSaida}:`, error);
        }
    } // Fim do loop 'for'

    await archive.finalize(); // Finaliza o arquivo ZIP

}); // Fim da rota 'app.post'

// Inicia o servidor Express na porta definida
// Este bloco DEVE estar FORA da rota 'app.post'.
app.listen(port,()=>{
    console.log(`Servidor Rodando em http://localhost:${port}`);
    console.log(`Para testar localmente, acesse http://localhost:${port}/ no seu navegador.`);
    console.log(`Aguardando requisições de conversão...`);
});