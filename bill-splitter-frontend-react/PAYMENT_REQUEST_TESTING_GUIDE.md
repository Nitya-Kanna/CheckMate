# 🧪 Payment Request Flow - Testing Guide

## 📋 Overview
This guide will help you test the complete payment request recipient flow, from receiving a notification to completing payment.

---

## 🎯 What Was Built

### **New Components:**
1. ✅ **PaymentRequestScreen** - View payment request details
2. ✅ **PaymentConfirmScreen** - Confirm payment with PIN
3. ✅ **PaymentSuccessScreen** - Payment success confirmation
4. ✅ **NotificationScreen** - Mock notification center

### **Features:**
- 🔔 Push notification simulation
- 💳 Payment method selection (eWallet/Bank)
- 🔐 PIN entry with validation
- ✅ Success animation with confetti
- 📱 Complete TNG eWallet styling
- 🔄 Full navigation flow

---

## 🚀 How to Test

### **Step 1: Start the Dev Server**
```bash
cd bill-splitter-react
npm run dev
```

The app should be running at: `http://localhost:5173`

---

### **Step 2: Access Notification Center**

1. **Look for the Bell Icon** 🔔
   - Located in the top-right corner of the screen
   - Has a red badge showing "1" notification

2. **Click the Bell Icon**
   - Opens the Notification Screen
   - Shows mock payment request from "Zin"
   - Amount: RM 28.00 for Sushi House

---

### **Step 3: View Payment Request**

1. **Click on the Notification**
   - Opens PaymentRequestScreen
   - Shows sender info (Zin with avatar)
   - Displays amount in blue card: RM 28.00
   - Lists restaurant: Sushi House
   - Shows date: 23 Apr 2026
   - Lists your items: Salmon Sashimi

2. **Review Details**
   - Check all information is displayed correctly
   - Note the expiry date at bottom

---

### **Step 4: Initiate Payment**

1. **Click "Pay Now" Button**
   - Blue button with credit card icon
   - Navigates to PaymentConfirmScreen

2. **Alternative: Click "Decline"**
   - Returns to home screen
   - Request is declined

---

### **Step 5: Confirm Payment**

1. **Review Payment Summary**
   - Pay to: Zin
   - Amount: RM 28.00

2. **Select Payment Method**
   - Default: TNG eWallet (Balance: RM 1,234.56)
   - Alternative: Maybank ****1234
   - Selected method has blue border and checkmark

3. **Enter PIN**
   - Click in PIN input field
   - Type any 6-digit number (e.g., 123456)
   - PIN displays as dots: ••••••
   - Error shown if less than 6 digits

4. **Click "Confirm Payment"**
   - Button shows loading spinner
   - Simulates 1.5 second processing
   - Automatically proceeds to success screen

---

### **Step 6: View Success Screen**

1. **Success Animation**
   - Green checkmark icon with scale animation
   - Confetti effect (fades after 3 seconds)
   - "Payment Successful!" message

2. **Receipt Details**
   - Transaction ID: TXN[timestamp]
   - Date and time
   - From: Lisa (You)
   - To: Zin
   - Amount: RM 28.00
   - Payment Method: TNG eWallet
   - Status: Completed ✓

3. **Action Buttons**
   - **Share Receipt**: Opens share dialog (if supported)
   - **View Receipt**: Navigates to history
   - **Done**: Returns to home screen

---

## 🎨 Visual Testing Checklist

### **Notification Screen**
- [ ] Bell icon visible in top-right
- [ ] Red badge shows notification count
- [ ] Notification list displays correctly
- [ ] Unread notifications have blue background
- [ ] Time ago displays (e.g., "Just now", "1h ago")
- [ ] Click notification navigates correctly

### **Payment Request Screen**
- [ ] Sender avatar displays (👤)
- [ ] Sender name shows: "Zin"
- [ ] Amount card has blue gradient background
- [ ] Amount displays: RM 28.00
- [ ] Restaurant icon and name visible
- [ ] Date icon and date visible
- [ ] Items list shows correctly
- [ ] "Pay Now" button is blue with icon
- [ ] "Decline" button is gray with border
- [ ] Expiry notice at bottom

### **Payment Confirm Screen**
- [ ] Payment summary shows correctly
- [ ] Payment methods display as cards
- [ ] Selected method has blue border
- [ ] PIN input accepts 6 digits only
- [ ] PIN displays as dots
- [ ] Error message shows for invalid PIN
- [ ] Confirm button disabled until PIN complete
- [ ] Loading spinner shows during processing
- [ ] Security notice at bottom

### **Payment Success Screen**
- [ ] Confetti animation plays
- [ ] Green checkmark icon animates
- [ ] Success message displays
- [ ] Receipt card shows all details
- [ ] Transaction ID generated
- [ ] Date and time correct
- [ ] Amount highlighted in blue
- [ ] Status shows "Completed" with checkmark
- [ ] All three action buttons visible
- [ ] Footer message displays

---

## 🔄 Complete Flow Test

### **Full User Journey:**
```
1. Home Screen
   ↓ (Click Bell Icon)
2. Notification Screen
   ↓ (Click Notification)
3. Payment Request Screen
   ↓ (Click Pay Now)
4. Payment Confirm Screen
   ↓ (Enter PIN + Confirm)
5. Payment Success Screen
   ↓ (Click Done)
6. Home Screen
```

### **Time to Complete:** ~30 seconds

---

## 🐛 Common Issues & Solutions

### **Issue 1: Notification Bell Not Visible**
**Solution:** Check that App.jsx has the notification bell icon code and it's positioned correctly.

### **Issue 2: PIN Input Not Working**
**Solution:** 
- Click directly in the input field
- Only numbers 0-9 are accepted
- Maximum 6 digits

### **Issue 3: Styles Not Applied**
**Solution:** 
- Ensure App.css has all the new styles
- Check browser console for CSS errors
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### **Issue 4: Navigation Not Working**
**Solution:**
- Check that all screen states are defined in App.jsx
- Verify all handler functions are connected
- Check browser console for errors

### **Issue 5: Components Not Found**
**Solution:**
- Ensure all 4 new components are created:
  - PaymentRequestScreen.jsx
  - PaymentConfirmScreen.jsx
  - PaymentSuccessScreen.jsx
  - NotificationScreen.jsx
- Check import statements in App.jsx

---

## 📱 Mobile Testing

### **Responsive Design:**
- App is designed for mobile viewport (375px width)
- Test in browser's device mode (F12 → Toggle Device Toolbar)
- Recommended devices:
  - iPhone 12 Pro (390x844)
  - iPhone SE (375x667)
  - Samsung Galaxy S20 (360x800)

### **Touch Interactions:**
- All buttons should be easily tappable
- Minimum touch target: 44x44px
- Hover states work on desktop
- Active states show on tap

---

## 🎯 Success Criteria

### **Functionality:**
- ✅ Notification bell shows badge
- ✅ Clicking notification opens request
- ✅ Payment request displays all details
- ✅ Payment method selection works
- ✅ PIN validation works correctly
- ✅ Payment processing simulates delay
- ✅ Success screen shows receipt
- ✅ Navigation flow is smooth

### **UI/UX:**
- ✅ TNG blue color scheme (#0066CC)
- ✅ Smooth animations and transitions
- ✅ Clear visual hierarchy
- ✅ Intuitive button placement
- ✅ Proper error handling
- ✅ Loading states visible

### **Performance:**
- ✅ Screens load instantly
- ✅ Animations are smooth (60fps)
- ✅ No console errors
- ✅ No memory leaks

---

## 📸 Screenshots to Capture

1. **Notification Bell with Badge**
2. **Notification Screen with List**
3. **Payment Request Details**
4. **Payment Confirm with PIN**
5. **Payment Success with Confetti**
6. **Receipt Card Details**

---

## 🚀 Next Steps

After testing is complete:

1. **Build Production Version:**
   ```bash
   npm run build
   ```

2. **Create Deployment Package:**
   ```bash
   cd dist
   zip -r ../bill-splitter-app-v3.zip .
   ```

3. **Deploy to AWS Amplify:**
   - Follow AMPLIFY_DEPLOYMENT.md
   - Upload bill-splitter-app-v3.zip

4. **Test on Production:**
   - Verify all features work
   - Test on real mobile devices
   - Check performance metrics

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify all files are created correctly
3. Ensure dev server is running
4. Try clearing browser cache
5. Restart dev server

---

## ✅ Testing Checklist

- [ ] Dev server running successfully
- [ ] Notification bell visible and clickable
- [ ] Notification screen opens correctly
- [ ] Payment request displays all details
- [ ] Payment method selection works
- [ ] PIN entry validates correctly
- [ ] Payment processing shows loading
- [ ] Success screen displays with animation
- [ ] Receipt shows all transaction details
- [ ] Navigation flow works end-to-end
- [ ] All buttons are functional
- [ ] Styles match TNG design
- [ ] No console errors
- [ ] Mobile responsive design works

---

**Happy Testing! 🎉**

Made with ❤️ by Bob