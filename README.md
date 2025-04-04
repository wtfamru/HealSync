# HealSync - Organ Donation Platform

HealSync is a decentralized platform connecting organ donors with recipients, built with Next.js and Web3 technologies.

## 🚀 Features Implemented

### Frontend
- Modern, responsive UI with Tailwind CSS
- User authentication system
- Donor registration form with validation
- Hospital dashboard
- Landing page with key information
- Form validation using Zod
- Toast notifications for user feedback
- Consistent branding and styling

### Components
- Reusable UI components using shadcn/ui
- Custom form components
- Responsive layouts
- Interactive buttons and form elements
- Date picker for DOB selection
- Radio groups for gender selection
- Select dropdowns for blood group and ID type

### Styling
- Brand colors implemented (#5AA7A7, #6C8CBF)
- Consistent hover effects
- Responsive design for all screen sizes
- Modern gradient backgrounds
- Interactive elements with proper cursor states

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Firebase Auth
- **State Management**: React Context
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📝 Next Steps

### Smart Contract Development
1. Deploy smart contract to Sepolia Mumbai testnet using ThirdWeb
   - Set up ThirdWeb SDK
   - Create and test smart contract
   - Deploy to testnet
   - Verify contract on Etherscan

### Web3 Integration
1. Connect frontend with smart contract
   - Implement Web3 provider
   - Add wallet connection
   - Create contract interaction functions
   - Handle transaction states

2. Add blockchain features
   - Donor registration on-chain
   - Organ donation preferences storage
   - Transaction history
   - Event listeners for updates

### Testing
1. Unit tests for smart contract
2. Integration tests for Web3 features
3. End-to-end testing of the complete flow
4. Security audits

### Documentation
1. API documentation
2. Smart contract documentation
3. Deployment guide
4. User guide

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
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT7_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```7

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [ThirdWeb](https://thirdweb.com/)
- [Firebase](https://firebase.google.com/)
