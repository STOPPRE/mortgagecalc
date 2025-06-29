'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const formatNumber = (value: string) => {
  const number = value.replace(/[^\d.]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parseNumber = (value: string) => {
  return parseFloat(value.replace(/,/g, ''))
}

export default function MortgageCalculator() {
  const [annualIncome, setAnnualIncome] = useState('')
  const [assets, setAssets] = useState('')
  const [monthlyDebts, setMonthlyDebts] = useState('')
  const [maxLTV, setMaxLTV] = useState('95')
  const [propertyTaxRate, setPropertyTaxRate] = useState('1.8')
  const [insuranceRate, setInsuranceRate] = useState('0.5')
  const [maxDTI, setMaxDTI] = useState('36')
  const [interestRate, setInterestRate] = useState('4')
  const [requiredReserves, setRequiredReserves] = useState('6')
  const [result, setResult] = useState<{
    purchasePrice: number;
    downPayment: number;
    loanAmount: number;
    monthlyPayment: number;
    principalAndInterest: number;
    homeownersInsurance: number;
    propertyTax: number;
    debtToIncomeRatio: number;
    ltvRatio: number;
    reservedAssets: number;
    availableDownPayment: number;
    interestRate: number;
  } | null>(null)

  const calculateAffordability = (e: React.FormEvent) => {
    e.preventDefault()

    const income = parseNumber(annualIncome)
    const totalAssets = parseNumber(assets)
    const debts = parseNumber(monthlyDebts)
    const maxLTVRatio = parseNumber(maxLTV) / 100
    const propertyTaxRateDecimal = parseNumber(propertyTaxRate) / 100
    const insuranceRateDecimal = parseNumber(insuranceRate) / 100
    const maxDTIRatio = parseNumber(maxDTI) / 100
    const interestRateDecimal = parseNumber(interestRate) / 100
    const reserveMonths = parseNumber(requiredReserves)

    if (isNaN(income) || isNaN(totalAssets) || isNaN(debts)) {
      alert('Please enter valid numbers for all fields')
      return
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

    setResult({
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
  }

  const calculateMonthlyPayment = (loanAmount: number, interestRate: number) => {
    const loanTerm = 30 * 12 // 30-year mortgage in months
    const monthlyRate = interestRate / 12

    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mortgage Affordability Calculator</CardTitle>
        <CardDescription>Calculate your projected home purchase price based on your financial information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <form onSubmit={calculateAffordability} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income ($)</Label>
                <Input
                  id="annualIncome"
                  type="text"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(formatNumber(e.target.value))}
                  placeholder="Enter your annual income"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assets">Total Assets ($)</Label>
                <Input
                  id="assets"
                  type="text"
                  value={assets}
                  onChange={(e) => setAssets(formatNumber(e.target.value))}
                  placeholder="Enter your total assets"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyDebts">Current Monthly Debts ($)</Label>
                <Input
                  id="monthlyDebts"
                  type="text"
                  value={monthlyDebts}
                  onChange={(e) => setMonthlyDebts(formatNumber(e.target.value))}
                  placeholder="Enter your monthly debts"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Calculate Affordability</Button>
            </form>
          </TabsContent>
          <TabsContent value="advanced">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  min="0.1"
                  max="20"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLTV">Maximum Loan to Value Ratio (%)</Label>
                <Input
                  id="maxLTV"
                  type="number"
                  value={maxLTV}
                  onChange={(e) => setMaxLTV(e.target.value)}
                  min="1"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyTaxRate">Annual Property Tax Rate (%)</Label>
                <Input
                  id="propertyTaxRate"
                  type="number"
                  value={propertyTaxRate}
                  onChange={(e) => setPropertyTaxRate(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceRate">Annual Home Owners Insurance Rate (%)</Label>
                <Input
                  id="insuranceRate"
                  type="number"
                  value={insuranceRate}
                  onChange={(e) => setInsuranceRate(e.target.value)}
                  min="0"
                  max="10"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDTI">Maximum Debt to Income Ratio (%)</Label>
                <Input
                  id="maxDTI"
                  type="number"
                  value={maxDTI}
                  onChange={(e) => setMaxDTI(e.target.value)}
                  min="1"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredReserves">Required Reserve Assets (months)</Label>
                <Input
                  id="requiredReserves"
                  type="number"
                  value={requiredReserves}
                  onChange={(e) => setRequiredReserves(e.target.value)}
                  min="0"
                  max="24"
                  step="1"
                />
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Affordability Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Purchase Details</h4>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Purchase Price:</span>
                      <span className="font-medium">${result.purchasePrice.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Available Down Payment:</span>
                      <span className="font-medium">${result.availableDownPayment.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Loan Amount:</span>
                      <span className="font-medium">${result.loanAmount.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Monthly Payment</h4>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Total Monthly Payment:</span>
                      <span className="font-medium">${result.monthlyPayment.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Principal and Interest:</span>
                      <span className="font-medium">${result.principalAndInterest.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Property Tax:</span>
                      <span className="font-medium">${result.propertyTax.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Homeowners Insurance:</span>
                      <span className="font-medium">${result.homeownersInsurance.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Financial Ratios</h4>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Debt-to-Income Ratio:</span>
                      <span className="font-medium">{(result.debtToIncomeRatio * 100).toFixed(2)}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Loan-to-Value Ratio:</span>
                      <span className="font-medium">{(result.ltvRatio * 100).toFixed(2)}%</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Other Details</h4>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-medium">{(result.interestRate * 100).toFixed(2)}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Reserved Assets:</span>
                      <span className="font-medium">${result.reservedAssets.toLocaleString('en-US', {maximumFractionDigits:2})}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}