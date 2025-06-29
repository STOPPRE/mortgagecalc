# Mortgage Affordability Calculator

A comprehensive mortgage affordability calculator built with Next.js, Node.js, and Tailwind CSS. This application helps users determine how much house they can afford based on their financial information.

## Features

- **Real-time Calculations**: Performs complex mortgage affordability calculations using a Node.js backend
- **Responsive Design**: Built with Tailwind CSS for a beautiful, mobile-friendly interface
- **Advanced Settings**: Customize parameters like interest rates, property tax rates, and more in an intuitive two-column layout
- **Detailed Results**: View comprehensive breakdown of purchase details, monthly payments, and financial ratios

## How It Works

The calculator uses several key financial metrics to determine affordability:

1. **Debt-to-Income (DTI) Ratio**: Calculates the maximum monthly payment based on your income and existing debts
2. **Loan-to-Value (LTV) Ratio**: Determines how much you can borrow based on the value of the property
3. **Reserve Requirements**: Accounts for required cash reserves after closing
4. **Property Taxes and Insurance**: Includes these costs in the monthly payment calculation

### Affordability Calculation Algorithm

The application uses a sophisticated binary search algorithm to find the maximum purchase price that satisfies all financial constraints. Here's how it works:

1. **Initialize Search Range**: Start with a lower bound of 0 and an upper bound of a high value (e.g., 10,000,000)
2. **Binary Search Process**:
   - Calculate the midpoint purchase price between the current bounds
   - For this purchase price, calculate:
     - Monthly mortgage payment (principal + interest)
     - Monthly property tax and insurance costs
     - Required reserve assets (typically several months of housing payments)
     - Available down payment after reserving cash for reserves
     - Required down payment based on LTV constraints
3. **Constraint Verification**:
   - Check if the total monthly payment is within DTI limits based on income and existing debts
   - Verify the user has sufficient assets for both the required down payment and reserves
4. **Adjustment**:
   - If all constraints are satisfied, this price becomes the new lower bound
   - If any constraint is violated, this price becomes the new upper bound
5. **Convergence**: Continue until the difference between upper and lower bounds is minimal

This approach efficiently finds the maximum affordable purchase price with logarithmic time complexity (O(log n)), making it suitable for real-time calculations.

## Financial Inputs

### Basic Information
- **Annual Income**: Your gross annual income before taxes
- **Total Assets**: All cash and liquid assets available for down payment and reserves
- **Monthly Debts**: Current monthly debt obligations (credit cards, car loans, student loans, etc.)

### Advanced Settings
The calculator provides a user-friendly two-column layout for advanced settings:

**Left Column:**
- **Interest Rate**: The annual interest rate for your mortgage
- **Property Tax Rate**: Annual property tax as a percentage of home value
- **Maximum DTI Ratio**: Maximum debt-to-income ratio allowed (typically 36-43%)

**Right Column:**
- **Maximum LTV Ratio**: The maximum loan-to-value ratio allowed (typically 80-95%)
- **Homeowners Insurance Rate**: Annual insurance cost as a percentage of home value
- **Required Reserves**: Number of months of housing payments required in reserves

## Technical Implementation

- **Frontend**: Next.js with React and Tailwind CSS
- **Backend**: Node.js API routes for calculations
- **State Management**: React hooks for local state management
- **Styling**: Tailwind CSS with custom components
- **API**: RESTful API endpoints for mortgage calculations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be easily deployed to platforms like Vercel or Netlify:

```
npm run build
```

## License

MIT 