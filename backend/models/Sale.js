import mongoose from 'mongoose';
const saleSchema = new mongoose.Schema({}, { strict: false });
saleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('Sale', saleSchema);
