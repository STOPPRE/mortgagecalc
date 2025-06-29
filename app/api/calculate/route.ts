import { NextResponse } from 'next/server'
import { calculateMonthlyPayment } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      annualIncome,
      assets,
      monthlyDebts,
      maxLTV,
      propertyTaxRate,
      insuranceRate,
      maxDTI,
      interestRate,
      requiredReserves
    } = data

    // Parse numeric inputs, handling both formatted strings and direct numeric inputs
    const income = typeof annualIncome === 'string' ? parseFloat(annualIncome.replace(/,/g, '')) : parseFloat(annualIncome)
    const totalAssets = typeof assets === 'string' ? parseFloat(assets.replace(/,/g, '')) : parseFloat(assets)
    const debts = typeof monthlyDebts === 'string' ? parseFloat(monthlyDebts.replace(/,/g, '')) : parseFloat(monthlyDebts)
    
    // Parse percentage inputs, ensuring decimal values are handled correctly
    const maxLTVRatio = parseFloat(maxLTV) / 100
    const propertyTaxRateDecimal = parseFloat(propertyTaxRate) / 100
    const insuranceRateDecimal = parseFloat(insuranceRate) / 100
    const maxDTIRatio = parseFloat(maxDTI) / 100
    
    // Ensure interest rate is properly parsed as a decimal value
    const interestRateDecimal = parseFloat(interestRate) / 100
    const reserveMonths = parseFloat(requiredReserves)

    // Validate inputs
    if (isNaN(income) || isNaN(totalAssets) || isNaN(debts) || isNaN(interestRateDecimal)) {
      return NextResponse.json(
        { error: 'Please enter valid numbers for all fields' },
        { status: 400 }
      )
    }

    // Additional validation for interest rate
    if (interestRateDecimal <= 0) {
      return NextResponse.json(
        { error: 'Interest rate must be greater than 0' },
        { status: 400 }
      )
    }

    const monthlyIncome = income / 12
    const maxMonthlyPaymentDTI = (maxDTIRatio * monthlyIncome) - debts

    const calculateMonthlyPaymentForPrice = (price: number) => {
      const loanAmount = price * maxLTVRatio
      const principalAndInterest = calculateMonthlyPayment(loanAmount, interestRateDecimal)
      const propertyTax = (price * propertyTaxRateDecimal) / 12
      const homeownersInsurance = (price * insuranceRateDecimal) / 12
      return principalAndInterest + propertyTax + homeownersInsurance
    }

    // Binary search to find the maximum purchase price that satisfies DTI and LTV constraints
    let low = 0
    let high = 10000000 // Arbitrary high value, adjust as needed
    let purchasePrice = 0
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2)
      const monthlyPayment = calculateMonthlyPaymentForPrice(mid)
      const reservedAssets = monthlyPayment * reserveMonths
      const availableDownPayment = Math.max(totalAssets - reservedAssets, 0)
      const requiredDownPayment = mid * (1 - maxLTVRatio)

      if (monthlyPayment <= maxMonthlyPaymentDTI && availableDownPayment >= requiredDownPayment) {
        purchasePrice = mid
        low = mid
      } else {
        high = mid
      }
    }

    const monthlyPayment = calculateMonthlyPaymentForPrice(purchasePrice)
    const reservedAssets = monthlyPayment * reserveMonths
    const availableDownPayment = Math.min(purchasePrice * (1 - maxLTVRatio), Math.max(totalAssets - reservedAssets, 0))
    const loanAmount = purchasePrice - availableDownPayment
    const principalAndInterest = calculateMonthlyPayment(loanAmount, interestRateDecimal)
    const propertyTax = (purchasePrice * propertyTaxRateDecimal) / 12
    const homeownersInsurance = (purchasePrice * insuranceRateDecimal) / 12
    const totalMonthlyPayment = principalAndInterest + propertyTax + homeownersInsurance

    const finalDebtToIncomeRatio = (debts + totalMonthlyPayment) / monthlyIncome
    const ltvRatio = loanAmount / purchasePrice

    return NextResponse.json({
      purchasePrice,
      downPayment: availableDownPayment,
      loanAmount,
      monthlyPayment: totalMonthlyPayment,
      principalAndInterest,
      homeownersInsurance,
      propertyTax,
      debtToIncomeRatio: finalDebtToIncomeRatio,
      ltvRatio,
      reservedAssets,
      availableDownPayment,
      interestRate: interestRateDecimal
    })
  } catch (error) {
    console.error('Error calculating affordability:', error)
    return NextResponse.json(
      { error: 'Failed to calculate affordability' },
      { status: 500 }
    )
  }
} 