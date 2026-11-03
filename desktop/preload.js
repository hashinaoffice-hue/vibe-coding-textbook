// 위젯 화면(widget.html)에 꼭 필요한 기능만 열어 줘요.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vibe', {
  getIndex: () => ipcRenderer.invoke('index'),
  hide: () => ipcRenderer.send('hide'),
  getMode: () => ipcRenderer.invoke('mode:get'),
  setMode: m => ipcRenderer.send('mode:set', m),
  onShow: fn => ipcRenderer.on('shown', () => fn())
});
