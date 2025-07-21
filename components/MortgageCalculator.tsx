'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatNumber } from "@/lib/utils"
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
          '#2563eb', // primary
          '#f97316', // accent
          '#93c5fd', // primaryLight
        ],
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#4b5563', // textLight from design system
        }
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-3xl">Mortgage Affordability</CardTitle>
        <CardDescription>See what you can afford by entering your financial details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
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
                      placeholder="e.g., 100,000"
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
                      placeholder="e.g., 50,000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyDebts">Monthly Debts ($)</Label>
                    <Input
                      id="monthlyDebts"
                      type="text"
                      value={monthlyDebts}
                      onChange={(e) => setMonthlyDebts(formatNumber(e.target.value))}
                      placeholder="e.g., 1,500"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Advanced Settings Tab */}
              {activeTab === 'advanced' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input id="interestRate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLTV">Max LTV (%)</Label>
                    <Input id="maxLTV" value={maxLTV} onChange={(e) => setMaxLTV(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyTaxRate">Property Tax (%)</Label>
                    <Input id="propertyTaxRate" value={propertyTaxRate} onChange={(e) => setPropertyTaxRate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
                    <Input id="insuranceRate" value={insuranceRate} onChange={(e) => setInsuranceRate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDTI">Max DTI (%)</Label>
                    <Input id="maxDTI" value={maxDTI} onChange={(e) => setMaxDTI(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredReserves">Reserves (Months)</Label>
                    <Input id="requiredReserves" value={requiredReserves} onChange={(e) => setRequiredReserves(e.target.value)} />
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Calculating...' : 'Calculate Affordability'}
              </Button>
            </form>
          </div>

          <Separator orientation="vertical" className="hidden lg:block mx-auto" />

          {/* Right Column: Results */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
            {isLoading && <p>Calculating your results...</p>}
            {error && <p className="text-danger">{error}</p>}
            
            {result && !isLoading && !error && (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left side of results: The Numbers */}
                    <div className="space-y-6 text-left">
                      <div>
                        <Label className="text-sm text-textLight">Affordable Purchase Price</Label>
                        <p className="text-4xl font-bold text-primary">${result.purchasePrice.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <Label>Down Payment</Label>
                          <p className="font-medium">${result.downPayment.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                        </div>
                        <div>
                          <Label>Loan Amount</Label>
                          <p className="font-medium">${result.loanAmount.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                        </div>
                        <div>
                          <Label>Monthly Payment</Label>
                          <p className="font-medium">${result.monthlyPayment.toLocaleString('en-US', {maximumFractionDigits:0})}</p>
                        </div>
                        <div>
                          <Label>LTV Ratio</Label>
                          <p className="font-medium">{(result.ltvRatio * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side of results: The Chart */}
                    <div className="relative h-64 md:h-80">
                      <Doughnut data={chartData} options={chartOptions} />
                    </div>
                </div>
                
                <Separator className="my-8" />

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Monthly Payment Details</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between"><span>Principal & Interest:</span> <span className="font-medium">${result.principalAndInterest.toLocaleString('en-US', {maximumFractionDigits:2})}</span></p>
                      <p className="flex justify-between"><span>Property Tax:</span> <span className="font-medium">${result.propertyTax.toLocaleString('en-US', {maximumFractionDigits:2})}</span></p>
                      <p className="flex justify-between"><span>Homeowners Insurance:</span> <span className="font-medium">${result.homeownersInsurance.toLocaleString('en-US', {maximumFractionDigits:2})}</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Financials</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between"><span>Interest Rate:</span> <span className="font-medium">{(result.interestRate * 100).toFixed(2)}%</span></p>
                      <p className="flex justify-between"><span>Debt-to-Income:</span> <span className="font-medium">{(result.debtToIncomeRatio * 100).toFixed(0)}%</span></p>
                      <p className="flex justify-between"><span>Reserved Assets:</span> <span className="font-medium">${result.reservedAssets.toLocaleString('en-US', {maximumFractionDigits:0})}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!result && !isLoading && !error && (
              <p className="text-textLight">Enter your financial information to see what you can afford.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 