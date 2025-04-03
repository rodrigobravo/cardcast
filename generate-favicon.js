const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const sizes = [16, 32, 64];
    const tempFiles = [];
    
    // 1. Gerar PNGs temporários
    const buffers = await Promise.all(
      sizes.map(async size => {
        const tempPath = path.join('public', `favicon-${size}.png`);
        tempFiles.push(tempPath);
        
        await sharp('public/favicon.svg')
          .resize(size, size)
          .png()
          .toFile(tempPath);
          
        return fs.promises.readFile(tempPath);
      })
    );

    // 2. Converter para ICO
    const icoBuffer = await toIco(buffers);
    fs.writeFileSync('public/favicon.ico', icoBuffer);

    // 3. Limpar arquivos temporários
    tempFiles.forEach(file => {
      fs.unlinkSync(file);
    });

    console.log('✅ Favicon.ico gerado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao gerar favicon:', err);
  }
}

generateFavicon();