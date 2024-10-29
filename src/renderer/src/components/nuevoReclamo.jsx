/* eslint-disable prettier/prettier */
import { useState } from 'react';
import '../assets/ingreso.css';
// eslint-disable-next-line react/prop-types
export default function NuevoReclamo({ onBack }) {
  const [form, setForm] = useState({
    nombre: '',
    producto: 'camara',
    descripcion: '',
    descripcionPersonalizada: '',
    importancia: 'Baja',
    estado: 'activo',
    fecha_creacion: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });

  const [descripciones] = useState({
    camara: [
      'Lente roto',
      'Se ve mal',
      'Foco fundido',
      'Otro'
    ],
    redes: [
      'Conexión inestable',
      'No se conecta',
      'Velocidad lenta',
      'Otro'
    ],
    computacion: [
      'No enciende',
      'Pantalla rota',
      'Se calienta mucho',
      'Otro'
    ],
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'producto') {
      setForm({ ...form, producto: value, descripcion: '', descripcionPersonalizada: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDescripcionChange = (e) => {
    const { value } = e.target;
    if (form.descripcion === 'Otro') {
      setForm({ ...form, descripcionPersonalizada: value });
    } else {
      setForm({ ...form, descripcion: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalDescripcion = form.descripcion === 'Otro' ? form.descripcionPersonalizada : form.descripcion;
      await window.api.insertData({ ...form, descripcion: finalDescripcion });

      setMensaje('Reclamo agregado correctamente.');
      setForm({
        nombre: '',
        producto: 'camara',
        descripcion: '',
        descripcionPersonalizada: '',
        importancia: 'Baja',
        estado: 'activo',
        fecha_creacion: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error al agregar reclamo:', error);
      setMensaje('Hubo un error al agregar el reclamo.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Ingreso de Reclamos</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select name="producto" value={form.producto} onChange={handleChange} style={styles.select}>
          <option value="camara">Cámara</option>
          <option value="redes">Redes</option>
          <option value="computacion">Computación</option>
        </select>
        <select
          name="descripcion"
          value={form.descripcion}
          onChange={handleDescripcionChange}
          required
          style={styles.select}
        >
          <option value="">Selecciona una descripción</option>
          {descripciones[form.producto].map((desc, index) => (
            <option key={index} value={desc}>
              {desc}
            </option>
          ))}
        </select>
        {form.descripcion === 'Otro' && (
          <textarea
            name="descripcionPersonalizada"
            placeholder="Escribe tu descripción aquí"
            value={form.descripcionPersonalizada}
            onChange={handleDescripcionChange}
            style={styles.textarea}
          ></textarea>
        )}
        <select name="importancia" value={form.importancia} onChange={handleChange} style={styles.select}>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>
        <button type="submit" style={styles.button}>Agregar Reclamo</button>
        <button type="button" onClick={onBack} style={styles.backButton}>
          Volver
        </button>
      </form>
      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    transition: 'border 0.3s',
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    transition: 'border 0.3s',
  },
  textarea: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    height: '100px',
    resize: 'none',
  },
  button: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  backButton: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#f44336',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  mensaje: {   
    marginTop: '20px',
    color: 'green',
    fontSize: '16px',
    textAlign: 'center',
  },
};

// Para aplicar hover se pueden usar estilos en CSS o en un archivo CSS-in-JS
