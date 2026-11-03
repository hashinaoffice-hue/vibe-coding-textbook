// Vercel 배포용: index.html(Artifact용 조각)에 페이지 틀을 씌워 dist/index.html로 만든다.
// index.html은 Artifact가 틀을 자동으로 씌우므로 doctype · head · body가 없다.
// 검색 위젯용 dist/search.json · dist/widget.html도 함께 만든다.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { buildSearchIndex } from './search-index.mjs';

const src = readFileSync('index.html', 'utf8').split('\n');
let i = 0;
while (i < src.length && /^<(title|link|meta)\b/.test(src[i].trim())) i++;
const head = src.slice(0, i).join('\n');
const body = src.slice(i).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="바이브 코딩을 배우는 사람을 위한 수준별 교과서 모음">
${head}
</head>
<body>
${body}
</body>
</html>
`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log(`dist/index.html (${html.length} bytes)`);

// 검색 위젯(바이브 코딩 사전): 화면은 desktop/widget.html, 자료는 search.json
const idx = buildSearchIndex('index.html');
writeFileSync('dist/search.json', JSON.stringify(idx));
copyFileSync('desktop/widget.html', 'dist/widget.html');
console.log(`dist/search.json (${idx.items.length}개 항목), dist/widget.html`);
