const Airdrop = require('../models/airdropModel');

// @desc    Get all airdrops
// @route   GET /api/airdrops
// @access  Public
const getAirdrops = async (req, res) => {
  try {
    const airdrops = await Airdrop.find({});
    res.json(airdrops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single airdrop
// @route   GET /api/airdrops/:id
// @access  Public
const getAirdropById = async (req, res) => {
  try {
    const airdrop = await Airdrop.findById(req.params.id);
    
    if (airdrop) {
      res.json(airdrop);
    } else {
      res.status(404).json({ message: 'Airdrop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new airdrop
// @route   POST /api/airdrops
// @access  Public (would be Private in a real app)
const createAirdrop = async (req, res) => {
  try {
    const { title, description, token, criteria, deadline, status, link } = req.body;

    const airdrop = await Airdrop.create({
      title,
      description,
      token,
      criteria,
      deadline,
      status,
      link,
    });

    res.status(201).json(airdrop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an airdrop
// @route   PUT /api/airdrops/:id
// @access  Public (would be Private in a real app)
const updateAirdrop = async (req, res) => {
  try {
    const { title, description, token, criteria, deadline, status, link } = req.body;

    const airdrop = await Airdrop.findById(req.params.id);

    if (airdrop) {
      airdrop.title = title || airdrop.title;
      airdrop.description = description || airdrop.description;
      airdrop.token = token || airdrop.token;
      airdrop.criteria = criteria || airdrop.criteria;
      airdrop.deadline = deadline || airdrop.deadline;
      airdrop.status = status || airdrop.status;
      airdrop.link = link || airdrop.link;

      const updatedAirdrop = await airdrop.save();
      res.json(updatedAirdrop);
    } else {
      res.status(404).json({ message: 'Airdrop not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an airdrop
// @route   DELETE /api/airdrops/:id
// @access  Public (would be Private in a real app)
const deleteAirdrop = async (req, res) => {
  try {
    const airdrop = await Airdrop.findById(req.params.id);

    if (airdrop) {
      await Airdrop.deleteOne({ _id: req.params.id });
      res.json({ message: 'Airdrop removed' });
    } else {
      res.status(404).json({ message: 'Airdrop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAirdrops,
  getAirdropById,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
};
