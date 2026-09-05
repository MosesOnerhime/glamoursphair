declare module '@paystack/inline-js' {
  interface PaystackResponse {
    reference: string
    message?: string
  }

  interface PaystackError {
    message?: string
  }

  interface PaystackOptions {
    key: string
    email: string
    amount: number
    currency?: string
    reference?: string
    firstName?: string
    phone?: string
    metadata?: Record<string, unknown>
    onSuccess?: (response: PaystackResponse) => void
    onCancel?: () => void
    onError?: (error: PaystackError) => void
  }

  export default class PaystackPop {
    newTransaction(options: PaystackOptions): unknown
  }
}
