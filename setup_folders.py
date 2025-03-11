import os

# Define the folder structure
folders = [
    "src",
    "src/app",
    "src/app/api",
    "src/app/components",
    "src/app/pages",
    "src/app/styles",
    "src/lib",
    "src/blockchain/contracts",
    "src/blockchain/scripts",
    "src/hooks",
    "public"
]

# Define files to create (for reference)
files = {
    ".gitignore": "",
    "next.config.js": "",
    "package.json": "",
    "README.md": "# Heal-Sync: Blockchain-Based Organ Donation System",
    "tsconfig.json": "",
    "src/app/api/auth.ts": "// Firebase Authentication API",
    "src/app/api/donor.ts": "// API for Donor Data",
    "src/app/api/recipient.ts": "// API for Recipient Data",
    "src/app/api/matching.ts": "// API for Rule-Based Matching",
    "src/app/pages/index.tsx": "// Landing Page",
    "src/app/pages/dashboard.tsx": "// User Dashboard",
    "src/app/pages/register.tsx": "// Donor & Recipient Registration",
    "src/lib/firebase.ts": "// Firebase setup",
    "src/lib/mongodb.ts": "// MongoDB connection setup",
    "src/blockchain/contracts/DonorRecipient.sol": "// Solidity Smart Contract",
    "src/blockchain/scripts/deploy.js": "// Deployment Script",
}

# Function to create folders
def create_folders():
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"📂 Created: {folder}")

# Function to create files
def create_files():
    for file, content in files.items():
        with open(file, "w") as f:
            f.write(content)
        print(f"📄 Created: {file}")

if __name__ == "__main__":
    create_folders()
    create_files()
    print("\n✅ Folder structure setup completed successfully!")
