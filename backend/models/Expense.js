import mongoose from 'mongoose';
const expenseSchema = new mongoose.Schema({}, { strict: false });
expenseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});
export default mongoose.model('Expense', expenseSchema);
