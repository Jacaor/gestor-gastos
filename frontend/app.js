const API_URL = 'http://localhost:5000/api/gastos';

const form = document.getElementById('gastoForm');
const gastoIdInput = document.getElementById('gastoId');
const montoInput = document.getElementById('monto');
const categoriaInput = document.getElementById('categoria');
const fechaInput = document.getElementById('fecha');
const descripcionInput = document.getElementById('descripcion');
const formTitulo = document.getElementById('formTitulo');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

const gastosBody = document.getElementById('gastosBody');
const listStatus = document.getElementById('listStatus');
const emptyState = document.getElementById('emptyState');
const totalGeneralEl = document.getElementById('totalGeneral');
const totalesCategoriaEl = document.getElementById('totalesCategoria');

const filtroCategoria = document.getElementById('filtroCategoria');
const filtroMes = document.getElementById('filtroMes');
const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');

const modal = document.getElementById('confirmModal');
const confirmCancelar = document.getElementById('confirmCancelar');
const confirmEliminar = document.getElementById('confirmEliminar');

let gastoAEliminar = null;

const formatoMoneda = (valor) =>
  'RD$ ' + Number(valor).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatoFecha = (isoString) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

function mostrarStatus(el, mensaje, tipo) {
  el.textContent = mensaje;
  el.className = 'status-msg' + (tipo ? ' ' + tipo : '');
  if (mensaje) {
    setTimeout(() => {
      el.textContent = '';
      el.className = 'status-msg';
    }, 3500);
  }
}

function resetForm() {
  form.reset();
  gastoIdInput.value = '';
  formTitulo.textContent = 'Nuevo gasto';
  submitBtn.textContent = 'Guardar gasto';
  cancelBtn.classList.add('hidden');
  fechaInput.value = new Date().toISOString().slice(0, 10);
}

async function cargarGastos() {
  listStatus.textContent = 'Cargando gastos...';
  listStatus.className = 'status-msg';

  const params = new URLSearchParams();
  if (filtroCategoria.value) params.append('categoria', filtroCategoria.value);
  if (filtroMes.value) params.append('mes', filtroMes.value);

  try {
    const respuesta = await fetch(`${API_URL}?${params.toString()}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista de gastos');
    const gastos = await respuesta.json();

    listStatus.textContent = '';
    renderizarGastos(gastos);
  } catch (error) {
    mostrarStatus(listStatus, error.message, 'error');
  }
}

function renderizarGastos(gastos) {
  gastosBody.innerHTML = '';

  if (gastos.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  gastos.forEach((gasto) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatoFecha(gasto.fecha)}</td>
      <td><span class="categoria-tag">${gasto.categoria}</span></td>
      <td>${gasto.descripcion || '-'}</td>
      <td class="monto-cell">${formatoMoneda(gasto.monto)}</td>
      <td>
        <div class="row-actions">
          <button data-action="editar" data-id="${gasto._id}">Editar</button>
          <button data-action="eliminar" data-id="${gasto._id}">Eliminar</button>
        </div>
      </td>
    `;
    gastosBody.appendChild(fila);
  });
}

async function cargarTotales() {
  try {
    const respuesta = await fetch(`${API_URL}/totales`);
    if (!respuesta.ok) throw new Error('No se pudieron calcular los totales');
    const data = await respuesta.json();

    totalGeneralEl.textContent = formatoMoneda(data.totalGeneral);
    renderizarTotalesCategoria(data.porCategoria, data.totalGeneral);
  } catch (error) {
    totalesCategoriaEl.innerHTML = `<p class="status-msg error">${error.message}</p>`;
  }
}

function renderizarTotalesCategoria(porCategoria, totalGeneral) {
  totalesCategoriaEl.innerHTML = '';

  if (porCategoria.length === 0) {
    totalesCategoriaEl.innerHTML = '<p class="status-msg">Sin datos aun.</p>';
    return;
  }

  porCategoria.forEach((item) => {
    const porcentaje = totalGeneral > 0 ? (item.total / totalGeneral) * 100 : 0;
    const fila = document.createElement('div');
    fila.className = 'totales-row';
    fila.innerHTML = `
      <div style="flex:1">
        <div class="cat">${item._id}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${porcentaje.toFixed(0)}%"></div></div>
      </div>
      <div class="amt">${formatoMoneda(item.total)}</div>
    `;
    totalesCategoriaEl.appendChild(fila);
  });
}

async function refrescarTodo() {
  await Promise.all([cargarGastos(), cargarTotales()]);
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const payload = {
    monto: parseFloat(montoInput.value),
    categoria: categoriaInput.value,
    fecha: fechaInput.value,
    descripcion: descripcionInput.value.trim()
  };

  const id = gastoIdInput.value;
  const esEdicion = Boolean(id);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const respuesta = await fetch(esEdicion ? `${API_URL}/${id}` : API_URL, {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await respuesta.json();
    if (!respuesta.ok) throw new Error(data.mensaje || 'Ocurrio un error al guardar');

    mostrarStatus(formStatus, esEdicion ? 'Gasto actualizado' : 'Gasto creado', 'success');
    resetForm();
    refrescarTodo();
  } catch (error) {
    mostrarStatus(formStatus, error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = esEdicion ? 'Actualizar gasto' : 'Guardar gasto';
  }
});

cancelBtn.addEventListener('click', resetForm);

gastosBody.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;

  const id = boton.dataset.id;
  const accion = boton.dataset.action;

  if (accion === 'editar') {
    try {
      const respuesta = await fetch(`${API_URL}/${id}`);
      if (!respuesta.ok) throw new Error('No se pudo cargar el gasto');
      const gasto = await respuesta.json();

      gastoIdInput.value = gasto._id;
      montoInput.value = gasto.monto;
      categoriaInput.value = gasto.categoria;
      fechaInput.value = gasto.fecha.slice(0, 10);
      descripcionInput.value = gasto.descripcion || '';

      formTitulo.textContent = 'Editar gasto';
      submitBtn.textContent = 'Actualizar gasto';
      cancelBtn.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      mostrarStatus(listStatus, error.message, 'error');
    }
  }

  if (accion === 'eliminar') {
    gastoAEliminar = id;
    modal.classList.remove('hidden');
  }
});

confirmCancelar.addEventListener('click', () => {
  gastoAEliminar = null;
  modal.classList.add('hidden');
});

confirmEliminar.addEventListener('click', async () => {
  if (!gastoAEliminar) return;

  try {
    const respuesta = await fetch(`${API_URL}/${gastoAEliminar}`, { method: 'DELETE' });
    const data = await respuesta.json();
    if (!respuesta.ok) throw new Error(data.mensaje || 'No se pudo eliminar el gasto');

    mostrarStatus(listStatus, 'Gasto eliminado', 'success');
    refrescarTodo();
  } catch (error) {
    mostrarStatus(listStatus, error.message, 'error');
  } finally {
    modal.classList.add('hidden');
    gastoAEliminar = null;
  }
});

filtroCategoria.addEventListener('change', cargarGastos);
filtroMes.addEventListener('change', cargarGastos);
limpiarFiltrosBtn.addEventListener('click', () => {
  filtroCategoria.value = '';
  filtroMes.value = '';
  cargarGastos();
});

resetForm();
refrescarTodo();
