# TNG Bill Splitter - React + Vite

AI-powered bill splitting app with Touch 'n Go eWallet design.

## Features

- 📱 **TNG eWallet UI** - Authentic mobile app design
- 🤖 **AI Natural Language** - Parse "Zin ate nasi lemak" format
- 👥 **Contact Matching** - Fuzzy search with disambiguation
- 💰 **Smart Bill Split** - Proportional tax/service charges
- 📸 **Receipt Upload** - OCR processing simulation
- 💳 **Payment QR Codes** - Individual payment links

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── HomeScreen.jsx          # TNG eWallet home screen
│   ├── BillSplitter.jsx        # Main bill splitter component
│   ├── steps/
│   │   ├── ReceiptStep.jsx     # Step 1: View receipt
│   │   ├── AIParseStep.jsx     # Step 2: AI parsing
│   │   ├── ConfirmStep.jsx     # Step 3: Confirm contacts
│   │   ├── SplitStep.jsx       # Step 4: Split calculation
│   │   └── PaymentStep.jsx     # Step 5: QR codes
│   └── modals/
│       ├── UploadModal.jsx     # Receipt upload modal
│       └── ContactModal.jsx    # Contact selection modal
├── App.jsx                      # Main app component
├── App.css                      # All styles
└── main.jsx                     # Entry point
```

## Usage Flow

1. **Home Screen** → Click "Bill Split" feature (NEW badge)
2. **Receipt** → View POS receipt, optionally upload more
3. **AI Parse** → Type "Zin ate nasi lemak, Lisa ate pizza"
4. **Confirm** → Link names to contacts
5. **Split** → See itemized breakdown per person
6. **Pay** → Generate individual QR codes

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **CSS3** - Styling with animations
- **JavaScript ES6+** - Modern syntax

## Development

The app uses React hooks for state management:
- `useState` - Component state
- Component composition - Modular architecture
- Props drilling - Data flow between components

## Production Ready

- ✅ Component-based architecture
- ✅ Responsive mobile design
- ✅ Smooth animations
- ✅ Modal overlays
- ✅ File upload handling
- ✅ Contact matching logic
- ✅ Bill splitting algorithm

## Next Steps

- [ ] Connect to real OCR API (Tesseract.js)
- [ ] Integrate with payment gateway
- [ ] Add real contact access
- [ ] Implement backend API
- [ ] Add user authentication
- [ ] Store transaction history

## License

MIT
