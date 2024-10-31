/* eslint-disable prettier/prettier */
import { app, shell, BrowserWindow, ipcMain, dialog} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import mysql from 'mysql2/promise'
import os from 'os'
import { autoUpdater }  from 'electron-updater'
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

// Configuraciones específicas para Windows 7
if (os.platform() === 'win32' && os.release().startsWith('6.1')) {
  // Deshabilitar aceleración por hardware
  app.disableHardwareAcceleration()
  
  // Configuraciones adicionales para mejorar la compatibilidad
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('no-sandbox')
  app.commandLine.appendSwitch('use-angle', 'gl')
  
  // Limitar la longitud de las rutas
  app.setPath('userData', join(os.homedir(), '.reclamos'))
  
  // Deshabilitar APIs obsoletas
  app.commandLine.appendSwitch('disable-site-isolation-trials')
}

const db = mysql.createPool({
  host: '192.168.50.28',
  user: 'lidercom',
  password: '123lidercom456',
  database: 'gestion_reclamos'
})

async function fetchData() {
  try {
    const [rows] = await db.execute('SELECT * FROM reclamos')
    return rows
  } catch (error) {
    console.log('Error al conectar  con Mysql', error)
    throw error
  }
}

async function insertData(reclamos) {
  const { nombre, producto, descripcion, importancia, estado, fecha_creacion } = reclamos
  try {
    const query =
      'INSERT INTO reclamos (nombre, producto, descripcion, importancia, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?)'
    const [result] = await db.execute(query, [
      nombre,
      producto,
      descripcion,
      importancia,
      estado,
      fecha_creacion
    ])
    return result
  } catch (error) {
    console.log('Error al agregar usuario', error)
    throw error
  }
}

async function updateData(reclamosId, updatedReclamos) {
  try {
    const query =
      'UPDATE reclamos SET nombre = ?, producto = ?, descripcion = ?, importancia = ?, estado = ?, fecha_creacion = ? WHERE id = ?'
    const { nombre, producto, descripcion, importancia, estado, fecha_creacion } = updatedReclamos

    const [result] = await db.execute(query, [
      nombre,
      producto,
      descripcion,
      importancia,
      estado,
      fecha_creacion,
      reclamosId
    ])

    return result
  } catch (error) {
    console.log('Error al actualizar reclamo', error)
    throw error
  }
}

async function changeState(reclamoId, reclamosEstado) {
  try {
    const query = 'UPDATE reclamos SET estado = ? WHERE id = ?'
    const { estado } = reclamosEstado
    const [result] = await db.execute(query, [estado, reclamoId])
    return result
  } catch (error) {
    console.log('Error al actualizar el estado del reclamo', error)
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    icon: join(__dirname, '../../resources/icon.png'),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  autoUpdater.checkForUpdates()

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización disponible',
      message: `La versión ${info.version} está disponible. ¿Desea descargarla ahora?`,
      buttons: ['Sí', 'No']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate()
        mainWindow.webContents.send('update-downloading')
      }
    })
  })

  // Cuando la actualización se ha descargado
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización lista',
      message: 'La actualización se ha descargado. La aplicación se reiniciará para instalarla.',
      buttons: ['Reiniciar ahora', 'Más tarde']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
  
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download-progress', progressObj)
  })

  // Manejar errores
  autoUpdater.on('error', (err) => {
    dialog.showErrorBox('Error en la actualización', 
      'Ocurrió un error al buscar actualizaciones: ' + err.message)
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Configurar el AppUserModelId para Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId(process.execPath)
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('fetch-data', async () => {
    return await fetchData()
  })

  ipcMain.handle('insert-data', async (event, reclamos) => {
    return await insertData(reclamos)
  })

  ipcMain.handle('update-data', async (event, reclamosId, updatedReclamos) => {
    return await updateData(reclamosId, updatedReclamos)
  })

  ipcMain.handle('change-state', async (event, reclamoId, reclamosEstado) => {
    return await changeState(reclamoId, reclamosEstado)
  })

  ipcMain.on('install-update', () => autoUpdater.quitAndInstall());

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 1000 * 60 * 60); // Verificar cada hora
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})