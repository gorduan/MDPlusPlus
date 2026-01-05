# Code Patterns & Don'ts

---

## Electron Main Process

### Pattern: App initialisieren

```typescript
import { app, BrowserWindow } from 'electron';

// GPU-Fix für Windows ZUERST
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();
});
```

### Pattern: BrowserWindow erstellen

```typescript
mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  title: 'MD++ Editor',
  webPreferences: {
    preload: join(__dirname, '../preload/index.mjs'),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false,
  },
  show: true,
  center: true,
  backgroundColor: '#1e1e1e',
});

// Renderer laden - WICHTIG: Korrekter Pfad!
mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
```

---

## React Components

### Pattern: Parser mit Plugins

```typescript
import { parse } from '@gorduan/mdplusplus';
import bootstrapPlugin from '../../../../plugins/bootstrap.json';
import admonitionsPlugin from '../../../../plugins/admonitions.json';

const PLUGINS = {
  bootstrap: bootstrapPlugin,
  admonitions: admonitionsPlugin,
};

// Parser mit Plugins initialisieren
const result = await parse(content, { plugins: PLUGINS });
```

---

## Don'ts

### NIEMALS: Electron mit "." starten

```bash
# FALSCH
npx electron .

# RICHTIG
npm run electron:start
```

### NIEMALS: GPU-Code ohne Fallback

```typescript
// FALSCH - Kann auf Windows crashen
// (kein disableHardwareAcceleration)

// RICHTIG - Am Anfang von main.ts
app.disableHardwareAcceleration();
```

### NIEMALS: Blocking I/O im Renderer

```typescript
// FALSCH
const content = fs.readFileSync(path);

// RICHTIG
const content = await fs.promises.readFile(path, 'utf-8');
```

### NIEMALS: nodeIntegration: true

```typescript
// FALSCH - Sicherheitsrisiko
webPreferences: {
  nodeIntegration: true
}

// RICHTIG - Preload Script verwenden
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: join(__dirname, '../preload/index.mjs'),
}
```

---

## IPC Communication

### Pattern: Main → Renderer

```typescript
// main.ts
mainWindow.webContents.send('file-opened', { path, content });

// preload.ts
contextBridge.exposeInMainWorld('electron', {
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
});

// renderer
window.electron.onFileOpened((event, data) => {
  // handle data
});
```

### Pattern: Renderer → Main

```typescript
// preload.ts
contextBridge.exposeInMainWorld('electron', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
});

// main.ts
ipcMain.handle('read-file', async (_, path) => {
  return await readFile(path, 'utf-8');
});

// renderer
const content = await window.electron.readFile(path);
```
