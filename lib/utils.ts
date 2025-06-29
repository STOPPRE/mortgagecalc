import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (value: string) => {
  const number = value.replace(/[^\d.]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const parseNumber = (value: string) => {
  return parseFloat(value.replace(/,/g, ''))
}

export const calculateMonthlyPayment = (loanAmount: number, interestRate: number) => {
  const loanTerm = 30 * 12 // 30-year mortgage in months
  const monthlyRate = interestRate / 12

  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
} 