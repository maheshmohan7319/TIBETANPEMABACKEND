const axios = require('axios');
const crypto = require('crypto-js');
const sha256 = require('crypto-js/sha256');
const Payment = require('../middleware/payment');
const Order = require('../models/order'); 
const Address = require('../models/address');



exports.processPayment = async (req, res) => {
  try {
    const data = req.body;
    const apidata = {
      merchantId: process.env.NEXT_API_MERCHANT_ID,
      merchantTransactionId: data.merchantTransactionId,
      merchantUserId: data.merchantUserId,
      amount: data.amount,
      redirectUrl: `http://localhost:17600/api/payment/Status`,
      redirectMode: "POST",
      callbackUrl: `http://localhost:17600/api/payment/Status`,
      mobileNumber: data.mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const data2 = JSON.stringify(apidata);
    const base64data = Buffer.from(data2).toString("base64");

    const hash = crypto
      .SHA256(base64data + "/pg/v1/pay" + process.env.NEXT_API_MERCHANT_KEY)
      .toString(crypto.enc.Hex);
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

    res.status(200).json({ message: "Success", data: response.data.data });
  } catch (error) {
    console.error("Error in processPayment handler:", error);
    res.status(500).json({ message: "Error", error: error.message });
  }
};
exports.processPaymentStatus = async (req, res) => {
    try {
      console.log('Request body:', req.body);
      const { merchantId, transactionId, amount, providerReferenceId } = req.body;
  
      const st = `/pg/v1/status/${merchantId}/${transactionId}${process.env.NEXT_API_MERCHANT_KEY}`;
      const dataSha256 = sha256(st).toString();
      const checksum = `${dataSha256}###${process.env.NEXT_API_MERCHANT_VERSION}`;
  
      console.log('Checksum:', checksum);
      console.log('Merchant ID:', merchantId);
  
      const options = {
        method: 'GET',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId,
        },
      };
  
      console.log('Request options:', options);
  
      const response = await axios.request(options);
  
      console.log('API response:', response.data);
  
      if (response.data.code === 'PAYMENT_SUCCESS') {
        res.redirect(301, `http://localhost:3000/success?transactionId=${transactionId}&amount=${amount}&providerReferenceId=${providerReferenceId}`);
      } else {
        res.redirect(301, `http://localhost:3000/failure?transactionId=${transactionId}&amount=${amount}&providerReferenceId=${providerReferenceId}`);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.redirect(301, `http://localhost:3000/failure?transactionId=${req.body.transactionId}&amount=${req.body.amount}&providerReferenceId=${req.body.providerReferenceId}`);
    }
  };

