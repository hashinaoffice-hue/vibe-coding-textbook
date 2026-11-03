// 바이브 코딩 사전: 교과서 용어 · 챕터를 찾는 작은 플로팅 검색 창.
// \ 키를 빠르게 세 번 누르면 어느 앱에서든 창이 뜨고, 다시 세 번 누르거나 Esc를 누르면 숨어요.
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, net, shell, dialog, systemPreferences } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const SITE = process.env.VIBE_SITE || 'https://vibe-coding-textbook-theta.vercel.app'; // 시험할 때만 VIBE_SITE로 바꿔요
const TRIPLE_MS = 700; // 세 번을 이 시간(ms) 안에 눌러야 해요

let win = null, tray = null, lastPos = null;
app.isQuitting = false;

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => showWin());

/* ---------- 창 ---------- */
function createWin() {
  win = new BrowserWindow({
    width: 560, height: 520, show: false,
    frame: false, transparent: true, resizable: false,
    alwaysOnTop: true, skipTaskbar: true,
    minimizable: false, maximizable: false, fullscreenable: false,
    title: '바이브 코딩 사전',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true }
  });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'widget.html'));
  win.on('moved', () => { lastPos = win.getPosition(); });
  win.on('close', e => { if (!app.isQuitting) { e.preventDefault(); win.hide(); } });
  // 링크는 앱 안이 아니라 기본 브라우저로 열어요
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

function showWin() {
  if (!win) return;
  const area = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const [w, h] = win.getSize();
  const inside = lastPos && lastPos[0] >= area.x && lastPos[1] >= area.y && lastPos[0] + w <= area.x + area.width && lastPos[1] + h <= area.y + area.height;
  const [x, y] = inside ? lastPos : [Math.round(area.x + (area.width - w) / 2), Math.round(area.y + area.height * 0.16)];
  win.setPosition(x, y);
  win.show();
  win.focus();
  win.webContents.send('shown');
}

function toggleWin() {
  if (!win) return;
  if (win.isVisible() && win.isFocused()) win.hide(); else showWin();
}

/* ---------- 검색 자료: 사이트의 search.json을 받아 두고, 못 받으면 저장해 둔 것을 써요 ---------- */
const cacheFile = () => path.join(app.getPath('userData'), 'search.json');

async function getIndex() {
  try {
    const res = await net.fetch(`${SITE}/search.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fs.writeFileSync(cacheFile(), JSON.stringify(data));
    return data;
  } catch (err) {
    if (fs.existsSync(cacheFile())) return JSON.parse(fs.readFileSync(cacheFile(), 'utf8'));
    throw err;
  }
}

ipcMain.handle('index', () => getIndex());
ipcMain.on('hide', () => win && win.hide());

/* ---------- \ 세 번: 키보드 전체에서 \ 키만 세어요(누른 글자는 그대로 입력돼요) ---------- */
function startHotkey() {
  if (process.platform === 'darwin' && !systemPreferences.isTrustedAccessibilityClient(true)) {
    dialog.showMessageBox({
      type: 'info', buttons: ['확인'],
      message: '\\ 세 번 단축키를 쓰려면 권한이 필요해요',
      detail: '시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용(필요하면 입력 모니터링도)에서 이 앱을 켠 뒤, 앱을 다시 실행해 주세요.\n그동안은 메뉴 막대의 아이콘으로 열 수 있어요.'
    });
    return false;
  }
  try {
    const { uIOhook, UiohookKey } = require('uiohook-napi');
    let presses = [];
    uIOhook.on('keydown', e => {
      if (e.keycode !== UiohookKey.Backslash || e.ctrlKey || e.altKey || e.metaKey) { presses = []; return; }
      const now = Date.now();
      presses = presses.filter(t => now - t < TRIPLE_MS);
      presses.push(now);
      if (presses.length >= 3) { presses = []; toggleWin(); }
    });
    uIOhook.start();
    app.on('will-quit', () => { try { uIOhook.stop(); } catch {} });
    return true;
  } catch (err) {
    console.error('단축키를 켜지 못했어요:', err);
    return false;
  }
}

/* ---------- 트레이(작업 표시줄 · 메뉴 막대) 아이콘 ---------- */
function createTray(hotkeyOn) {
  const icon = process.platform === 'darwin'
    ? nativeImage.createFromPath(path.join(__dirname, 'assets', 'trayTemplate.png'))
    : nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));
  tray = new Tray(icon);
  tray.setToolTip('바이브 코딩 사전');
  const login = () => app.getLoginItemSettings().openAtLogin;
  const build = () => Menu.buildFromTemplate([
    { label: hotkeyOn ? '사전 열기   (\\ 세 번)' : '사전 열기', click: showWin },
    { label: '교과서 열기', click: () => shell.openExternal(SITE) },
    { type: 'separator' },
    { label: '컴퓨터를 켤 때 자동 실행', type: 'checkbox', checked: login(),
      click: item => { app.setLoginItemSettings({ openAtLogin: item.checked }); tray.setContextMenu(build()); } },
    { label: '교과서 내용 새로 받기', click: () => win && win.reload() },
    { type: 'separator' },
    { label: '종료', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(build());
  if (process.platform !== 'darwin') tray.on('click', toggleWin);
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  createWin();
  createTray(startHotkey());
});

app.on('window-all-closed', e => e.preventDefault());
app.on('before-quit', () => { app.isQuitting = true; });
