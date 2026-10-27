import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 40, unique: true },
  color: { type: String, default: '#6366f1', match: /^#([0-9a-fA-F]{6})$/ }
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)