const crypto = require('crypto');


const validatePaymentRequest = (req, res, next) => {
    const { amount, mobileNumber } = req.body;
    if (!amount || !mobileNumber) {
        return res.status(400).json({ Success: false, Message: 'Invalid payment request data' });
    }
    next();
};

function generateRandomMerchantTransactionId(length) {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateChecksum(input, saltKey) {
    const endpoint = '/pg/v1/pay';
    const saltIndex = '1';
    const saltedInput = `${input}${endpoint}${saltKey}`;

    const hash = crypto.createHash('sha256').update(saltedInput).digest('hex');
    return `${hash}###${saltIndex}`;
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = angle => (Math.PI / 180) * angle;
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

module.exports = {
    validatePaymentRequest,
    generateRandomMerchantTransactionId,
    generateChecksum,
    calculateDistance
};
