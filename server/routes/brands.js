const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');
const fs = require('fs').promises;

const router = express.Router();

// Safe model imports to prevent OverwriteModelError
const Brand = mongoose.models.Brand || require('../models/Brand');

let Catalogue;
try {
  Catalogue = mongoose.model('Catalogue');
} catch (error) {
  Catalogue = require('../models/Catalogue');
}

// Get all available brands (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Create a new brand (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, visibility, visibleToBuyers } = req.body;
    if (!name) return res.status(400).json({ message: 'Brand name is required' });
    
    // Validate visibility value
    if (visibility && !['all_approved', 'specific_buyers', 'hidden'].includes(visibility)) {
      return res.status(400).json({ 
        message: 'Invalid visibility value. Must be one of: all_approved, specific_buyers, hidden' 
      });
    }
    
    const existing = await Brand.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Brand already exists' });
    
    const brandData = { 
      name,
      visibility: visibility || 'all_approved',
      visibleToBuyers: visibility === 'specific_buyers' ? (visibleToBuyers || []) : []
    };
    
    const brand = new Brand(brandData);
    await brand.save();
    res.status(201).json({ brand });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
});

// (Optional) Delete a brand (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Delete all catalogue files for this brand
    const catalogues = await Catalogue.find({ brandId: req.params.id });
    for (const catalogue of catalogues) {
      for (const file of catalogue.files) {
        try {
          await fs.unlink(file.filePath);
        } catch (fileError) {
          // Ignore missing files
        }
      }
      await catalogue.deleteOne();
    }
    
    // Delete all collections (Excel files) for this brand
    const Collection = mongoose.models.Catalogue || require('../models/Catalogue');
    const collections = await Collection.find({ brandId: req.params.id });
    for (const collection of collections) {
      try {
        // Delete the physical file if it exists
        await fs.unlink(collection.filePath);
      } catch (fileError) {
        // Ignore missing files
      }
    }
    // Delete all collections from database
    await Collection.deleteMany({ brandId: req.params.id });
    
    // Delete the brand
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand and all associated files deleted' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ message: 'Failed to delete brand' });
  }
});

// PATCH /:id - Rename a brand (Admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'New name is required' });
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    // Check for duplicate name
    const existing = await Brand.findOne({ name });
    if (existing && existing._id.toString() !== brand._id.toString()) {
      return res.status(409).json({ message: 'Brand name already exists' });
    }
    brand.name = name;
    await brand.save();
    // Update all associated catalogues
    await Catalogue.updateMany({ brandId: brand._id }, { brandName: name });
    res.json({ message: 'Brand renamed successfully', brand });
  } catch (error) {
    console.error('Rename brand error:', error);
    res.status(500).json({ message: 'Failed to rename brand' });
  }
});

// PUT /:id/visibility - Update brand (folder) visibility and access (Admin only)
router.put('/:id/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Brand visibility update request:', {
      brandId: req.params.id,
      body: req.body,
      user: req.user
    });

    const { visibility, visibleToBuyers } = req.body;
    
    // Validate visibility value
    if (!visibility || !['all_approved', 'specific_buyers', 'hidden'].includes(visibility)) {
      return res.status(400).json({ 
        message: 'Invalid visibility value. Must be one of: all_approved, specific_buyers, hidden' 
      });
    }

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      console.log('Brand not found:', req.params.id);
      return res.status(404).json({ message: 'Brand not found' });
    }

    console.log('Found brand:', brand.name, 'Current visibility:', brand.visibility);

    brand.visibility = visibility;
    if (visibility === 'specific_buyers') {
      brand.visibleToBuyers = visibleToBuyers || [];
      console.log('Setting visibleToBuyers:', brand.visibleToBuyers);
    } else {
      brand.visibleToBuyers = [];
      console.log('Clearing visibleToBuyers for non-specific visibility');
    }

    await brand.save();
    console.log('Brand visibility updated successfully:', brand.name, 'New visibility:', brand.visibility);
    
    res.json({ message: 'Brand visibility updated successfully', brand });
  } catch (error) {
    console.error('Update brand visibility error:', error);
    res.status(500).json({ message: 'Failed to update brand visibility', error: error.message });
  }
});

module.exports = router; 