const Gasto = require('../models/Gasto');

exports.getGastos = async (req, res) => {
  try {
    const { categoria, mes } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;

    if (mes) {
      const [anio, mesNum] = mes.split('-').map(Number);
      const inicio = new Date(anio, mesNum - 1, 1);
      const fin = new Date(anio, mesNum, 1);
      filtro.fecha = { $gte: inicio, $lt: fin };
    }

    const gastos = await Gasto.find(filtro).sort({ fecha: -1 });
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los gastos', error: error.message });
  }
};

exports.getGasto = async (req, res) => {
  try {
    const gasto = await Gasto.findById(req.params.id);
    if (!gasto) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    res.status(200).json(gasto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el gasto', error: error.message });
  }
};

exports.createGasto = async (req, res) => {
  try {
    const nuevoGasto = await Gasto.create(req.body);
    res.status(201).json(nuevoGasto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
    }
    res.status(500).json({ mensaje: 'Error al crear el gasto', error: error.message });
  }
};

exports.updateGasto = async (req, res) => {
  try {
    const gastoActualizado = await Gasto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!gastoActualizado) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    res.status(200).json(gastoActualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Datos invalidos', error: error.message });
    }
    res.status(500).json({ mensaje: 'Error al actualizar el gasto', error: error.message });
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    const gastoEliminado = await Gasto.findByIdAndDelete(req.params.id);
    if (!gastoEliminado) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    res.status(200).json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el gasto', error: error.message });
  }
};

exports.getTotales = async (req, res) => {
  try {
    const totalesPorCategoria = await Gasto.aggregate([
      { $group: { _id: '$categoria', total: { $sum: '$monto' } } },
      { $sort: { total: -1 } }
    ]);

    const totalesPorMes = await Gasto.aggregate([
      {
        $group: {
          _id: { anio: { $year: '$fecha' }, mes: { $month: '$fecha' } },
          total: { $sum: '$monto' }
        }
      },
      { $sort: { '_id.anio': -1, '_id.mes': -1 } }
    ]);

    const totalGeneral = await Gasto.aggregate([
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);

    res.status(200).json({
      totalGeneral: totalGeneral[0]?.total || 0,
      porCategoria: totalesPorCategoria,
      porMes: totalesPorMes
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular los totales', error: error.message });
  }
};
