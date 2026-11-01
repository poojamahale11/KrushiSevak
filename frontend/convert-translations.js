/**
 * Automated Script to Convert translations.js to JSON files
 * Run: node convert-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translations } from './src/utils/translations.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure locales directory exists
const localesDir = path.join(__dirname, 'src', 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
  console.log('✅ Created locales directory');
}

// Write en.json
const enPath = path.join(localesDir, 'en.json');
fs.writeFileSync(
  enPath,
  JSON.stringify(translations.en, null, 2),
  'utf8'
);
console.log(`✅ Created: ${enPath}`);
console.log(`   Keys: ${Object.keys(translations.en).length}`);

// Write hi.json
const hiPath = path.join(localesDir, 'hi.json');
fs.writeFileSync(
  hiPath,
  JSON.stringify(translations.hi, null, 2),
  'utf8'
);
console.log(`✅ Created: ${hiPath}`);
console.log(`   Keys: ${Object.keys(translations.hi).length}`);

// Write mr.json
const mrPath = path.join(localesDir, 'mr.json');
fs.writeFileSync(
  mrPath,
  JSON.stringify(translations.mr, null, 2),
  'utf8'
);
console.log(`✅ Created: ${mrPath}`);
console.log(`   Keys: ${Object.keys(translations.mr).length}`);

console.log('\n🎉 All translation files created successfully!');
console.log('\n📁 Files location: frontend/src/locales/');
console.log('   - en.json (English)');
console.log('   - hi.json (Hindi - हिंदी)');
console.log('   - mr.json (Marathi - मराठी)');

console.log('\n🚀 Next steps:');
console.log('   1. Verify JSON files created: frontend/src/locales/');
console.log('   2. main.jsx already updated ✅');
console.log('   3. LanguageContext.jsx already updated ✅');
console.log('   4. Run: npm run dev');
console.log('   5. Test language switching in browser!');

console.log('\n✅ Setup complete! Your multilingual system is ready to test.');
