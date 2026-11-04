// 바이브 코딩 사전: 교과서 용어 · 챕터를 찾는 작은 플로팅 검색 창.
// \ 키를 빠르게 세 번 누르면 어느 앱에서든 창이 뜨고, 떠 있을 때 두 번 누르거나 Esc를 누르면 숨어요.
const { app, BrowserWindow, Tray, Menu, nativeImage, nativeTheme, ipcMain, screen, net, shell, dialog, systemPreferences } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const SITE = process.env.VIBE_SITE || 'https://vibe-coding-textbook-theta.vercel.app'; // 시험할 때만 VIBE_SITE로 바꿔요
const PRESS_MS = 700; // 이 시간(ms) 안에 이어서 눌러야 한 묶음으로 세요
const OPEN_PRESSES = 3, CLOSE_PRESSES = 2; // 닫혀 있으면 세 번에 열고, 떠 있으면 두 번에 닫아요

let win = null, tray = null, lastPos = null;
app.isQuitting = false;

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => showWin());

/* ---------- 설정: 화면 모드(system · light · dark) ---------- */
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() { try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')); } catch { return {}; } }
function saveSettings(patch) { fs.writeFileSync(settingsFile(), JSON.stringify({ ...loadSettings(), ...patch })); }
const surface = () => (nativeTheme.shouldUseDarkColors ? '#161C1A' : '#FFFFFF');
function setMode(m) {
  nativeTheme.themeSource = ['light', 'dark'].includes(m) ? m : 'system';
  if (win) win.setBackgroundColor(surface());
}
nativeTheme.on('updated', () => win && win.setBackgroundColor(surface()));
ipcMain.handle('mode:get', () => loadSettings().mode || 'system');
ipcMain.on('mode:set', (_e, m) => { saveSettings({ mode: m }); setMode(m); });

/* ---------- 창: 운영체제가 그려 주는 은은한 그림자와 둥근 모서리를 써요 ---------- */
function createWin() {
  win = new BrowserWindow({
    width: 560, height: 520, show: false,
    frame: false, resizable: false, hasShadow: true, roundedCorners: true,
    backgroundColor: surface(),
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
    let presses = [], lastToggle = 0;
    uIOhook.on('keydown', e => {
      if (e.keycode !== UiohookKey.Backslash || e.ctrlKey || e.altKey || e.metaKey) { presses = []; return; }
      const now = Date.now();
      if (now - lastToggle < 400) return; // 방금 열고 닫은 직후의 남은 입력은 세지 않아요
      presses = presses.filter(t => now - t < PRESS_MS);
      presses.push(now);
      const open = win && win.isVisible();
      if (presses.length >= (open ? CLOSE_PRESSES : OPEN_PRESSES)) {
        presses = []; lastToggle = now;
        if (open) win.hide(); else showWin();
      }
    });
    uIOhook.start();
    app.on('will-quit', () => { try { uIOhook.stop(); } catch {} });
    return true;
  } catch (err) {
    console.error('단축키를 켜지 못했어요:', err);
    return false;
  }
}

/* ---------- 컴퓨터를 켤 때 자동 실행: 창은 띄우지 않고 뒤에서 \ 세 번을 기다려요 ---------- */
const LOGIN_ARGS = ['--hidden']; // Windows에서 자동 실행인지 알아보는 표시(Mac은 무시돼요)
const loginOn = () => app.getLoginItemSettings({ args: LOGIN_ARGS }).openAtLogin;
function setLogin(on) {
  app.setLoginItemSettings({ openAtLogin: on, args: LOGIN_ARGS });
  saveSettings({ login: on });
}

/* ---------- 트레이(작업 표시줄 · 메뉴 막대) 아이콘 ---------- */
function createTray(hotkeyOn) {
  const icon = process.platform === 'darwin'
    ? nativeImage.createFromPath(path.join(__dirname, 'assets', 'trayTemplate.png'))
    : nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));
  tray = new Tray(icon);
  tray.setToolTip(hotkeyOn ? '바이브 코딩 사전 · \\ 세 번 열기 · 두 번 닫기' : '바이브 코딩 사전');
  const build = () => Menu.buildFromTemplate([
    { label: hotkeyOn ? '사전 열기   (\\ 세 번 · 닫기는 두 번)' : '사전 열기', click: showWin },
    { label: '교과서 열기', click: () => shell.openExternal(SITE) },
    { type: 'separator' },
    { label: '컴퓨터를 켤 때 자동 실행', type: 'checkbox', checked: loginOn(),
      click: item => { setLogin(item.checked); tray.setContextMenu(build()); } },
    { label: '교과서 내용 새로 받기', click: () => win && win.reload() },
    { type: 'separator' },
    { label: '종료', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(build());
  if (process.platform !== 'darwin') tray.on('click', toggleWin);
}

app.whenReady().then(() => {
  const s = loadSettings();
  setMode(s.mode);
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  // 설치하고 처음 켤 때 자동 실행을 켜 둬요. 트레이 메뉴에서 끄면 그 뒤로는 그대로 둬요
  if (app.isPackaged && s.login === undefined) setLogin(true);
  createWin();
  createTray(startHotkey());
  // 창은 \ 세 번을 누를 때만 떠요. 예외: 처음 설치하고 켰을 때 안내로 한 번,
  // Windows에서 시작 메뉴 등으로 직접 켰을 때(자동 실행은 --hidden이 붙어 있어 띄우지 않아요)
  const manualWin = process.platform === 'win32' && !process.argv.includes('--hidden');
  if (!s.welcomed || manualWin) {
    saveSettings({ welcomed: true });
    win.webContents.once('did-finish-load', showWin);
  }
});

app.on('window-all-closed', e => e.preventDefault());
app.on('before-quit', () => { app.isQuitting = true; });
