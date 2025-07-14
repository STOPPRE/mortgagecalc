import MortgageCalculator from '@/components/MortgageCalculator'
 
// Triggering deployment with a comment
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <MortgageCalculator />
      </div>
    </main>
  )
} 