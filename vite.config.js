import { defineConfig } from 'vite';

import razorpayCreateOrder from './api/payment/razorpay-create-order.js';
import razorpayVerify from './api/payment/razorpay-verify.js';
import razorpayWebhook from './api/payment/razorpay-webhook.js';
import lemonsqueezyCheckout from './api/payment/lemonsqueezy-checkout.js';
import lemonsqueezyWebhook from './api/payment/lemonsqueezy-webhook.js';

function createResponseAdapter(res) {
  const adapter = {
    status(code) {
      res.statusCode = code;
      return adapter;
    },
    setHeader(name, value) {
      res.setHeader(name, value);
      return adapter;
    },
    json(payload) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
      }

      res.end(JSON.stringify(payload));
      return adapter;
    },
    end(payload) {
      if (typeof payload === 'undefined') {
        res.end();
      } else if (Buffer.isBuffer(payload) || typeof payload === 'string') {
        res.end(payload);
      } else {
        res.end(JSON.stringify(payload));
      }

      return adapter;
    },
  };

  return adapter;
}

async function readRequestBody(req) {
  const chunks = [];

  return await new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function paymentApiMiddleware() {
  const routeHandlers = new Map([
    ['/api/payment/razorpay-create-order', razorpayCreateOrder],
    ['/api/payment/razorpay-verify', razorpayVerify],
    ['/api/payment/razorpay-webhook', razorpayWebhook],
    ['/api/payment/lemonsqueezy-checkout', lemonsqueezyCheckout],
    ['/api/payment/lemonsqueezy-webhook', lemonsqueezyWebhook],
  ]);

  return {
    name: 'payment-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const method = req.method || 'GET';
        const url = new URL(req.url || '/', 'http://localhost');
        const handler = routeHandlers.get(url.pathname);

        if (!handler) {
          return next();
        }

        try {
          const response = createResponseAdapter(res);

          // Webhooks consume the raw stream, so pass the original request through.
          if (url.pathname.endsWith('-webhook')) {
            await handler(req, response);
            return;
          }

          if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            const rawBody = await readRequestBody(req);
            try {
              req.body = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              req.body = rawBody;
            }
          }

          await handler(req, response);
        } catch (error) {
          console.error('Local payment API middleware error:', error);

          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
          }

          res.end(JSON.stringify({
            error: 'Local payment API failed',
            details: process.env.NODE_ENV === 'development' ? String(error?.message || error) : undefined,
          }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [paymentApiMiddleware()],
});