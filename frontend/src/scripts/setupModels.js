const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../../public/models');
const SOURCE_DIR = path.join(__dirname, '../../node_modules/@vladmandic/face-api/model');

const MODEL_FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
  'face_expression_model-weights_manifest.json',
  'face_expression_model.bin'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Copy model files
function copyModels() {
  console.log('Copying face-api.js models...');
  
  MODEL_FILES.forEach(filename => {
    const sourcePath = path.join(SOURCE_DIR, filename);
    const destPath = path.join(MODELS_DIR, filename);
    
    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${filename} successfully`);
    } catch (err) {
      console.error(`Error copying ${filename}:`, err);
      process.exit(1);
    }
  });
  
  console.log('All models copied successfully!');
}

copyModels(); 