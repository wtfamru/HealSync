# HealSync - Decentralized Organ Donation Platform

HealSync is a hybrid platform connecting organ donors with recipients, combining the security of blockchain technology with the reliability of Firebase. Built with Next.js, Firebase, and ThirdWeb for smart contract deployment.

## 🚀 Features Implemented

### Authentication & Data Management (Firebase)
- Complete authentication system with Firebase Auth
- Secure data storage with Firestore
- Role-based access (Donors, Hospitals)
- Protected routes and authenticated sessions
- User profile management
- Real-time data updates
- Structured data models

### Donor Features
- Comprehensive donor registration form with:
  - Personal details (Name, DOB, Gender)
  - Contact information
  - Blood group selection
  - Multiple organ donation preferences
  - ID verification
  - Hospital selection
- Pledge submission system
- Status tracking
- Hospital assignment

### Hospital Dashboard
- Complete hospital management interface with:
  - Statistical overview and analytics
  - Donor registration system
  - Patient registration
  - Organ verification workflow
  - Transplant matching
  - Donor status management
  - PDF report upload/verification
  - Searchable donor and pledge lists

### Advanced Features
- Real-time donor status updates
- PDF report management for organ verification
- Advanced search and filtering
  - Donor search
  - Pledge filtering
  - Organ availability tracking
- Detailed view dialogs for pledge information
- Status tracking (Active/Deceased/Verified)
- Multi-step verification process

### Prepared for Blockchain Integration
- Smart contract architecture designed
- Wallet connection UI components ready
- ThirdWeb SDK integration prepared
- Blockchain event listeners structured
- Transaction handling system designed

## 🛠️ Tech Stack

### Core Stack
- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Context
- **Notifications**: Sonner
- **Icons**: Lucide React

### Blockchain Stack
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Web3 Development**: ThirdWeb
- **Smart Contract Language**: Solidity
- **Wallet Integration**: ThirdWeb Connect

## 📝 Next Steps

### Immediate Priority: Blockchain Integration
1. Deploy prepared smart contracts using ThirdWeb
   - Donor Registration Contract
   - Patient Registration Contract
   - Organ Matching Contract
   - Hospital Verification Contract
   - Transaction Management Contract

2. Integrate blockchain features with Firebase
   - Connect donor registration with smart contracts
   - Implement decentralized organ matching
   - Store verification status on blockchain
   - Create transparent donation tracking
   - Enable smart contract-based hospital verification

3. Add Web3 specific features
   - Wallet connection and management
   - Gas fee estimation and handling
   - Transaction confirmation flows
   - Block confirmation tracking
   - Event subscription and real-time updates

### Smart Contract Features to Implement
1. Donor Management
   - On-chain donor registration
   - Organ availability tracking
   - Status updates (Active/Deceased)
   - Donation history

2. Patient Management
   - On-chain patient registration
   - Organ requirements tracking
   - Priority calculation
   - Waiting list management

3. Hospital Operations
   - Hospital verification on blockchain
   - Organ matching confirmation
   - Transplant record management
   - Smart contract-based verification

4. Matching System
   - Automated organ matching algorithm
   - Priority-based allocation
   - Blood type compatibility checking
   - HLA matching verification

### Additional Development
1. Implement smart contract testing
2. Add blockchain transaction monitoring
3. Develop emergency backup systems
4. Create blockchain explorer integration
5. Add multi-signature requirements for critical operations

### Documentation & Testing
1. Smart contract documentation
2. Web3 integration guides
3. Security audit preparation
4. Gas optimization documentation
5. Blockchain interaction guides

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/wtfamru/healsync.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
npm run dev
```

## 📦 Environment Variables

Create a `.env.local` file with the following variables:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ThirdWeb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [ThirdWeb](https://thirdweb.com/)
- [Firebase](https://firebase.google.com/)
