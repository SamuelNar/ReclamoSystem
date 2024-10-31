/* eslint-disable prettier/prettier */
import { useState, useEffect} from 'react'
import ListaReclamos from './components/ListaReclamos'
import NuevoReclamo from './components/NuevoReclamo'
import img from './assets/LogoTextoAzul.png'
import UpdateProgress from './components/UpdateProgress'
function App() {
  const [mostrarLista, setMostrarLista] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const handleVista = () => {
    setMostrarLista(!mostrarLista) // Alterna entre vistas
  }

  useEffect(() => {
    // Listener para detectar cuando comienza la descarga
    window.api.onUpdateDownloading(() => setIsDownloading(true))

    // Listener para detectar cuando la descarga finaliza
    window.api.onDownloadProgress((progress) => {
      if (progress.percent === 100) setIsDownloading(false)
    })
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img src={img} alt="Logo" style={styles.logo} />
      </div>
      <div style={styles.navbar}>
        <button onClick={handleVista} style={styles.button}>
          {mostrarLista ? 'Agregar reclamo' : 'Ver reclamos'}
        </button>
      </div>
      {mostrarLista ? <ListaReclamos /> : <NuevoReclamo onBack={handleVista} />}
      {/* Mostrar UpdateProgress solo cuando isDownloading es true */}
      {isDownloading && <UpdateProgress />}
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  logo: {
    maxWidth: '200px', // Ajusta este valor según el tamaño que necesites
    height: 'auto'
  }
}
export default App
