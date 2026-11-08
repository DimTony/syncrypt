import speakeasy from "speakeasy";
import QRCode from "qrcode";

async function main() {
  const secret = speakeasy.generateSecret({
    name: "Office Direct (Admin)",
    issuer: "Office",
    length: 20,
  });

  console.log("BASE32 SECRET:");
  console.log(secret.base32);

  console.log("\nOTP AUTHENTICATION URL:");
  console.log(secret.otpauth_url);

  const qr = await QRCode.toDataURL(secret.otpauth_url!);

  console.log("\nQR CODE DATA URL:");
  console.log(qr);
}

main();