import { InvoicePrefix } from "./pos.type";

export function genInvoiceId() {
  return `${InvoicePrefix}-${Date.now()}`
}
