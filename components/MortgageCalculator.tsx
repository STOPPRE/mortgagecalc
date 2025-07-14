'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatNumber, parseNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CalculationResult {
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
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')

  const calculateAffordability = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          annualIncome,
          assets,
          monthlyDebts,
          maxLTV,
          propertyTaxRate,
          insuranceRate,
          maxDTI,
          interestRate,
          requiredReserves
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate affordability')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      console.error('Error calculating affordability:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = {
    labels: ['Principal & Interest', 'Property Tax', 'Homeowners Insurance'],
    datasets: [
      {
        data: [
          result?.principalAndInterest ?? 0,
          result?.propertyTax ?? 0,
          result?.homeownersInsurance ?? 0,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Payment Breakdown',
      },
    },
  };

  return (
    <Card className="w-full max-w-4xl mx-auto md:p-6 p-4">
      <CardHeader>
        <CardTitle>Mortgage Affordability Calculator</CardTitle>
        <CardDescription>Calculate your projected home purchase price based on your financial information.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Custom Tab Navigation */}
        <div className="flex rounded-md bg-muted p-1 mb-6">
          <button
            type="button"
            className={cn(
              "flex-1 text-center py-2 px-3 rounded-sm text-sm font-medium transition-all",
              activeTab === 'basic' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 text-center py-2 px-3 rounded-sm text-sm font-medium transition-all",
              activeTab === 'advanced' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Settings
          </button>
        </div>
        
        <form onSubmit={calculateAffordability}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
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
            </div>
          )}
          
          {/* Advanced Settings Tab */}
          {activeTab === 'advanced' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="text"
                    inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => {
                      // Allow only numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setInterestRate(formattedValue);
                    }}
                    placeholder="4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyTaxRate">Annual Property Tax Rate (%)</Label>
                  <Input
                    id="propertyTaxRate"
                    type="text"
                    inputMode="decimal"
                    value={propertyTaxRate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setPropertyTaxRate(formattedValue);
                    }}
                    placeholder="1.8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDTI">Maximum Debt to Income Ratio (%)</Label>
                  <Input
                    id="maxDTI"
                    type="text"
                    inputMode="decimal"
                    value={maxDTI}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setMaxDTI(formattedValue);
                    }}
                    placeholder="36"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLTV">Maximum Loan to Value Ratio (%)</Label>
                  <Input
                    id="maxLTV"
                    type="text"
                    inputMode="decimal"
                    value={maxLTV}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setMaxLTV(formattedValue);
                    }}
                    placeholder="95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceRate">Annual Home Owners Insurance Rate (%)</Label>
                  <Input
                    id="insuranceRate"
                    type="text"
                    inputMode="decimal"
                    value={insuranceRate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setInsuranceRate(formattedValue);
                    }}
                    placeholder="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredReserves">Required Reserve Assets (months)</Label>
                  <Input
                    id="requiredReserves"
                    type="text"
                    inputMode="decimal"
                    value={requiredReserves}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      const formattedValue = parts.length > 2 
                        ? `${parts[0]}.${parts.slice(1).join('')}` 
                        : value;
                      setRequiredReserves(formattedValue);
                    }}
                    placeholder="6"
                  />
                </div>
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Calculating...' : 'Calculate Affordability'}
          </Button>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </form>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Affordability Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Original results */}
                <div>
                  <div className="space-y-4">
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
                </div>
                {/* Right side: Pie chart */}
                <div className="relative h-64 md:h-80 lg:h-auto">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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