const mongoose = require('mongoose')
const Schema = mongoose.Schema


const OrderSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    type: {
      type: String,
      enum: ['At Home', 'In Store'],
      default: 'At Home',
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',   // fixed: was pointing to 'Users'
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        size:  { type: String, default: '' },
        color: { type: String, default: '' },
      },
    ],
    status: {
      type: String,                               
      enum: ['prepared', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'prepared',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }   // adds createdAt + updatedAt automatically
)

const Order = mongoose.model('Order', OrderSchema)
module.exports = Order