import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

  // Replace deleteDoc(doc(db, "coll", id)) with apiFetch(`/collections/coll/${id}`, { method: 'DELETE' })
  content = content.replace(/await deleteDoc\(doc\(db,\s*["']([^"']+)["'],\s*([^)]+)\)\)/g, "await apiFetch(`/collections/$1/${$2}`, { method: 'DELETE' })");
  
  // Replace updateDoc(doc(db, "coll", id), data) with apiFetch(`/collections/coll/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  content = content.replace(/await updateDoc\(doc\(db,\s*["']([^"']+)["'],\s*([^)]+)\),\s*([^)]+)\)/g, "await apiFetch(`/collections/$1/${$2}`, { method: 'PUT', body: JSON.stringify($3) })");

  // Replace addDoc(collection(db, "coll"), data) with apiFetch(`/collections/coll`, { method: 'POST', body: JSON.stringify(data) })
  content = content.replace(/await addDoc\(collection\(db,\s*["']([^"']+)["']\),\s*({[^}]+})\)/g, "await apiFetch(`/collections/$1`, { method: 'POST', body: JSON.stringify($2) })");

  // Replace getDoc(doc(db, "coll", id)) with apiFetch(`/collections/coll/${id}`)
  // This is trickier if it expects .exists() or .data(). Let's handle LaptopForm.jsx manually if needed.

  fs.writeFileSync(path.join(pagesDir, file), content);
}
console.log('Migration script run.');
