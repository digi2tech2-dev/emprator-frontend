import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer as createHttpServer } from 'node:http';
import axios from 'axios';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { createServer } from 'vite';
import { normalizeSenderPhone, validateSenderPhone } from '../src/utils/senderPhone.js';

let server;
let api;
let captured;
const originalAdapter = axios.defaults.adapter;

before(async () => {
  // Intercept every HTTP request in memory: no backend or production connection.
  axios.defaults.adapter = async (config) => {
    captured = config;
    const form = config.data;
    return {
      status: 201, statusText: 'Created', headers: {}, config,
      data: { success: true, data: {
        _id: 'test-deposit', status: 'PENDING', requestedAmount: Number(form.get('requestedAmount')),
        currency: form.get('currency'), paymentMethodId: form.get('paymentMethodId'),
        transactionId: form.get('transactionId') || null,
        senderDetails: JSON.parse(form.get('senderDetails') || 'null'),
      } },
    };
  };
  server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: { server: createHttpServer() } },
    define: {
      'import.meta.env.VITE_DATA_PROVIDER': JSON.stringify('real'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://127.0.0.1:9/api'),
    },
  });
  api = (await server.ssrLoadModule('/src/services/realApi.js')).default;
});

after(async () => {
  axios.defaults.adapter = originalAdapter;
  await server?.close();
});

const validCases = [
  ['01012345678', '01012345678'],
  [' +20 (10) 1234-5678 ', '+201012345678'],
  ['٠١٠١٢٣٤٥٦٧٨', '01012345678'],
  ['+۹۷۱ ۵۰ ۱۲۳ ۴۵۶۷', '+971501234567'],
  ['+44 7700 900123', '+447700900123'],
  ['00123456789', '00123456789'],
  ['1234567', '1234567'],
  ['+123456789012345', '+123456789012345'],
];
for (const [index, [raw, normalized]] of validCases.entries()) {
  test(`phone normalization accepts supported format ${index + 1}`, () => {
    assert.equal(normalizeSenderPhone(raw), normalized);
    assert.equal(validateSenderPhone(raw), '');
  });
}

const invalidCases = ['', '   ', 'abc1234567', '123456', '1234567890123456',
  '01+01234567', '++201012345678', '(+20)1012345678', '010/12345678',
  '010\n12345678', '1'.repeat(65), null, undefined, 1012345678];
for (const [index, raw] of invalidCases.entries()) {
  test(`phone validation rejects invalid or empty input ${index + 1}`, () => {
    assert.equal(normalizeSenderPhone(raw), '');
    assert.ok(validateSenderPhone(raw));
  });
}

const receipt = new File(['synthetic-receipt'], 'receipt.png', { type: 'image/png' });
const basePayload = { requestedAmount: 125.5, currency: 'EGP', paymentMethodId: 'vodafone', receipt };

test('phone multipart preserves amount, currency, method and receipt without transaction aliases', async () => {
  const phone = normalizeSenderPhone(' +20 (10) 1234-5678 ');
  const result = await api.topups.create({
    ...basePayload, senderPhoneNumber: phone, notes: 'Test note',
    senderDetails: { field: 'senderPhoneNumber', label: 'رقم الهاتف المحوّل منه', value: phone, methodType: 'mobile_wallet' },
  });
  const form = captured.data;
  assert.equal(captured.url, '/me/deposits');
  assert.equal(captured.method, 'post');
  assert.ok(form instanceof FormData);
  assert.equal(form.get('senderPhoneNumber'), phone);
  assert.equal(JSON.parse(form.get('senderDetails')).field, 'senderPhoneNumber');
  for (const key of ['transactionId', 'transactionNumber', 'paymentReference', 'operationNumber', 'senderWalletNumber', 'senderWalletAddress', 'transferredFromNumber']) {
    assert.equal(form.has(key), false, `Unexpected field: ${key}`);
  }
  assert.equal(form.get('requestedAmount'), '125.5');
  assert.equal(form.get('currency'), 'EGP');
  assert.equal(form.get('paymentMethodId'), 'vodafone');
  assert.equal(form.get('notes'), 'Test note');
  assert.equal(form.get('receipt').name, receipt.name);
  assert.equal(await form.get('receipt').text(), await receipt.text());
  assert.equal(result.senderDetails.value, phone);
  assert.equal(result.senderDetails.field, 'senderPhoneNumber');
  assert.equal(result.transactionId, '');
  assert.equal(result.transactionNumber, '');
  assert.equal(result.requestedAmount, 125.5);
  assert.equal(result.status, 'pending');
});

test('top-level phone is supported without senderDetails and without adding notes', async () => {
  const result = await api.topups.create({ ...basePayload, senderPhoneNumber: '01012345678' });
  assert.equal(captured.data.get('senderPhoneNumber'), '01012345678');
  assert.equal(captured.data.has('notes'), false);
  assert.equal(result.senderDetails.field, 'senderPhoneNumber');
});

test('senderDetails phone discriminator is supported without a top-level input', async () => {
  await api.topups.create({ ...basePayload, senderDetails: { field: 'senderPhoneNumber', value: '+971501234567' } });
  assert.equal(captured.data.get('senderPhoneNumber'), '+971501234567');
  assert.equal(captured.data.has('senderWalletNumber'), false);
});

test('explicit blank phone remains explicit so backend cannot fall back to legacy submission', async () => {
  await api.topups.create({ ...basePayload, senderPhoneNumber: '' });
  assert.equal(captured.data.get('senderPhoneNumber'), '');
});

test('legacy real transaction references retain their meaning and serialization', async () => {
  const result = await api.topups.create({ ...basePayload, transactionId: 'txn-legacy-1' });
  assert.equal(captured.data.has('senderPhoneNumber'), false);
  assert.equal(captured.data.get('transactionId'), 'txn-legacy-1');
  assert.equal(captured.data.get('transactionNumber'), 'txn-legacy-1');
  assert.equal(captured.data.get('notes'), '[transactionNumber:txn-legacy-1]');
  assert.equal(result.transactionId, 'txn-legacy-1');
});

test('legacy cryptocurrency sender address keeps its existing multipart fields', async () => {
  await api.topups.create({ ...basePayload, senderDetails: { field: 'senderWalletAddress', value: 'synthetic-wallet-address', methodType: 'usdt' } });
  assert.equal(captured.data.get('senderWalletAddress'), 'synthetic-wallet-address');
  assert.equal(captured.data.get('transferredFromNumber'), 'synthetic-wallet-address');
  assert.equal(captured.data.has('senderPhoneNumber'), false);
});

test('topup store forwards phone and receipt through the real API adapter', async () => {
  const store = (await server.ssrLoadModule('/src/store/useTopupStore.js')).default;
  await store.getState().requestTopup({
    ...basePayload, currencyCode: 'EGP', senderPhoneNumber: '01012345678',
    senderDetails: { field: 'senderPhoneNumber', value: '01012345678' },
    userId: 'test-user', userName: 'Test user', type: 'regular',
  });
  assert.equal(captured.data.get('senderPhoneNumber'), '01012345678');
  assert.equal(captured.data.get('requestedAmount'), '125.5');
  assert.equal(await captured.data.get('receipt').text(), await receipt.text());
  const saved = store.getState().topups[0];
  assert.equal(saved.senderDetails.field, 'senderPhoneNumber');
  assert.equal(saved.senderDetails.value, '01012345678');
  assert.equal(saved.status, 'pending');
  assert.equal(saved.amount, 125.5);
  assert.equal(saved.transactionId, '');
});

test('deposit markup renders phone, LTR input, phone icon and receipt with the existing responsive grid', async () => {
  // Render with existing demo settings; effects do not run during server rendering.
  // This checks markup, not browser layout or interaction at device widths.
  const renderer = await createServer({
    configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
    ssr: { noExternal: ['react-router-dom', 'react-router'], resolve: { conditions: ['module', 'import', 'development'] } },
    server: { middlewareMode: true, hmr: { server: createHttpServer() } },
    define: { 'import.meta.env.VITE_DATA_PROVIDER': JSON.stringify('mock') },
  });
  try {
    const { MemoryRouter } = await renderer.ssrLoadModule('react-router-dom');
    const { default: PaymentDetails } = await renderer.ssrLoadModule('/src/pages/PaymentDetails.jsx');
    const { LanguageProvider } = await renderer.ssrLoadModule('/src/context/LanguageContext.jsx');
    const { ToastProvider } = await renderer.ssrLoadModule('/src/components/ui/Toast.jsx');
    const { default: system } = await renderer.ssrLoadModule('/src/store/useSystemStore.js');
    const methods = system.getState().paymentSettings.paymentGroups.flatMap((group) => group.methods);
    const mobile = methods.find((method) => method.id === 'vodafone') || methods.find((method) => method.type === 'mobile_wallet');
    assert.ok(mobile);
    const language = i18next.createInstance();
    await language.init({ lng: 'ar', resources: { ar: { translation: {} } }, initImmediate: false, showSupportNotice: false });
    const renderElement = (element) => renderToStaticMarkup(
      React.createElement(I18nextProvider, { i18n: language },
        React.createElement(MemoryRouter, null,
          React.createElement(LanguageProvider, null,
            React.createElement(ToastProvider, null,
              element)))));
    const renderMethod = (method) => renderElement(React.createElement(PaymentDetails, { embedded: true, methodId: method.id }));
    const html = renderMethod(mobile);
    assert.ok(html.includes('رقم الهاتف المحوّل منه'));
    assert.ok(html.includes('أدخل رقم الهاتف الذي حوّلت منه'));
    assert.match(html, /<input[^>]*type="tel"[^>]*inputMode="tel"[^>]*dir="ltr"[^>]*required=""/);
    assert.ok(html.includes('lucide-smartphone'));
    assert.ok(html.includes('type="file"'));
    assert.ok(html.includes('sm:grid-cols-2'));
    assert.ok(!html.includes('أدخل رقم العملية'));
    const crypto = methods.find((method) => method.type === 'usdt');
    if (crypto) {
      const cryptoHtml = renderMethod(crypto);
      assert.ok(cryptoHtml.includes('عنوان المحفظة المحول منها'));
      assert.ok(!cryptoHtml.includes('sender-phone-label'));
    }
    const { default: topups } = await renderer.ssrLoadModule('/src/store/useTopupStore.js');
    // In-memory fixtures only. Keep a numeric-looking historical reference to
    // prove the UI does not infer phone semantics from the digits themselves.
    const fixtureBase = { amount: 125.5, requestedAmount: 125.5, currencyCode: 'EGP', status: 'pending', createdAt: '2026-10-23T00:00:00Z' };
    topups.getState().topups.push(
      { ...fixtureBase, id: 'phone-review-test', senderDetails: { field: 'senderPhoneNumber', value: '+201012345678' } },
      { ...fixtureBase, id: 'legacy-review-test', transactionId: '01099999999' },
    );
    const { default: AdminPayments } = await renderer.ssrLoadModule('/src/pages/admin/AdminPayments.jsx');
    const adminHtml = renderElement(React.createElement(AdminPayments));
    assert.match(adminHtml, /رقم الهاتف المحوّل منه<\/p><p[^>]*>\+201012345678<\/p>/);
    assert.match(adminHtml, /رقم العملية<\/p><p[^>]*>01099999999<\/p>/);
    assert.ok(adminHtml.includes('هاتف المُحوِّل / رقم العملية'));
  } finally {
    await renderer.close();
  }
});
