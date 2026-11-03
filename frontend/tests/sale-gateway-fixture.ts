import type { GatewayCallbacks } from '../src/lib/salePayment'

// Explicitly opt-in local QA only. Vite removes this import from production builds.
export default class LocalGateway {
  resumeTransaction(accessCode: string, callbacks: GatewayCallbacks) {
    const layer = document.createElement('div')
    layer.style.cssText = 'position:fixed;inset:0;z-index:200;background:#000b;display:grid;place-items:center;padding:16px'
    const frame = document.createElement('iframe')
    frame.title = 'Local payment simulator'
    frame.style.cssText = 'width:100%;max-width:440px;height:430px;border:0;background:white'
    frame.src = `/api/sales-qa?gateway=${encodeURIComponent(accessCode)}`
    const remove = () => { layer.remove(); window.removeEventListener('message', receive) }
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.origin !== window.location.origin || event.data?.type !== 'sale-qa') return
      remove()
      if (event.data.action === 'success') callbacks.onSuccess({ reference: event.data.reference })
      else if (event.data.action === 'error') callbacks.onError({ message: 'Local simulated setup failure' })
      else callbacks.onCancel()
    }
    frame.onload = callbacks.onLoad
    window.addEventListener('message', receive)
    layer.appendChild(frame); document.body.appendChild(layer)
  }
}
