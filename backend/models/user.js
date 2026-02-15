const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const addressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // For email/password auth
  picture: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  cart: [cartItemSchema],
  addresses: [addressSchema],
  orders: [{ type: mongoose.Types.ObjectId, ref: 'Order' }],
  phone: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
