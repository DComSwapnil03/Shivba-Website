const express = require('express');
const router = express.Router();
const { Service, TeamMember, Value } = require('../models');

// GET all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error.message);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
});

// GET single service by serviceId
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ serviceId: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error.message);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
});

// GET team members
router.get('/about/team', async (req, res) => {
  try {
    const team = await TeamMember.find();
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error.message);
    res.status(500).json({ message: 'Server error while fetching team' });
  }
});

// GET values
router.get('/about/values', async (req, res) => {
  try {
    const values = await Value.find();
    res.json(values);
  } catch (error) {
    console.error('Error fetching values:', error.message);
    res.status(500).json({ message: 'Server error while fetching values' });
  }
});

module.exports = router;
