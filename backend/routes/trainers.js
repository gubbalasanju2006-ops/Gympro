const express = require('express');
const router = express.Router();
const { Trainer } = require('../models');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.findAll({ where: { userId: req.user.userId }, order: [['joinDate', 'DESC']] });
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trainer
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add trainer
router.post('/', async (req, res) => {
  try {
    const { name, phone, specialty, status } = req.body;

    const existingTrainer = await Trainer.findOne({ where: { userId: req.user.userId, phone } });
    if (existingTrainer) {
      return res.status(400).json({ error: 'Trainer with this phone number already exists' });
    }

    const trainer = await Trainer.create({
      userId: req.user.userId,
      name: name.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      status: status || 'Active',
      joinDate: new Date()
    });

    res.status(201).json(trainer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update trainer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, specialty, status } = req.body;

    const trainer = await Trainer.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

    await trainer.update({ name, phone, specialty, status });
    res.json(trainer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE trainer
router.delete('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
    await trainer.destroy();
    res.json({ message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
