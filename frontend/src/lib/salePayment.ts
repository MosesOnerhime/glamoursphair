export type GatewayCallbacks = {
  onSuccess: (response: { reference: string }) => void
  onCancel: () => void
  onError: (error: { message?: string }) => void
  onLoad: () => void
}

type GatewayModule = { default: new () => { resumeTransaction: (accessCode: string, callbacks: GatewayCallbacks) => unknown } }
async function defaultSdk(): Promise<GatewayModule> {
  if (import.meta.env.DEV && import.meta.env.VITE_SALES_QA_GATEWAY === 'true') return import('../../tests/sale-gateway-fixture')
  return import('@paystack/inline-js')
}

export async function openSaleGateway(accessCode: string, callbacks: GatewayCallbacks, loadSdk: () => Promise<GatewayModule> = defaultSdk) {
  const { default: PaystackPop } = await loadSdk()
  return new PaystackPop().resumeTransaction(accessCode, callbacks)
}
