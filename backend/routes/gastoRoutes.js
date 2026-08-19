const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');

router.get('/totales', gastoController.getTotales);
router.get('/', gastoController.getGastos);
router.get('/:id', gastoController.getGasto);
router.post('/', gastoController.createGasto);
router.put('/:id', gastoController.updateGasto);
router.delete('/:id', gastoController.deleteGasto);

module.exports = router;
