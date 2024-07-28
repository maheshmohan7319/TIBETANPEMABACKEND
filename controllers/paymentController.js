const axios = require('axios');
const Payment = require('../middleware/payment');
const Order = require('../models/order'); 
const Address = require('../models/address');



exports.generatePaymentLink = async (req, res) => {
  try {
      const { userId, amount, mobileNumber, addressId } = req.body;
      const address = await Address.findById(addressId);
      if (!address) {
          return res.status(404).json({ status: false, message: 'Address not found' });
      }
      const warehouseLocation = { latitude: 12.9716, longitude: 77.5946 }; 

    
      const distance = Payment.calculateDistance(
          warehouseLocation.latitude,
          warehouseLocation.longitude,
          address.latitude,
          address.longitude
      );

     
      let deliveryDays = 3; 
      if (distance > 50) deliveryDays = 5;
      if (distance > 200) deliveryDays = 7;

      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + deliveryDays);

    
      const transactionId = uniqid();
      const newOrder = new Order({
          userId,
          transactionId,
          amount,
          expectedDeliveryDate,
          address: address._id
      });

      await newOrder.save();

      const apidata = {
          merchantId: process.env.NEXT_API_MERCHANT_ID,
          merchantTransactionId: transactionId,
          merchantUserId: userId,
          amount: amount.toString(),
          redirectUrl: `http://localhost:${PORT}/api/paystatus`,
          redirectMode: "POST",
          callbackUrl: `http://localhost:${PORT}/api/paystatus`,
          mobileNumber: mobileNumber,
          paymentInstrument: {
              type: "UPI_QR",
          },
      };

      const data2 = JSON.stringify(apidata);
      const base64data = Buffer.from(data2).toString("base64");

      const hash = crypto
          .createHash('sha256')
          .update(base64data + "/pg/v1/pay" + process.env.NEXT_API_MERCHANT_KEY)
          .digest('hex');
      const verify = hash + "###" + process.env.NEXT_API_MERCHANT_VERSION;

      const response = await axios.post(
          "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
          { request: base64data },
          {
              headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                  "X-VERIFY": verify,
              },
          }
      );

      res.json({ message: "Success", data: response.data.data });
  } catch (error) {
      console.error("Error in POST handler:", error);
      res.status(500).json({ message: "Error", error: error.message });
  }
};

