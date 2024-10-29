/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import EditReclamo from './editReclamo';
// eslint-disable-next-line react/prop-types
export default function ListaReclamos() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState('none');
  const [editingReclamo, setEditingReclamo] = useState(null);
  const [filter, setFilter] = useState('activo');

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await window.api.fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  const handleRefresh = () => {
    fetchData(); // Refresca los datos al hacer clic en el ícono
  };
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedData = () => {
    if (sortOrder === 'none') {
      return data; // Sin ordenar
    }

    const sortedArray = [...data].sort((a, b) => {
      const importanceOrder = { alta: 3, media: 2, baja: 1 }; // Define el orden de importancia
      return sortOrder === 'asc'
        ? importanceOrder[a.importancia.toLowerCase()] - importanceOrder[b.importancia.toLowerCase()]
        : importanceOrder[b.importancia.toLowerCase()] - importanceOrder[a.importancia.toLowerCase()];
    });

    return sortedArray;
  };

  const filteredData = () => {
    const sorted = sortedData();
    return sorted.filter((item) => item.estado === filter);
  };

  const handleChangeStatus = async (reclamo, newState) => {
    try {
      // Cambia el estado del reclamo en la base de datos
      await window.api.changeState(reclamo.id, { estado: newState });

      // Actualiza el estado localmente
      setData((prevData) =>
        prevData.map((item) =>
          item.id === reclamo.id ? { ...item, estado: newState } : item
        )
      );
    } catch (error) {
      alert('Hubo un error al actualizar el estado');
    }
  };

  const handleEditClick = (reclamo) => {
    setEditingReclamo(reclamo); // Establece el reclamo que se va a editar
  };

  const handleUpdateReclamo = (updatedReclamo) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedReclamo.id ? updatedReclamo : item))
    ); // Actualiza el reclamo en la lista
    setEditingReclamo(null); // Cierra el formulario de edición
  };

  if (loading) return <p style={styles.loading}>Cargando datos...</p>
  if (error) return <p style={styles.error}>Error: {error}</p>
  return (
    <div>
      <h1>Lista de Reclamos</h1>
      <button style={styles.statusButton} onClick={handleRefresh}>Recargar</button>
      <label>
        Ver reclamos:
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
          <option value="activo">Activos</option>
          <option value="finalizado">Finalizados</option>
          <option value="eliminado">Eliminados</option>
        </select>
      </label>
      <label>
        Ordenar por importancia:
        <select value={sortOrder} onChange={handleSortChange} style={styles.select}>
          <option value="none">Sin ordenar</option>
          <option value="asc">Bajo a alto</option>
          <option value="desc">Alto a bajo</option>
        </select>
      </label>
      <ul style={styles.list}>
        {filteredData().map((item, index) => (
          <li
            key={index}
            style={{ ...styles.card, backgroundColor: getBackgroundColor(item.importancia) }}
          >
            <p>
              <strong>ID:</strong> {item.id}
            </p>
            <p>
              <strong>Cliente:</strong> {item.nombre}
            </p>
            <p>
              <strong>Descripción:</strong> {item.descripcion}
            </p>
            <p>
              <strong>Fecha de creación:</strong> {new Date(item.fecha_creacion).toLocaleString()}
            </p>
            <p>
              <strong>Estado:</strong> {item.estado}
            </p>
            <p>
              <strong>Importancia:</strong> {item.importancia}
            </p>
            <button
              onClick={() =>
                handleChangeStatus(item, item.estado === 'activo' ? 'finalizado' : 'activo')
              }
              style={styles.statusButton}
            >
              {item.estado === 'activo' ? 'Finalizar' : 'Reactivar'}
            </button>
            <button onClick={() => handleEditClick(item)} style={styles.editButton}>
              Editar
            </button>
            <button
              onClick={() => handleChangeStatus(item, 'eliminado')}
              style={styles.deleteButton}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      {editingReclamo && (
        <EditReclamo
          reclamo={editingReclamo}
          onUpdate={handleUpdateReclamo}
          onCancel={() => setEditingReclamo(null)}
        />
      )}
    </div>
  )
}

const getBackgroundColor = (importancia) => {
  switch (importancia) {
    case 'alta':
      return '#ff9999'
    case 'media':
      return '#ffeb99'
    case 'baja':
      return '#99ff99'
    default:
      return '#ffffff'
  }
}

const styles = {
  list: { listStyle: 'none', padding: 0 },
  card: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  loading: { textAlign: 'center', color: '#777' },
  error: { textAlign: 'center', color: 'red' },
  select: {
    marginLeft: '10px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  editButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  statusButton: {
    marginTop: '5px',
    marginRight: '5px',
    padding: '5px 10px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  deleteButton: {
    marginTop: '10px',
    marginLeft  : '5px',
    padding: '5px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
}
