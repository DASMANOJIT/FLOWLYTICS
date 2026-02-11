import crypto from "crypto";

export const phonepeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX,
  baseUrl: process.env.PHONEPE_BASE_URL
};

export const generateChecksum = (payload) => {
  const jsonPayload = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonPayload).toString("base64");

  const stringToSign = base64Payload + "/pg/v1/pay" + phonepeConfig.saltKey;
  const checksum = crypto.createHash("sha256").update(stringToSign).digest("hex");

  return {
    base64Payload,
    checksum: checksum + "###" + phonepeConfig.saltIndex
  };
};
