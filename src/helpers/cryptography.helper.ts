import CryptoJS from "crypto-js";

import { _env } from "@/constants/_environment";
import { IPaymentData } from "@/interfaces/payment.interface";

export const encrypt = (text: string, enk: string, eni: string): string => {
  const encrypted = CryptoJS.AES.encrypt(text, enk, {
    iv: CryptoJS.enc.Utf8.parse(eni),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

export const decrypt = (
  encryptedText: string,
  enk: string,
  eni: string,
): IPaymentData => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedText,
      CryptoJS.enc.Utf8.parse(enk),
      {
        iv: CryptoJS.enc.Utf8.parse(eni),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    // const decryptedBase64 = CryptoJS.enc.Base64.stringify(decrypted);
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8).trim();
    // const decryptedStr = atob(decryptedBase64).trim();
    const decryptedObj = JSON.parse(decryptedStr);

    return decryptedObj;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return {
      AmountPaid: 0,
      ExpireURL: "",
      MerchantName: "",
      MID: "",
      PaymentLinkID: "",
      ProductName: "",
      TransactionID: "",
    };
  }
};
