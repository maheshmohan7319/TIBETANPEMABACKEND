const axios = require('axios');
const crypto = require('crypto-js');



exports.initiatePayment = async (req, res) => {
  try {
    const data = req.body;
    const apidata = {
      merchantId: process.env.NEXT_API_MERCHANT_ID,
      merchantTransactionId: data.merchantTransactionId,
      merchantUserId: data.merchantUserId,
      amount: data.amount,
      redirectUrl: "http://localhost:5000/api/payment/paystatus",
      redirectMode: "POST",
      callbackUrl: "http://localhost:5000/api/payment/paystatus",
      mobileNumber: data.mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const data2 = JSON.stringify(apidata);
    const base64data = Buffer.from(data2).toString("base64");
    const hash = crypto.SHA256(
      base64data + "/pg/v1/pay" + process.env.NEXT_API_MERCHANT_KEY
    ).toString(crypto.enc.Hex);
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
    console.error("Error in initiatePayment:", error);
    res.status(500).json({ message: "Error", error: error.message });
  }
};



exports.getPaymentStatus = async (req, res) => {
  try {
    const transactionId  = req.params.transactionId;

    const st = `/pg/v1/status/${process.env.NEXT_API_MERCHANT_ID}/${transactionId}${process.env.NEXT_API_MERCHANT_KEY}`;
    const dataSha256 = crypto.SHA256(st).toString();
    const checksum = `${dataSha256}###${process.env.NEXT_API_MERCHANT_VERSION}`;

    const options = {
      method: "GET",
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${process.env.NEXT_API_MERCHANT_ID}/${transactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": process.env.NEXT_API_MERCHANT_ID,
      },
    };

    const response = await axios.request(options);

    if (response.data.code === "PAYMENT_SUCCESS") {
      res.redirect(`http://localhost:5000/success?transactionId=${transactionId}`);
    } else {
      res.redirect(`http://localhost:5000/failure?transactionId=${transactionId}`);
    }
  } catch (error) {
    console.error("Error in getPaymentStatus:", error);
    res.status(500).json({ message: "Error", error: error.message });
  }
};
