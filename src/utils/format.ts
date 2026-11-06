/**
 * Formatting utilities for NEXUS — Orbit Studio Intelligence
 * Standardized for Indian Rupee (INR - ₹) and clean, beginner-friendly UI
 */

export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatINRLakh(amount: number | undefined | null): string {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(amount);
}
