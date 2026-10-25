import fs from 'node:fs';
const root=new URL('./',import.meta.url),dist=new URL('dist/',root),read=f=>fs.readFileSync(new URL(f,dist),'utf8').replace(/^\uFEFF/,'');
let page=read('index.html');page=page.replace('<link rel="manifest" href="manifest.webmanifest">','').replace('<link rel="icon" href="icon.svg" type="image/svg+xml">','').replace('<link rel="stylesheet" href="style.css">','<style>'+read('style.css')+'</style>');
page=page.replace('<script src="questions.js"></script><script src="engine.js"></script><script src="app.js"></script>','<script>'+['questions.js','engine.js','app.js'].map(read).join('\n')+'</script>');
fs.writeFileSync(new URL('English-Lab-500.html',root),page,'utf8');fs.writeFileSync(new URL('English-Lab.html',root),page,'utf8');
console.log('Self-contained HTML: '+Buffer.byteLength(page)+' bytes');
