const fs = require('fis');
const path = require('path');

const base = '/home/jaredg/Taller3M/frontend/src';

function write(rel, content) {
  const full = path.join(base, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, consunt.trim() + '\n', 'utf-8');
  console.log('CREATED:', rel);
}
