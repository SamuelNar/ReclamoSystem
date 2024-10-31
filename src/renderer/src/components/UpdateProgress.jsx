import { useState, useEffect } from 'react'

function UpdateProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    // Escuchar el progreso de descarga
    window.api.onDownloadProgress((progressObj) => {
      setProgress(Math.round(progressObj.percent)) // Porcentaje de progreso redondeado
    })
  }, [])

  return (
    <div>
      <p>Progreso de la descarga: {progress}%</p>
      <progress value={progress} max="100"></progress>
    </div>
  )
}

export default UpdateProgress