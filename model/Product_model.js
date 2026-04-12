const mongoose = require('mongoose')
const Schema =mongoose.Schema

const ProductSchema = new  Schema({
    Name : {
        type:String,
        required:true
    },
    Price : {
        type:Number,
        required:true
    },
    Rating: {
        type : Number,
        min:0,
        max:5,
        default:0,
    },
    TotalQuantity:{
        type:Number,
        required:true
    },
    SizeQuantities: [{
        Size: {
            type: String,
            required: true
        },
        Quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    Store:{
        type: Schema.Types.ObjectId,
        ref: 'Store'  
    },
    ImageUrl:{
        type: String,
    },
    Category:{
        type: String,
        required: true,
    },
    Gender:{
        type:String,
        required: true,
    }
})

const Product = mongoose.model('Product',ProductSchema)

module.exports=Product