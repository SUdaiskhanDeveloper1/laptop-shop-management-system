import mongoose from 'mongoose';
const additionalSaleSchema = new mongoose.Schema({}, { strict: false });
additionalSaleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('AdditionalSale', additionalSaleSchema);
