// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

if (process.env.IS_PACKAGE) {
    const Sentry = require('@sentry/electron');
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}