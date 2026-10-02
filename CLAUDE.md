# 바이브 코딩 백과사전

바이브 코딩을 배우는 사람을 위한 수준별 교과서 모음. 홈(첫 화면) + PC로 넘겨 보는 16:9 슬라이드 교과서(입문용 · 초보자용 …) 형태의 단일 HTML 페이지.

- 배포 위치: claude.ai Artifact — https://claude.ai/artifact/MuRU8dVsYELWPz8DbEqWNC
  - 수정 후 같은 링크에 다시 올릴 때는 Artifact 도구에 `url`로 이 주소를 넘긴다. 새 세션에서는 먼저 `action: "read"`로 읽은 뒤 publish.
  - `<!doctype>`, `<html>`, `<head>`, `<body>` 태그는 쓰지 않는다 (Artifact가 자동으로 감싼다).

## 작업 방식

- 모든 교과서(입문 · 초보자 · 중수 · 전문가)를 다 만들 때까지 작업 브랜치에서만 작업하고 main은 건드리지 않는다. 다 만든 뒤 처음부터 재검토하고, 새 PR로 한 번에 합친다.
- 링크(Artifact)에는 브랜치의 최신 내용을 바로 올린다.

## 파일 구조

`index.html` 하나에 모든 것이 들어 있다. 교과서는 네 권이고(입문용 · 초보자용 · 중수용 · 전문가용 모두 완성), 같은 엔진으로 그린다. 위에서부터:

1. `<style>` — 디자인 토큰(`:root` = 다크 기본, `:root[data-mode="light"]` = 라이트), 앱 틀(실제 px), 슬라이드(1920×1080 단위), 상세 팝업, SVG 그림 클래스, 홈, 여러 권 공통(준비 중 · 깊이 표시 `.dp` · 실습 슬라이드 `.px`)
2. 첫 번째 `<script>` — `DETAIL1`: 입문용 챕터별 상세 팝업 내용. 키는 `"Part-챕터"`(예: `"1-4"`)
   - `s` 개념 문단, `p` 핵심 포인트 3개, `t` 용어 `[용어, '원어|읽는 법', 뜻]`(원어가 없으면 `'|읽는 법'`), `e` 선택 예시 `[제목, 본문]`, `w` 선택 흔한 실수 목록(초보자용 '깊게' 챕터)
3. 두 번째 `<script>`
   - SMIL 도우미(`an`, `mv`, `vis`, `draw`, `pop`, `arrow`)
   - `FIG` — 입문용 그림(`hero`, `f0`~`f11`). 모두 `viewBox="0 0 400 300"`(4:3), `data-rest`는 처음 보여줄 프레임(초)
   - `STAGES1`, `PARTS1` — 입문용 본문 (12 Part, 68 챕터)
   - 초보자용(바이브 코딩 실습서): `NFIG`(그림 `hero`, `n0`~), `STAGES2`, `PARTS2`, `DETAIL2`, `NOVICE`(표지 · 구성 · 마치며 · 저장 키)
     - 레슨은 `[제목, 한 줄 설명, 태그, 깊이]`. 깊이 `'d'` = 깊게, `'l'` = 가볍게
     - Part에 `result`, `steps`([설명, 복사할 문장?]), `stuck`([증상, 해결])가 있으면 세 번째 '실습' 슬라이드가 붙는다
     - 아직 안 쓴 Part는 `{short, title, todo:true}` — 목차와 구성에 '준비 중'으로만 보인다
   - 중수용(바이브 코딩 실전서): `MFIG`(그림 `hero`, `m0`~), `STAGES3`, `PARTS3`, `DETAIL3`, `MID`. 형식은 초보자용과 같다
   - 전문가용(바이브 코딩 운영서): `EFIG`(그림 `hero`, `e0`~), `STAGES4`, `PARTS4`, `DETAIL4`, `PRO`. 형식은 같다
   - `BOOKDATA` — 권 목록(`intro`, `novice`, `mid`, `pro`). 권마다 `stages/parts/detail/fig/cover/end/how`와 진도 · 슬라이드 저장 키가 다르다
   - 엔진: `loadBook(id)`가 슬라이드(표지 → 구성 → 단계 표지 → Part마다 개념/챕터(/실습) → 마치며), 목차, 진도를 다시 그린다. 화면 맞춤, 넘기기, 진도(localStorage), 복사(`data-copy`는 복사할 요소 id), 라이트/다크, 상세 팝업
   - 목차 사이드바 맨 아래 버튼은 [라이트/다크 모드][홈으로]. 스크롤바는 숨김(내용이 넘치면 휠로만 스크롤). 그림은 '움직임 줄이기' OS 설정일 때만 멈춤
   - 홈(첫 화면) — `show('home'|'book')`으로 홈(`#home`)과 교과서(`.app`)를 바꾼다. 주소 해시 `#book` = 입문용, `#novice` = 초보자용, `#mid` = 중수용, `#pro` = 전문가용(권의 `hash`로 찾는다). 예전 슬라이드 키(`#p3`, `#s1` 등)는 입문용으로 열린다.
     - 위: 원자 모양 도트(canvas `#dotCv`, 테두리 없음). 피보나치 구(핵) + 기울어진 궤도 3개 + 전자. 중심이 화면 맨 위라 아래 절반만 보이고 천천히 돌며, 마우스 근처 도트는 밀려나며 밝게 빛남
     - 제목 "바이브 코딩 백과사전"은 원자와 검색창 사이
     - 가운데: 챕터·용어 검색(`IDX` = 모든 권의 Part · 챕터 · 용어, 태그 `L1`~`L4`). 결과를 누르면 그 권을 펼쳐 해당 슬라이드/상세 팝업으로 이동
     - 아래: 큰 원 둘레를 도는 수준별 교과서 `BOOKS`(입문/초보자/중수/전문가). `ready`이면 `book`의 교과서가 열린다
     - 배경: 은은한 신경망 모션(canvas `#bgCv`). 홈은 스크롤 없이 한 화면 고정

## 이어지는 프로젝트: AI 회의 노트 (세 권 공통)

- 정체성: "회의가 끝나면 결정과 할 일이 흩어져 잊힌다"는 문제를 푸는 회의 노트. 실습서 v1~v4 → 실전서 v5~v8 → 운영서 v9~v11
- 버전을 올릴 때마다 반드시 **불편한 장면 → 그래서 생기는 기능** 순서로 명분을 보여 준다. 학습자가 "이 기능 있으면 좋겠다"고 느껴야 하며, 명분이 약한 기능은 넣지 않는다
  - v1 회의 내용이 카톡 · 종이 · 메모앱에 흩어짐, 회의실엔 노트북이 없음 → 노트 쓰기 + 휴대폰으로 열리는 주소(배포)
  - v2 새로고침하면 방금 쓴 노트가 사라짐 → 저장
  - v3 주소만 알면 누구나 내 회의 노트를 봄(v2에서 일부러 열어 둠) → 로그인 + 내 것만
  - v4 한 시간 회의 노트가 길어 다시 안 읽음, 결정이 묻힘 → AI 3줄 요약 + 결정 · 할 일
  - v5 요약을 팀 단톡방에 매번 복붙 → 팀 공간
  - v6 둘이 같이 받아 적으면 서로 안 보임, 캡처는 따로 전송, "그거 언제 정했더라?" → 실시간 함께 쓰기 + 파일 첨부 + 지난 회의 검색
  - v7 할 일이 요약 글 속에만 있어 체크도 안 되고 담당자는 모름 → 할 일 목록(담당자 · 체크) + 담당자 알림 메일 + 빠른 요약
  - v8 팀이 매일 쓰기 시작, 회의록이 날아가면 신뢰가 끝 → 백업 · 에러 감시 · 되돌리기
  - v9 회의록 50개, "지난달 결정 뭐였지?"에 10분 → 물어보면 찾아 답하고 할 일을 만드는 AI 비서(도구 사용)
  - v10 회의는 캘린더에, 할 일은 다른 협업 도구에 옮겨 적음 → MCP로 연결
  - v11 비서가 실수로 지우거나 회의록 속 이상한 문장에 속으면? → 승인 · 권한 · 평가 · 비용 상한
- 각 Part 실습 슬라이드에 "내 앱이라면" 한 줄(Part의 `mine`)을 붙여 자기 아이디어 앱에 옮겨 보게 한다
- 코드 이름: 폴더 `meeting-notes`, 표 `notes`(실전서부터 `teams` · `members` · `notes`(id, team_id, author_id, body) · `todos`), 버킷 `note-files`

## 초보자용 진행 상황

- 확정한 구성: 4단계 · 9 Part · 39 챕터, 앱 하나(AI 회의 노트)를 v1~v4로 키운다. 도구는 Claude Code · React(Vite) · Supabase · Vercel · Claude API
- 완료: 전체 4단계 · 9 Part · 39 챕터. 1단계(Part 00~02), 2단계(Part 03 v1 첫 화면과 첫 배포, 04 v2 데이터 저장), 3단계(Part 05 v3 로그인과 내 데이터, 06 v4 AI 요약 기능), 4단계(Part 07 막혔을 때, 08 졸업 프로젝트)
- Part 07: 에러 전달 공식(한 일 · 기대 · 실제 · 에러 전문), 에러가 난 곳별 로그(화면 → F12 콘솔, 개발 서버 · 빌드 → 터미널, 서버 함수 → Vercel 로그, 데이터 · 로그인 → Supabase 로그), 같은 실수 반복 시 되돌리기 + `/clear`, 배포에서만 안 될 때, 공개 전 점검표
- Part 08: 내 아이디어를 회의 노트처럼 v1~v4로 쪼개기(예시: 독서 기록 앱), 만들기 → 배포 → 의견 받기, 돌아보기
- v3: 매직 링크 로그인, user_id 칸 + RLS(`(select auth.uid()) = user_id`), 계정 두 개로 직접 시험, Site URL · Redirect URLs (Supabase 문서 기준)
- v4: 화면 → Vercel `api` 폴더 서버 함수 → Claude API. 키는 `ANTHROPIC_API_KEY`(VITE_ 금지), 공식 SDK `@anthropic-ai/sdk`. 모델 이름은 교재에 박지 않고 "공식 문서 최신 목록에서 확인"으로 안내. 비용은 Console 워크스페이스 사용 한도 + 입력 길이 제한 + 요청 횟수 제한 세 겹. 로컬에서 api 함수는 `vercel dev`로 시험
- v2는 로그인이 없어 RLS 임시 규칙으로 누구나 읽고 쓰게 열어 둔다고 가르친다. v3(Part 05)에서 user_id 칸 추가 + 내 데이터만 보이는 RLS로 반드시 닫는다
- Supabase 키는 새 방식(공개 키 sb_publishable_, 비밀 키 sb_secret_), 환경 변수 이름은 VITE_SUPABASE_URL · VITE_SUPABASE_PUBLISHABLE_KEY (Supabase React 빠른 시작 문서 기준)
- 그림을 만들 때 상자(배경 채움)를 글자보다 먼저 그린다. 나중에 그리면 글자를 덮는다
- 설치 명령, 권한 모드, 요금처럼 바뀌는 내용은 쓰기 전에 공식 문서로 확인한다

## 중수용 진행 상황

- 확정한 구성: 4단계 · 10 Part(00~09) · 44 챕터 · 약 30시간 + 졸업 1–2주. 실습서의 v4 회의 노트를 팀 회의 노트 서비스(v5~v8)로 키운다. 결제는 다루지 않는다
  - 1단계 설계하기: 00 중수의 일(3) · 01 만들기 전에 설계(5) · 02 AI와 큰 작업 하기(5)
  - 2단계 튼튼하게: 03 TypeScript와 폴더 구조(4) · 04 테스트와 자동 검사(6: 안전망, Vitest, Playwright, 테스트 먼저, PR로 일하기, 자동 검사와 미리보기 배포)
  - 3단계 함께 쓰기: 05 v5 팀 공간과 권한(5) · 06 v6 함께 쓰기 · 파일 · 검색(4: 파일 첨부, 실시간, 지난 회의 검색, 느려질 때) · 07 v7 할 일까지 챙기는 AI(4: 스트리밍, 할 일 목록으로 받기, 담당자 알림, 품질과 비용 재기)
  - 4단계 운영하기: 08 v8 운영과 보안(5) · 09 졸업 프로젝트: 출시(3)
- 완료: 전체 4단계 · 10 Part · 44 챕터. 1단계(Part 00~02), 2단계(Part 03~04), 3단계(Part 05~07), 4단계(Part 08~09)
- Part 03: Vite는 타입 검사를 안 하므로 `npx tsc --noEmit`으로 따로 검사. 파일 하나씩 .tsx로 옮기고 조각마다 커밋. 타입 생성은 `npx supabase login` 후 `npx supabase gen types typescript --project-id ... --schema public > src/database.types.ts`, `createClient<Database>`, `Tables<'notes'>`. 기능별 폴더 `src/features/*` + `src/shared`
- Part 04: Vitest(`npm install -D vitest`, Node 22.12 이상, `.test.` 파일), Playwright(`npm init playwright@latest`, `--ui`, `show-report`), 실패하는 테스트 먼저, PR + Rulesets(PR 필수 · 검사 통과 필수), GitHub Actions(npm ci → tsc → vitest run → build, 액션 버전은 교재에 박지 않고 공식 README 최신), Vercel 미리보기(PR 댓글, Preview 환경 변수), Supabase Redirect URLs에 `https://*-<팀>.vercel.app/**`
- Part 05: 표 변경은 마이그레이션(`supabase migration new` → `db push`, 대시보드에서 바꿨으면 `db pull`). 팀원 확인은 security definer 함수(`search_path = ''`, private 스키마) + 정책이 쓰는 칸에 인덱스. members 규칙이 members를 읽으면 무한 반복 에러. 권한 표로 계정 세 개 시험, 정책 테스트는 `supabase/tests`
- Supabase 기본 메일(SMTP)은 조직 팀원 주소로만 보낸다. 실제 사용자 초대 · 로그인은 SMTP 연결 필요. 알림 메일은 로그인 메일과 분리(별도 메일 발송 서비스, 서버 함수)
- Part 06: 지난 회의 검색(처음엔 `.ilike()`, 한국어는 조사 때문에 전체 텍스트 검색이 약함 → pg_trgm 비교). Storage 비공개 버킷 + `storage.objects` 규칙(`storage.foldername(name)`으로 팀 폴더), 서명된 주소. Realtime은 `alter publication supabase_realtime add table notes`, RLS 적용, 대규모면 Broadcast. 목록은 `.range()`로 20개씩 + 인덱스
- Part 07(Claude API, 공식 SDK 기준): 할 일을 `{ decisions, todos: [{ who, what, due }] }`로 받아 `todos` 표에, 담당자(who)는 팀원 목록 안에서만(스키마), 담당자 알림 메일(서버 함수, 로그인 메일과 분리). 스트리밍 `client.messages.stream`, 구조화된 출력 `output_config.format`(예전 `output_format` 금지) · `messages.parse()`, 예시 모음 평가, `usage`(input/output/cache_read_input_tokens) 기록, 프롬프트 캐싱(앞부분 동일해야, 짧으면 안 됨)
- Part 08: 에러 모니터링(`@sentry/react`, DSN은 공개돼도 되는 값, 소스맵 `npx @sentry/wizard@latest -i sourcemaps`), 로그와 지표(개인정보 금지), 백업(Supabase 무료 요금제는 자동 백업 없음, Pro 이상 매일 · Storage 파일은 DB 백업에 없음, `supabase db dump --db-url ... -f schema.sql` / `--use-copy --data-only`, 복구 연습은 시험용 프로젝트), 보안 점검(Security Advisor, Dependabot, 서버 입력 검사), 사고 대응(Vercel Instant Rollback, 무료 요금제는 직전 배포로만, 되돌린 동안 자동 반영 꺼짐 → Promote, 배포 되돌리기는 DB를 되돌리지 않음)
- Part 09: 출시 준비(도메인 + Site URL, SMTP, 개인정보 처리방침, Supabase 출시 전 점검표, 2단계 인증), 작게 열기(다섯 명, 창구 하나), 의견을 버그 · 불편 · 기능으로 → 할 일 세 개 + 돌아보기
- 데이터 모델 이름: `teams`(id, name), `members`(team_id, user_id, role), `notes`(id, team_id, author_id, body), `todos`(v7), 사람은 `auth.users`
- Claude Code 내용(공식 문서 기준): 계획 모드는 Shift+Tab으로 `plan mode on`, Ctrl+G로 계획 편집. `/init`, CLAUDE.md 200줄 아래, 같은 실수 두 번이면 규칙 추가. 스킬은 `.claude/skills/<이름>/SKILL.md`(예전 `.claude/commands`도 동작), 서브에이전트, `/code-review`

## 전문가용 진행 상황

- 확정한 구성: 4단계 · 10 Part(00~09) · 44 챕터 · 약 25시간 + 졸업 1–2주. 두 갈래: 나 혼자 + AI 여러 개를 팀처럼 굴리는 흐름(사람 팀은 '나중에 동료가 생겨도 그대로 통해요' 정도로만) + 제품 속 에이전트. 사람 팀(팀원 · 민지 같은 인물)을 전제로 쓰지 않는다. 실전서의 팀 회의 노트 서비스에 AI 비서(v9~v11). Claude Code 중심으로 설명
  - 1단계 AI 팀의 작업대: 00 전문가의 일(3) · 01 모든 AI가 같은 규칙으로(5) · 02 꼭 지킬 것은 훅으로(4)
  - 2단계 병렬로 일하기: 03 여러 AI를 동시에(5: worktree, 서브에이전트 등) · 04 CI 속의 AI(5: `claude -p`, GitHub Actions, 자동 리뷰) · 05 큰 변경 다루기(4: 대규모 마이그레이션, 기능 플래그, 단계적 출시)
  - 3단계 제품 속 에이전트: 06 v9 도구를 쓰는 AI(5) · 07 v10 MCP로 연결(4) · 08 v11 에이전트의 품질과 안전(5)
  - 4단계 내 체계로: 09 졸업 프로젝트: 나의 AI 개발 체계(4: 정리, 측정, 동료가 생겼을 때)
- 완료: 전체 4단계 · 10 Part · 44 챕터. 1단계(Part 00~02), 2단계(Part 03~05), 3단계(Part 06~08), 4단계(Part 09)
- Part 01(공식 문서 기준): 설정 우선순위 managed → 명령줄 → `.claude/settings.local.json` → `.claude/settings.json`(커밋) → `~/.claude/settings.json`. 권한은 deny → ask → allow 순서, `Bash(npm run *)`, `Read(./.env)`. `.claude/rules` + `paths`, 팀 스킬(`disable-model-invocation: true`), 플러그인(`.claude-plugin/plugin.json`, `/plugin`, 마켓플레이스)
- Part 02: 훅은 settings.json의 `hooks`, `PostToolUse` + matcher `Edit|Write`로 포매터, `PreToolUse`에서 stderr + `exit 2`로 막기(훅이 허락해도 deny 규칙은 막음), `/hooks`, `claude --debug`, 샌드박스 `/sandbox`
- Part 03(공식 문서 기준): `claude --worktree 이름` → `.claude/worktrees/이름`, 브랜치 `worktree-이름`, `.claude/worktrees/`는 .gitignore, `.env`는 `.worktreeinclude`, 작업대마다 npm install. 서브에이전트 `.claude/agents/*.md`(name · description · tools). 백그라운드 `claude --bg`, `/background`, `claude agents`(agent view, research preview). 검토는 새 세션에서 `/code-review [PR번호]`
- Part 04: `claude -p`(파이프, 종료 코드, `--allowedTools`, CI는 `--bare` + `ANTHROPIC_API_KEY`), `--output-format text|json|stream-json`, `--json-schema` → `structured_output`. `/install-github-app`(관리자 권한, gh 로그인, Secret `ANTHROPIC_API_KEY`), `@claude`는 쓰기 권한 있는 사람만, 리뷰 워크플로는 CLAUDE.md를 읽음. 제한: `claude_args`의 `--max-turns`, `timeout-minutes`, `concurrency`. 기본 `GITHUB_TOKEN` 커밋은 CI를 안 깨움
- Part 05: `/batch <지시>`(5~30개 단위로 나눠 계획 → 승인 → 단위마다 worktree에서 구현 · 테스트 · PR, git 저장소 필요). 표 변경은 늘리기 → 옮기기 → 줄이기(todos.who → assignee_id). 기능 플래그는 Supabase `feature_flags` 표 + RLS + 서버 함수에서도 확인, 나 → 다섯 명 → 모두, 끝나면 플래그 정리. 운영서 3단계의 AI 비서(`ai_assistant`)도 플래그로 켠다
- Part 06 v9(Claude API 공식 문서 기준): 도구 `name` · `description` · `input_schema`(`strict: true`), `stop_reason: "tool_use"` → 서버 실행 → `tool_result`(`tool_use_id`, 실패 시 `is_error: true`, user 메시지 맨 앞). Tool Runner(베타) `client.beta.messages.toolRunner` + `max_iterations`, 승인을 끼우려면 직접 반복. 도구 `search_notes` · `get_note` · `create_todo`, 사용자 세션으로 실행(RLS), 근거 노트 함께 답
- Part 07 v10: Claude Code `claude mcp add --transport http 이름 주소`, `/mcp`, `--scope project` → `.mcp.json`. Claude API MCP 연결(베타, `mcp_servers` + `mcp_toolset`, `default_config: { enabled: false }` + `configs`로 허용 목록), 원격 HTTP 서버만 · 도구만 · OAuth 토큰은 내가 받아 `authorization_token`. 내 서비스를 MCP 서버로(공식 SDK `registerTool`, SDK 버전은 공식 문서 최신)
- Part 08 v11: 바꾸는 도구는 승인 카드, 사용자 세션 + RLS(비밀 키 금지), 프롬프트 인젝션(남의 글은 tool_result 안에만, 속아도 피해가 작게), 평가 세트 `evals/assistant.json`, 비용은 반복 횟수 · 질문 길이 · 사용자별 하루 횟수 · 워크스페이스 한도
- Part 09 졸업: 체계를 `docs/ai-workflow.md` 한 장으로(Part 00에서 시작), 숫자 세 개(PR 시간 · 되돌림 · AI 비용)를 `docs/metrics.md`에 기준값부터, 공통 스킬 · 에이전트 · 훅을 플러그인 `my-workflow`로, 동료가 생기면 같은 파일 위에서 + PR 검토 · 결정 기록
- 재검토 완료. 다음은 아래 '따라 하기 검증'을 마친 뒤 새 PR로 main에 합친다(사용자가 말할 때)

## 따라 하기 검증 (진행 중)

- 사용자가 학습자처럼 실습서 Part 00부터 슬라이드만 보고 자기 컴퓨터에서 직접 따라 한다. 계정 · 키 발급도 사용자가 한다
- Claude는 대신 따라 하지 않는다. 막힌 곳 · 화면이 다른 곳 · 요청 문장이 안 먹힌 곳을 받으면 해당 슬라이드를 고치고 링크에 다시 올린다
- 고칠 때는 공식 문서로 다시 확인하고, 고친 내용은 아래에 한 줄씩 남긴다(권 · Part · 무엇을 · 왜)
- 기록:

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
// 상세 팝업이 스크롤 없이 들어가는지 (권마다: loadBook('intro') / loadBook('novice') 후 실행)
PARTS.forEach((p,i)=>!p.todo&&p.lessons.forEach((l,j)=>{const k=`${i}-${j+1}`;openD(k);const b=document.getElementById('dlgB');if(b.scrollHeight>b.clientHeight+2)console.log('overflow',k);}));
```
