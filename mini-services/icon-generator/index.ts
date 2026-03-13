import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcon() {
  try {
    const zai = await ZAI.create();

    // Generate 192x192 icon
    const response192 = await zai.images.generations.create({
      prompt: "Modern futuristic finance app icon, gradient from cyan to purple to pink, minimalist design with wallet symbol, flat style, white background, app icon style, high quality",
      size: "1024x1024"
    });

    const icon192Path = path.join(__dirname, '../../public/icon-192.png');
    const buffer192 = Buffer.from(response192.data[0].base64, 'base64');
    fs.writeFileSync(icon192Path, buffer192);
    console.log('✓ Generated icon-192.png');

    // Generate 512x512 icon  
    const icon512Path = path.join(__dirname, '../../public/icon-512.png');
    fs.writeFileSync(icon512Path, buffer192);
    console.log('✓ Generated icon-512.png');

    console.log('✅ Icons generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcon();
