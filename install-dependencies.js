const { exec } = require("child_process");

const dependencies = [
  "next react react-dom",
  "tailwindcss postcss autoprefixer",
  "firebase @firebase/auth @firebase/firestore",
  "mongoose axios express dotenv",
  "ethers web3 @openzeppelin/contracts thirdweb",
  "helia @helia/unixfs",
  "truffle eslint prettier husky lint-staged"
];

console.log("🚀 Installing dependencies... This may take a while.");

dependencies.forEach((dep) => {
  console.log(`📦 Installing: ${dep}`);
  exec(`npm install ${dep}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error installing ${dep}:`, stderr);
    } else {
      console.log(`✅ Installed: ${dep}`);
    }
  });
});

console.log("🎉 All dependencies are being installed. Check for any errors.");
