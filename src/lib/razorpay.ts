import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function createOrder(planId: 'monthly' | 'lifetime') {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Please login to continue');
  }

  const response = await supabase.functions.invoke('create-razorpay-order', {
    body: { planId },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create order');
  }

  return response.data;
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  planId: 'monthly' | 'lifetime'
) {
  const response = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Payment verification failed');
  }

  return response.data;
}

export async function initiatePayment(
  planId: 'monthly' | 'lifetime',
  userEmail?: string,
  userName?: string,
  onSuccess?: (plan: string) => void,
  onError?: (error: string) => void
) {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load payment gateway');
    }

    // Create order
    const orderData = await createOrder(planId);

    // Open Razorpay checkout
    const options: RazorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Smart Exam Toolkit',
      description: `${planId === 'monthly' ? 'Monthly' : 'Lifetime'} Subscription`,
      order_id: orderData.orderId,
      handler: async (response) => {
        try {
          const result = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            planId
          );
          
          if (result.success) {
            onSuccess?.(result.plan);
          } else {
            onError?.('Payment verification failed');
          }
        } catch (error) {
          onError?.(error instanceof Error ? error.message : 'Payment verification failed');
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#f97316', // accent color (orange)
      },
      modal: {
        ondismiss: () => {
          onError?.('Payment cancelled');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onError?.(error instanceof Error ? error.message : 'Failed to initiate payment');
  }
}
