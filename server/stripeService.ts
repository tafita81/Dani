/**
 * Serviço de Integração com Stripe
 * Gerencia pagamentos, inscrições e webhooks
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export interface PaymentSession {
  id: string;
  userId: string;
  sessionType: "one_time" | "subscription";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "week" | "month" | "year";
  intervalCount: number;
  trialDays?: number;
  stripePriceId: string;
}

// Planos de Inscrição Disponíveis
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Plano Básico",
    description: "Acesso a 1 sessão por semana",
    amount: 9900, // R$ 99.00
    currency: "brl",
    interval: "month",
    intervalCount: 1,
    trialDays: 7,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || "",
  },
  professional: {
    id: "professional",
    name: "Plano Profissional",
    description: "Acesso ilimitado a sessões + relatórios",
    amount: 19900, // R$ 199.00
    currency: "brl",
    interval: "month",
    intervalCount: 1,
    trialDays: 14,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "",
  },
  premium: {
    id: "premium",
    name: "Plano Premium",
    description: "Tudo incluído + suporte prioritário",
    amount: 39900, // R$ 399.00
    currency: "brl",
    interval: "month",
    intervalCount: 1,
    trialDays: 14,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
  },
};

// Pacotes de Sessões (One-Time)
export const SESSION_PACKAGES = {
  single: {
    id: "single",
    name: "1 Sessão",
    sessions: 1,
    amount: 15000, // R$ 150.00
    currency: "brl",
  },
  pack_5: {
    id: "pack_5",
    name: "Pacote 5 Sessões",
    sessions: 5,
    amount: 70000, // R$ 700.00 (R$ 140/sessão)
    currency: "brl",
  },
  pack_10: {
    id: "pack_10",
    name: "Pacote 10 Sessões",
    sessions: 10,
    amount: 130000, // R$ 1.300.00 (R$ 130/sessão)
    currency: "brl",
  },
};

/**
 * Cria sessão de checkout para pagamento único
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  userName: string,
  packageId: keyof typeof SESSION_PACKAGES,
  origin: string
) {
  const pkg = SESSION_PACKAGES[packageId];

  if (!pkg) {
    throw new Error(`Pacote inválido: ${packageId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price_data: {
          currency: pkg.currency,
          product_data: {
            name: pkg.name,
            description: `${pkg.sessions} sessão(ões) de terapia com Psi. Daniela Coelho`,
            images: [],
          },
          unit_amount: pkg.amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment/cancelled`,
    metadata: {
      user_id: userId,
      customer_email: userEmail,
      customer_name: userName,
      package_id: packageId,
      sessions_count: pkg.sessions.toString(),
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    amount: pkg.amount,
    sessions: pkg.sessions,
  };
}

/**
 * Cria sessão de checkout para inscrição
 */
export async function createSubscriptionSession(
  userId: string,
  userEmail: string,
  userName: string,
  planId: keyof typeof SUBSCRIPTION_PLANS,
  origin: string
) {
  const plan = SUBSCRIPTION_PLANS[planId];

  if (!plan || !plan.stripePriceId) {
    throw new Error(`Plano inválido: ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: plan.trialDays || 0,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    },
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription/cancelled`,
    metadata: {
      user_id: userId,
      customer_email: userEmail,
      customer_name: userName,
      plan_id: planId,
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    planName: plan.name,
    amount: plan.amount,
  };
}

/**
 * Recupera detalhes da sessão de checkout
 */
export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    id: session.id,
    status: session.payment_status,
    customerId: session.customer,
    clientReferenceId: session.client_reference_id,
    metadata: session.metadata,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentIntentId: session.payment_intent,
  };
}

/**
 * Cria cliente no Stripe
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  name: string
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId,
    },
  });

  return {
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
  };
}

/**
 * Recupera cliente do Stripe
 */
export async function getStripeCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    throw new Error("Cliente foi deletado");
  }

  return {
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    metadata: customer.metadata,
  };
}

/**
 * Lista pagamentos do cliente
 */
export async function listCustomerPayments(customerId: string) {
  const paymentIntents = await stripe.paymentIntents.list({
    customer: customerId,
    limit: 100,
  });

  return paymentIntents.data.map((intent) => ({
    id: intent.id,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    createdAt: new Date(intent.created * 1000),
    description: intent.description,
    metadata: intent.metadata,
  }));
}

/**
 * Lista inscrições do cliente
 */
export async function listCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 100,
  });

  return subscriptions.data.map((sub) => ({
    id: sub.id,
    status: sub.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    items: sub.items.data.map((item) => ({
      priceId: item.price.id,
      quantity: item.quantity,
    })),
    metadata: sub.metadata,
  }));
}

/**
 * Cancela inscrição
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);

  return {
    id: subscription.id,
    status: subscription.status,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
  };
}

/**
 * Processa webhook de pagamento bem-sucedido
 */
export async function handlePaymentIntentSucceeded(
  paymentIntentId: string
): Promise<PaymentSession> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: paymentIntentId,
    userId: paymentIntent.metadata?.user_id || "",
    sessionType: "one_time",
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: "completed",
    stripePaymentIntentId: paymentIntentId,
    createdAt: new Date(paymentIntent.created * 1000),
    completedAt: new Date(),
    metadata: paymentIntent.metadata,
  };
}

/**
 * Processa webhook de inscrição criada
 */
export async function handleCustomerSubscriptionCreated(
  subscriptionId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    id: subscriptionId,
    customerId: subscription.customer as string,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialStart: subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    metadata: subscription.metadata,
  };
}

/**
 * Processa webhook de inscrição cancelada
 */
export async function handleCustomerSubscriptionDeleted(
  subscriptionId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    id: subscriptionId,
    status: subscription.status,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
  };
}

/**
 * Cria cupom de desconto
 */
export async function createCoupon(
  percentOff: number,
  maxRedemptions?: number,
  durationMonths?: number
) {
  const coupon = await stripe.coupons.create({
    percent_off: percentOff,
    duration: durationMonths ? "repeating" : "forever",
    duration_in_months: durationMonths,
    max_redemptions: maxRedemptions,
  });

  return {
    id: coupon.id,
    percentOff: coupon.percent_off,
    maxRedemptions: coupon.max_redemptions,
    timesRedeemed: coupon.times_redeemed,
  };
}

/**
 * Valida cupom de desconto
 */
export async function validateCoupon(couponId: string) {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);

    return {
      valid: true,
      id: coupon.id,
      percentOff: coupon.percent_off,
      maxRedemptions: coupon.max_redemptions,
      timesRedeemed: coupon.times_redeemed,
      isExpired: coupon.max_redemptions
        ? coupon.times_redeemed >= coupon.max_redemptions
        : false,
    };
  } catch (error) {
    return {
      valid: false,
      error: "Cupom inválido ou expirado",
    };
  }
}

/**
 * Gera relatório de receita
 */
export async function generateRevenueReport(
  startDate: Date,
  endDate: Date
): Promise<{
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  currency: string;
}> {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  const paymentIntents = await stripe.paymentIntents.list({
    created: {
      gte: startTimestamp,
      lte: endTimestamp,
    },
    limit: 100,
  });

  const successful = paymentIntents.data.filter(
    (p: Stripe.PaymentIntent) => p.status === "succeeded"
  );
  const failed = paymentIntents.data.filter(
    (p: Stripe.PaymentIntent) => p.status === "requires_payment_method"
  );

  const totalRevenue = successful.reduce(
    (sum: number, p: Stripe.PaymentIntent) => sum + p.amount,
    0
  );

  return {
    totalRevenue,
    totalTransactions: paymentIntents.data.length,
    successfulPayments: successful.length,
    failedPayments: failed.length,
    currency: (paymentIntents.data[0]?.currency as string) || "brl",
  };
}
