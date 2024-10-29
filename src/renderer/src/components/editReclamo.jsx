/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';

// eslint-disable-next-line react/prop-types
export default function EditReclamo({ reclamo, onUpdate, onCancel }) {
  const [form, setForm] = useState({ ...reclamo });
  const [isOtherDescription, setIsOtherDescription] = useState(false);
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    // Verificamos si la descripción actual es "Otro" y activamos el textarea
    if (form.descripcion === 'Otro') {
      setIsOtherDescription(true);
      setCustomDescription(form.descripcion); // Iniciar el campo con la descripción actual
    } else {
      setIsOtherDescription(false);
      setCustomDescription('');
    }
  }, [form.descripcion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Si se selecciona "Otro" en la descripción, habilitamos el textarea
    if (name === 'descripcion' && value === 'Otro') {
      setIsOtherDescription(true);
    } else {
      setIsOtherDescription(false);
      setCustomDescription(''); // Reiniciamos el campo si no es "Otro"
    }
  };

  const handleCustomDescriptionChange = (e) => {
    setCustomDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si hay una descripción personalizada, la usamos
    const updatedForm = { ...form, descripcion: customDescription || form.descripcion };
    try {
      // eslint-disable-next-line react/prop-types
      await window.api.updateData(reclamo.id, updatedForm);
      onUpdate(updatedForm);
    } catch (error) {
      alert('Hubo un error al actualizar el reclamo');
    }    
  };

  return (
    <div style={styles.modal}>
      <h2>Editar Reclamo</h2>
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
          onChange={handleChange}
          style={styles.select}
        >
          <option value="lente roto">Lente roto</option>
          <option value="se ve mal">Se ve mal</option>
          <option value="conexión fallida">Conexión fallida</option>
          <option value="Otro">Otro</option>
        </select>
        {isOtherDescription && (
          <textarea
            name="customDescripcion"
            placeholder="Descripción personalizada"
            value={customDescription}
            onChange={handleCustomDescriptionChange}
            required
            style={styles.textarea}
          ></textarea>
        )}
        <select name="importancia" value={form.importancia} onChange={handleChange} style={styles.select}>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>
        <button type="submit" style={styles.button}>
          Guardar Cambios
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

const styles = {
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '30px',
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '600px',
    height: 'auto',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    height: '100px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  }
};