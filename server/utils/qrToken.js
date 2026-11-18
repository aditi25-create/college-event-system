import jwt from "jsonwebtoken";
import QRCode from "qrcode";

// Sign QR data with the secret key so tickets cannot be forged
export const generateQRToken = (registrationId, ticketId, eventId) => {
  return jwt.sign(
    {
      regId: registrationId,
      ticketId,
      eventId,
    },
    process.env.QR_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};

// Verify signed QR token scanned at the event
export const verifyQRToken = (token) => {
  return jwt.verify(token, process.env.QR_TOKEN_SECRET);
};

// Generate base64 Data URL PNG image for the QR code
export const generateQRCodeImage = async (dataString) => {
  return await QRCode.toDataURL(dataString, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 280,
    color: {
      dark: "#1e293b", // Slate 800
      light: "#ffffff",
    },
  });
};
