import mongoose from 'mongoose';
const purchaseSchema = new mongoose.Schema({}, { strict: false });
purchaseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('Purchase', purchaseSchema);
