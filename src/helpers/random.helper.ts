import moment from "moment";

export const generateRef1 = () => {
  const date = new Date();
  const dateStr = moment(date).format("YYYYMMDDHHmmss");
  const randomNumber = Math.floor(Math.random() * 900) + 100;

  let result = "";
  result = dateStr + randomNumber.toString();
  return result;
};

export const generateRef2 = () => {
  const date = new Date();
  const dateStr = moment(date).format("YYYYMMDDHHmmss");
  const randomNumber = Math.floor(Math.random() * 900) + 100;

  let result = "";
  result = "REF" + dateStr + randomNumber.toString();
  return result;
};

export const generateTransactionID = () => {
  // const date = new Date();
  // const dateStr = moment(date).format("YYYYMMDDHHmmss");

  // let result = "";
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, "");
  const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const transactionCode = "TRN" + formattedDate + formattedTime;
  return transactionCode;
};
