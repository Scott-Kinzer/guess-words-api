export const generatePincode = (): string => {
  const pincodeLength = 5;
  let pincode = '';

  for (let i = 0; i < pincodeLength; i++) {
    pincode += Math.floor(Math.random() * 10).toString();
  }

  return pincode;
};
