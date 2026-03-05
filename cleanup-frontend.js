import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  let changed = false;

  if (content.includes('apiFetch') && !content.includes("import { apiFetch }")) {
    content = content.replace(/(import React[^;]*;)/, "$1\nimport { apiFetch } from '../api';");
    changed = true;
  }

  if (content.includes('firebase/firestore') || content.includes('firebase/config')) {
    content = content.replace(/import\s+{?[^}]+}?\s+from\s+["']firebase\/firestore["'];?/g, '');
    content = content.replace(/import\s+{?[^}]+}?\s+from\s+["']\.\.\/firebase\/config["'];?/g, '');
    changed = true;
  }

  if (content.includes('getDoc(')) {
    content = content.replace(/const (\w+) = await getDoc\(doc\(db,\s*["']([^"']+)["'],\s*([^)]+)\)\);/g, "const $1 = await apiFetch(`/collections/$2/${$3}`);");
    content = content.replace(/if \(\w+\.exists\(\)\) {\s*const (\w+) = \w+\.data\(\);/g, "if ($1) { const $1_data = $1;");
    content = content.replace(/const data = d.data\(\);/g, "const data = d;"); // for LaptopForm
    content = content.replace(/if \(d.exists\(\)\) {/g, "if (d) {");
    changed = true;
  }

  if (content.includes('Timestamp.now()') || content.includes('serverTimestamp()')) {
    content = content.replace(/Timestamp\.now\(\)/g, "new Date().toISOString()");
    content = content.replace(/serverTimestamp\(\)/g, "new Date().toISOString()");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(path.join(pagesDir, file), content);
  }
}
console.log('Cleanup script run.');
