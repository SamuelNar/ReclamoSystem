import { useState, useEffect } from 'react'

function UpdateProgress() {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    // Escuchar cuando comienza la descarga
    window.electronAPI.onUpdateDownloading(() => {
      setDownloading(true)
    })

    // Escuchar el progreso de la descarga
    window.electronAPI.onUpdateProgress((event, progressObj) => {
      setProgress(Math.round(progressObj.percent))
      setSpeed(Math.round(progressObj.bytesPerSecond / 1024)) // Convertir a KB/s
    })
  }, [])

  if (!downloading) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg w-80">
      <div className="mb-2">
        <p className="text-sm font-medium">Descargando actualización...</p>
        <p className="text-xs text-gray-500">{speed} KB/s</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right text-xs mt-1">{progress}%</p>
    </div>
  )
}

export default UpdateProgress