import mongoose from 'mongoose';
const laptopSchema = new mongoose.Schema({}, { strict: false });
laptopSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('Laptop', laptopSchema);
