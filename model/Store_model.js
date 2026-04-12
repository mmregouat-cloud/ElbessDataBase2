const mongoose = require('mongoose')
const Schema =mongoose.Schema

const StoreSchema = new  Schema({
    Name : {
        type:String,
        required:true
    },
    Location : {
        type:String,
        required:true
    },
    Description: {
    type: String,
    default: "",
    },
    ActiveProducts: {
        type : Number,
        default:0,
    },
    Rating: {
        type : Number,
        min:0,
        max:5,
        default:0,
    },
    Revenus :{
        type:Number,
        default:0
    },
    ShippingTime: {
        type : Number,
        default:3,
    }, 
    products:[{
        type: Schema.Types.ObjectId,
        ref: 'Product'  
    }],
    Oreders:{
        type: Schema.Types.ObjectId,
        ref:'Order'
    },
    TotalOrders :{
        type:Number,
        default:0
    },
    Address : {
        type:String,
        required:true
    },
    Password : {
        type:String,
        required:true
    },
    isEmailVerified: {
    type: Boolean,
    default: false,
    },
    EmailVerificationToken: {
        type : String,

    },
    Logo :{
        type:String,
        default:"/uploads/DefaultLogo.png"
    }
})

const Store = mongoose.model('Store',StoreSchema)

module.exports=Store