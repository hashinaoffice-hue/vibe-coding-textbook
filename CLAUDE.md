# 바이브 코딩 교과서

코딩을 처음 배우는 사람을 위한 바이브 코딩 입문 커리큘럼. 홈(첫 화면) + PC로 넘겨 보는 16:9 슬라이드 교과서 형태의 단일 HTML 페이지.

- 배포 위치: claude.ai Artifact — https://claude.ai/artifact/MuRU8dVsYELWPz8DbEqWNC
  - 수정 후 같은 링크에 다시 올릴 때는 Artifact 도구에 `url`로 이 주소를 넘긴다. 새 세션에서는 먼저 `action: "read"`로 읽은 뒤 publish.
  - `<!doctype>`, `<html>`, `<head>`, `<body>` 태그는 쓰지 않는다 (Artifact가 자동으로 감싼다).

## 파일 구조

`index.html` 하나에 모든 것이 들어 있다. 위에서부터:

1. `<style>` — 디자인 토큰(`:root` = 다크 기본, `:root[data-mode="light"]` = 라이트), 앱 틀(실제 px), 슬라이드(1920×1080 단위), 상세 팝업, SVG 그림 클래스
2. 첫 번째 `<script>` — `DETAIL`: 챕터별 상세 팝업 내용. 키는 `"Part-챕터"`(예: `"1-4"`)
   - `s` 개념 문단, `p` 핵심 포인트 3개, `t` 용어 `[용어, '원어|읽는 법', 뜻]`(원어가 없으면 `'|읽는 법'`), `e` 선택 예시 `[제목, 본문]`
3. 두 번째 `<script>`
   - SMIL 도우미(`an`, `mv`, `vis`, `draw`, `pop`, `arrow`)
   - `FIG` — 그림 함수. 모두 `viewBox="0 0 400 300"`(4:3), `data-rest`는 처음 보여줄 프레임(초)
   - `STAGES`, `PARTS` — 커리큘럼 본문 (12 Part, 68 챕터)
   - 슬라이드 빌더(표지 → 구성 → 단계 표지 → Part마다 개념/챕터 2장 → 마치며 = 31장), 목차, 화면 맞춤, 넘기기, 진도(localStorage), 복사, 라이트/다크, 상세 팝업
   - 홈(첫 화면) — `show('home'|'book')`으로 홈(`#home`)과 교과서(`.app`)를 바꾼다. 주소 해시가 `#book`이나 슬라이드 키(`p3`, `s1` 등)면 교과서로 바로 열린다.
     - 위: 반쯤 걸친 원 안의 도트(canvas `#dotCv`), 마우스 근처 도트가 커지며 빛남
     - 가운데: 챕터·용어 검색(`IDX` = Part · 챕터 · `DETAIL` 용어). 결과를 누르면 해당 슬라이드/상세 팝업으로 이동
     - 아래: 큰 원 둘레를 도는 수준별 교과서 `BOOKS`(입문/초보자/중수/전문가). 지금은 입문용만 `ready`, 나머지는 준비 중
     - 배경: 은은한 신경망 모션(canvas `#bgCv`). 홈은 스크롤 없이 한 화면 고정

## 사용자 선호 (꼭 지킬 것)

- 대상은 완전 초보자. 문체는 해요체, 짧고 쉬운 문장.
- UI·글씨·아이콘은 크지 않게. 여백은 넉넉히, 간격(4/8 배수)과 정렬의 일관성이 가장 중요.
- 테마: 블랙 + 에메랄드 그린(기본 다크), 라이트 모드 토글 지원. 오래 봐도 눈이 편하도록 충분한 명도 대비 유지.
- 그림 안 글자·도형이 서로 겹치면 안 된다. 그림을 고친 뒤에는 아래 겹침 검사를 돌린다.
- 왼쪽 목차 사이드바는 라이트/다크에서 모양이 같아야 한다.

## 검증

브라우저에서 파일을 연 뒤 콘솔에서 실행:

```js
// 슬라이드 넘침 + SVG 글자 겹침 검사 (교차 페이드로 의도된 겹침은 결과에 나올 수 있음)
document.querySelectorAll('svg.fg').forEach(sv=>{
  const ts=[...sv.querySelectorAll('text')].map(t=>({t:t.textContent,b:t.getBBox()}));
  for(let a=0;a<ts.length;a++)for(let b=a+1;b<ts.length;b++){const A=ts[a].b,B=ts[b].b;
    if(Math.min(A.x+A.width,B.x+B.width)-Math.max(A.x,B.x)>1&&Math.min(A.y+A.height,B.y+B.height)-Math.max(A.y,B.y)>2)
      console.log(sv.getAttribute('aria-label'),ts[a].t,'×',ts[b].t);}
});
// 상세 팝업이 스크롤 없이 들어가는지
PARTS.forEach((p,i)=>p.lessons.forEach((l,j)=>{const k=`${i}-${j+1}`;openD(k);const b=document.getElementById('dlgB');if(b.scrollHeight>b.clientHeight+2)console.log('overflow',k);}));
```
