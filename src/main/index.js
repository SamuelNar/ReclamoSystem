/* eslint-disable prettier/prettier */
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import mysql from 'mysql2/promise'
const { autoUpdater } = require('electron-updater')
import path from 'path'
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

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
    // Extraemos los valores de updatedReclamos
    const { nombre, producto, descripcion, importancia, estado, fecha_creacion } = updatedReclamos

    // Ejecutamos la consulta con los valores actualizados y el ID del reclamo
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

  // Manejar errores
  autoUpdater.on('error', (err) => {
    dialog.showErrorBox('Error en la actualización', 
      'Ocurrió un error al buscar actualizaciones: ' + err.message)
  })

  

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
