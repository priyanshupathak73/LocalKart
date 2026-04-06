const mongoose = require('mongoose');

// ── Sub-schemas ──────────────────────────────────────────────

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  icon:        { type: String, default: '🔧' },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
}, { _id: false });

const testimonialSchema = new mongoose.Schema({
  name:    { type: String, default: 'Customer' },
  role:    { type: String, default: 'Customer' },
  text:    { type: String, default: '' },
  rating:  { type: Number, default: 5 },
}, { _id: false });

const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
}, { _id: false });

const openingHoursSchema = new mongoose.Schema({
  weekdays: { type: String, default: '9:00 AM - 6:00 PM' },
  weekends: { type: String, default: '10:00 AM - 5:00 PM' },
}, { _id: false });

// ── Main Business Schema ─────────────────────────────────────

const businessSchema = new mongoose.Schema({
  id:            { type: String, required: true, unique: true },
  name:          { type: String, required: true },
  category:      { type: String, required: true, index: true },
  categoryIcon:  { type: String, default: '🏪' },
  phone:         { type: String, default: '' },
  email:         { type: String, default: '' },
  whatsapp:      { type: String, default: '' },
  address:       { type: String, default: '' },
  coordinates:   coordinatesSchema,
  openingHours:  openingHoursSchema,
  tagline:       { type: String, default: '' },
  description:   { type: String, default: '' },
  image:         { type: String, default: '' },       // filename or URL
  rating:        { type: Number, default: 0 },
  reviews:       { type: Number, default: 0 },
  services:      [serviceSchema],
  testimonials:  [testimonialSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Business', businessSchema);
