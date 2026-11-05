// 교과서 네 권의 Part · 챕터 · 용어 · 해결법을 검색용 목록으로 뽑는다(위젯용 search.json).
// index.html의 내용 부분(DETAIL1 ~ BOOKDATA)만 Node에서 실행해 홈 검색과 같은 자료를 만든다.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { GLOSSARY } from './glossary.mjs';

const BOOK_LABEL = { intro: '입문', novice: '초보자', mid: '중수', pro: '전문가', dict: '용어 사전' };
const key = w => w.toLowerCase().replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+/g, '');

export function buildSearchIndex(file = 'index.html') {
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const end = scripts[1].indexOf('/* ---------- 지금 펼친 교과서');
  if (scripts.length < 2 || end < 0) throw new Error('index.html 구조가 예상과 달라요: 내용 부분을 찾지 못했어요');
  const code = scripts[0] + '\n' + scripts[1].slice(0, end) + `
;globalThis.__idx = (() => {
  const out = [];
  Object.values(BOOKDATA).forEach(bk => {
    const seen = new Set();
    bk.parts.forEach((p, i) => {
      if (!ready(p)) return;
      const part = 'Part ' + pad(i) + ' ' + p.title;
      out.push({ k: 'p', b: bk.id, w: p.title, m: bk.name + ' · 챕터 ' + p.lessons.length + '개', at: 'Part ' + pad(i) });
      p.lessons.forEach((l, j) => {
        const key = i + '-' + (j + 1);
        out.push({ k: 'c', b: bk.id, w: l[0], m: l[1], tags: l[2] || [], at: part + ' · ' + key });
        ((bk.detail[key] || {}).t || []).forEach(([term, r, m]) => {
          if (seen.has(term)) return; seen.add(term);
          const [o, rd] = r.includes('|') ? r.split('|') : ['', r];
          out.push({ k: 't', b: bk.id, w: term, o, r: rd, m, at: key + ' ' + l[0] });
        });
      });
      // 실습 슬라이드의 ‘막혔을 때’: w = 증상, m = 해결법
      (p.stuck || []).forEach(([q, a]) => out.push({ k: 's', b: bk.id, w: q, m: a, at: part + ' · 실습' }));
    });
  });
  return out;
})();`;
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: 'index.html(내용 부분)' });
  // 일반 용어 사전: 교과서에 이미 있는 용어는 빼요(교과서 쪽이 어디서 배우는지까지 알려 주니까)
  const items = ctx.__idx;
  const have = new Set(items.filter(x => x.k === 't').map(x => key(x.w)));
  for (const [cat, rows] of Object.entries(GLOSSARY)) {
    for (const [w, o, r, m] of rows) {
      if (have.has(key(w))) continue;
      have.add(key(w));
      items.push({ k: 't', b: 'dict', w, o, r, m, at: cat });
    }
  }
  return { books: BOOK_LABEL, items };
}
