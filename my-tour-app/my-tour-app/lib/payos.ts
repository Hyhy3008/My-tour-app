import CryptoJS from 'crypto-js';

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID!;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY!;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY!;

interface PayOSOrder {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createPayOSOrder(order: PayOSOrder) {
  const data: Record<string, any> = {
    orderCode: order.orderCode,
    amount: order.amount,
    description: order.description,
    returnUrl: order.returnUrl,
    cancelUrl: order.cancelUrl,
  };

  const sortedData = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');
  const signature = CryptoJS.HmacSHA256(sortedData, PAYOS_CHECKSUM_KEY).toString();

  const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': PAYOS_CLIENT_ID,
      'x-api-key': PAYOS_API_KEY,
    },
    body: JSON.stringify({ ...data, signature }),
  });

  const result = await response.json();
  if (result.code !== '00') throw new Error(result.desc || 'PayOS Error');

  return { checkoutUrl: result.data.checkoutUrl, qrCode: result.data.qrCode };
}

export function verifyPayOSWebhook(body: any): boolean {
  try {
    const { signature, data } = body;
    const sortedData = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');
    const expectedSignature = CryptoJS.HmacSHA256(sortedData, PAYOS_CHECKSUM_KEY).toString();
    return signature === expectedSignature;
  } catch {
    return false;
  }
}
