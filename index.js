const express = require('express')
const path = require('path'); 
const mongoose = require('mongoose')
const morgan = require('morgan')
const crypto = require('crypto')
const multer = require('multer'); 
const fs = require('fs');
const bcrypt = require('bcrypt');
const Order = require('./model/Order_model.js')
const Store  = require('./model/Store_model.js')
const Product  = require('./model/Product_model.js')
const { sendVerificationEmail } = require('./utils/sendEmail.js'); 
const { getAlreadyVerifiedPage, getSuccessPage, getErrorPage } = require('./templates/email-verification');

// Upload method
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') 
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });


//initialize app
const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

//url link
const Urldb =process.env.MONGODB_URI;

//connect to database
mongoose.connect(Urldb)
.then(result => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port 5000');
    });
})
.catch(err => console.log(err))

app.post("/SignIn", async (req, res) => {
    try {
        const store = await Store.findOne({ Address: req.body.Address });
        if (!store) {
            return res.json({
                find: false,
                message: "Address not found"
            });
        } 
        const isMatch = await bcrypt.compare(req.body.Password, store.Password);
        if (!isMatch) {
            return res.json({
                find: false,
                message: "Wrong password"
            });
        }

        res.json({
            find: true,
            result: store
        });

    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({
            success: false,
            message: "Error signing in",
            error: error.message
        });
    }
});

app.post("/SignUp",upload.single('Logo'), async (req, res) => {

    Store.findOne({
        Address: req.body.Address,
}).then(async (result) => {
        if (result) { 
          res.json({
                creation: false,
                message: "Store already exists",
            });
        } else{
         const hashedPassword = await bcrypt.hash(req.body.Password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const logoPath = req.file ? req.file.path : "/uploads/DefaultLogo.png";
        
        const newStore= new Store({
      Address:req.body.Address,
      Password:hashedPassword,
      EmailVerificationToken: verificationToken,
      Name: req.body.Name,      
      Location: req.body.Location, 
      Description: req.body.Description ,
      Logo: logoPath 
    });

    newStore.save();
    const emailSent = await sendVerificationEmail(req.body.Address, verificationToken);
    res.json({
      creation: true,
      message: "Store created successfully",
    });
        }
  
})
})


app.get("/verify-email", async (req, res) => {

    try {
        const { token } = req.query;

        if (!token) {
            return res.send(getErrorPage("Verification token is required"));
        }

        const store = await Store.findOne({ 
            EmailVerificationToken: token
        });

        if (!store) {
            return res.send(getErrorPage("Invalid or expired verification token"));
        }

        if (store.isEmailVerified) {
            return res.send(getAlreadyVerifiedPage(store.Address));
        }

        store.isEmailVerified = true;        
        await store.save();

        res.send(getSuccessPage(store.Address));

    } catch (error) {
        res.send(getErrorPage("Server error. Please try again later"));
    }
});

app.post("/AddProduct", upload.single('Image'), (req, res) => {
    
    const imagePath = req.file ? req.file.path : "";
    let sizeQuantities = req.body.SizeQuantities;
    sizeQuantities = JSON.parse(sizeQuantities);
    
    const newProduct = new Product({
        Name: req.body.Name,
        Price: req.body.Price,
        Rating: req.body.Rating,
        SizeQuantities: sizeQuantities, 
        Store: req.body.Store,
        Category:req.body.Category,
        ImageUrl: imagePath,
        TotalQuantity:req.body.TotalQuantity,
        Gender:req.body.Gender,
    });

    newProduct.save()
        .then(savedProduct => {
            return Store.findByIdAndUpdate(
                req.body.Store,  
                { $push: { products: savedProduct._id } }
            );
        })
        .then(updatedStore => {
            res.json({
                creation: true,
                message: "Product created successfully and added to store"
            });
            console.log("Product Added to DB and linked to Store");
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                creation: false,
                message: "Error creating product",
                error: err.message
            });
        });
});


app.delete("/DeleteProduct", async (req, res) => {
    try {
        const productId = req.body.Id;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.json({
                deletion: false,
                message: "Product not found"
            });
        }
        
        const storeId = product.Store;     

        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { $pull: { products: productId } },
            { new: true }
        );
        
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        if (product.ImageUrl) {
            fs.unlink(product.ImageUrl, (err) => {
                if (err) console.log("⚠️ Error deleting image:", err);
                else console.log("✅ Image deleted:", product.ImageUrl);
            });
        }
        
        res.json({
            deletion: true,
            message: "Product deleted successfully from Product collection and Store array",
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            deletion: false,
            message: "Error deleting product",
            error: err.message
        });
    }
});

app.post("/GetStoreProducts", async (req, res) => {
    try {
        const products = await Product.find({ Store: req.body.Id});
        
        res.json({
            success: true,
            count: products.length,
            products: products
        });

    } catch (error) {
        console.error('Error fetching store products:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
},
 app.post("/AddOrder", async (req, res) => {
  try {
    const { store, type, products } = req.body
 
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one product.' })
    }

     const totalPrice = products.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
 
    const order = new Order({
      store,
      user: req.user._id,   
      type: type || 'At Home',
      products,
      totalPrice,
      status: 'prepared',
    })
 
    const saved = await order.save()
 
    res.status(201).json({
      message: 'Order created successfully.',
      order: saved,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
))

app.post("/GetAllOrders", async (req, res) => {
    try {
        const orders = await Order.find({ store: req.body.StoreId});
         

        res.json({
            success: true,
            count: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
});

app.post("/UpdateOrderStatus", async (req, res) => {
    try {
        const order = await Order.findById(req.body.OrderId);

        if (!order) {
            return res.json({
                success: false,
                message: "Order not found"
            });
        }

        const validStatuses = ['prepared', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(req.body.status)) {
            return res.json({
                success: false,
                message: "Invalid status, must be one of: " + validStatuses.join(', ')
            });
        }

        order.status = req.body.status;

        // if cancelled, save the reason
        if (req.body.status === 'cancelled') {
            order.cancelReason = req.body.cancelReason || '';
        }

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
});
