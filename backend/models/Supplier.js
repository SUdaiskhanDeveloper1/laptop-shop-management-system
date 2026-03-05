import mongoose from 'mongoose';
const supplierSchema = new mongoose.Schema({}, { strict: false });
supplierSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('Supplier', supplierSchema);
