const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other']
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  images: [{ 
    type: String 
  }],
  sku: { 
    type: String, 
    required: true,
    unique: true
  },
  brand: { 
    type: String 
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  createdBy: { 
    type: mongoose.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);
