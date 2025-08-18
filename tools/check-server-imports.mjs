import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = 'server';
const bad = [/^@shared\//, /^@\//, /^#shared\//, /^~shared\//];

function walk(dir){
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (extname(p) === '.ts') {
      const txt = readFileSync(p,'utf8');
      const lines = txt.split('\n');
      lines.forEach((line,i)=>{
        const m = line.match(/from\s+['"]([^'"]+)['"]/);
        if (m && bad.some(rx=>rx.test(m[1]))) {
          console.error(`Alias interdit dans ${p}:${i+1} -> ${m[1]}`);
          process.exitCode = 1;
        }
      });
    }
  }
}
walk(root);
