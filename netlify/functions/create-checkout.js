const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { items } = JSON.parse(event.body);

    if (!items || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No items provided' }) };
    }

    const SITE_URL = process.env.SITE_URL || 'https://iamrahiz.com';

    // Build line items for Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Size: ${item.size}`,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.qty,
    }));

    // Add shipping (free over €80)
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    if (subtotal < 80) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Shipping' },
          unit_amount: 590, // €5.90
        },
        quantity: 1,
      });
    }

    // Add VAT (20%)
    // TODO: Replace with Stripe Tax when configured (automatic_tax: { enabled: true })
    const vatAmount = Math.round(subtotal * 0.20 * 100);
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'VAT (20%)' },
        unit_amount: vatAmount,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: {
        allowed_countries: [
          // EU
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
          // UK, US, Cabo Verde
          'GB', 'US', 'CV',
        ],
      },
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/#merch`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
