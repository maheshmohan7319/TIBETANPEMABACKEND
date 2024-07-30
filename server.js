
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productHelperRoutes = require('./routes/productHelperRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');



dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(cors())


app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', productHelperRoutes);
app.use('/api/addresses', addressRoutes);





app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
