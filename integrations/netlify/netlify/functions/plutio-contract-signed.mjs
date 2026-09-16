/**
 * Plutio "contract signed" -> HireHospo Google Sheet.
 *
 * Appends one row to the Customers tab and one row per equipment line item to
 * the Machines tab. Zero npm dependencies: the service-account JWT is signed
 * with node:crypto and the Sheets REST API is called with fetch.
 *
 * Required environment variables (Netlify > Site configuration > Environment):
 *   PLUTIO_WEBHOOK_SECRET        shared secret, sent by Plutio as ?token= or x-webhook-secret
 *   SHEET_ID                     the spreadsheet id from its URL
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  ...@....iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY           the service account private key (\n escapes are fine)
 * Optional:
 *   PLUTIO_DEBUG_LOG=1           log the raw webhook payload, then return without writing
 *   CUSTOMERS_TAB                defaults to "Customers"
 *   MACHINES_TAB                 defaults to "Machines"
 */

const CUSTOMERS_TAB = process.env.CUSTOMERS_TAB || 'Customers';
const MACHINES_TAB = process.env.MACHINES_TAB || 'Machines';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

/* ------------------------------------------------------------------ *
 * PAYLOAD MAPPING — adjust once you have captured a real Plutio body.
 * Run the function with PLUTIO_DEBUG_LOG=1, sign a test contract, then
 * read the logged JSON in Netlify > Logs > Functions and fix the paths.
 * ------------------------------------------------------------------ */

// Plutio fires contract.create / contract.update / contract.remove. There is no
// separate "signed" event, so we accept an update and gate on signature state.
function isSigned(body) {
  const c = body?.data || body?.contract || body;
  const status = String(c?.status || c?.state || '').toLowerCase();
  if (['signed', 'completed', 'accepted', 'approved'].includes(status)) return true;
  if (c?.signedAt || c?.signed_at || c?.dateSigned) return true;
  const sigs = c?.signatures || c?.signers || [];
  return Array.isArray(sigs) && sigs.length > 0 && sigs.every((s) => s?.signedAt || s?.signed);
}

function mapContract(body) {
  const c = body?.data || body?.contract || body;
  const client = c?.client || c?.contact || c?.customer || {};
  const items = c?.items || c?.lineItems || c?.products || [];

  return {
    contractId: String(c?._id || c?.id || ''),
    businessName: client?.businessName || client?.companyName || client?.company || client?.fullName || '',
    contactName: client?.fullName || [client?.firstName, client?.lastName].filter(Boolean).join(' '),
    phone: normalisePhone(client?.phone || client?.phoneNumber || ''),
    email: client?.email || '',
    address: formatAddress(client?.address || client?.billingAddress),
    signedAt: c?.signedAt || c?.signed_at || c?.dateSigned || new Date().toISOString(),
    contractUrl: c?.url || c?.publicUrl || c?.pdfUrl || '',
    deposit: num(c?.deposit ?? c?.depositAmount),
    items: items.map((i) => ({
      description: i?.name || i?.title || i?.description || 'Equipment (unspecified)',
      weekly: num(i?.price ?? i?.amount ?? i?.rate),
      quantity: Math.max(1, parseInt(i?.quantity ?? 1, 10) || 1),
      aps: i?.sku || i?.code || i?.reference || '',
    })),
    // Term/type are usually in the contract template rather than a field.
    // Default to the most common HireHospo product and correct by hand if needed.
    term: num(c?.term) || 36,
    type: c?.contractType || 'Lease-to-Own (36m)',
  };
}

/* ------------------------------------------------------------------ *
 * Handler
 * ------------------------------------------------------------------ */

export default async function handler(request) {
  if (request.method !== 'POST') return text(405, 'Method not allowed');

  const secret = process.env.PLUTIO_WEBHOOK_SECRET;
  const provided =
    new URL(request.url).searchParams.get('token') || request.headers.get('x-webhook-secret');
  if (!secret || provided !== secret) return text(401, 'Unauthorised');

  let body;
  try {
    body = await request.json();
  } catch {
    return text(400, 'Body is not JSON');
  }

  if (process.env.PLUTIO_DEBUG_LOG === '1') {
    console.log('PLUTIO PAYLOAD >>>', JSON.stringify(body, null, 2));
    return json(200, { ok: true, mode: 'debug', wrote: false });
  }

  if (!isSigned(body)) return json(200, { ok: true, skipped: 'not signed' });

  const contract = mapContract(body);
  if (!contract.contractId) return json(200, { ok: true, skipped: 'no contract id' });

  const token = await getAccessToken();

  // Idempotency: webhooks retry, and Plutio fires contract.update on every edit.
  // The contract id is stamped into Notes, so a redelivery is a no-op.
  const customers = await readRange(token, `${CUSTOMERS_TAB}!A2:H`);
  if (customers.some((r) => (r[7] || '').includes(contract.contractId))) {
    return json(200, { ok: true, skipped: 'already recorded', contractId: contract.contractId });
  }

  const custId = nextId(customers.map((r) => r[0]), 'HH', 3);
  const signedDate = contract.signedAt.slice(0, 10);

  await appendRows(token, `${CUSTOMERS_TAB}!A:H`, [[
    custId,
    contract.businessName,
    contract.contactName,
    contract.phone,
    contract.email,
    contract.address,
    'active',
    [
      `Signed ${contract.type} proposal ${signedDate}.`,
      `Plutio contract: ${contract.contractId}`,
      contract.contractUrl && `PDF: ${contract.contractUrl}`,
      'Auto-added by plutio-contract-signed. Verify before invoicing.',
    ].filter(Boolean).join(' '),
  ]]);

  // Expand quantity into one row per unit so machine counts stay accurate.
  const units = contract.items.flatMap((i) => Array(i.quantity).fill(i));
  let machineRows = [];
  if (units.length) {
    const machines = await readRange(token, `${MACHINES_TAB}!A2:K`);
    const existing = machines.map((r) => r[0]);
    machineRows = units.map((item, idx) => [
      nextId(existing, 'M', 3, idx),
      item.description,
      custId,
      contract.type,
      contract.term,
      item.weekly,
      signedDate,
      contract.deposit, // customer-level total, repeated per row per sheet convention
      item.aps,
      '',
      `Auto-added from Plutio ${contract.contractId}`,
    ]);
    await appendRows(token, `${MACHINES_TAB}!A:K`, machineRows);
  }

  console.log(`Added ${custId} (${contract.businessName}) with ${machineRows.length} machine row(s)`);
  return json(200, { ok: true, custId, machines: machineRows.length });
}

/* ------------------------------------------------------------------ *
 * Google auth + Sheets REST
 * ------------------------------------------------------------------ */

async function getAccessToken() {
  const { createSign } = await import('node:crypto');
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY');

  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned =
    `${b64({ alg: 'RS256', typ: 'JWT' })}.` +
    b64({
      iss: email,
      scope: SHEETS_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    });
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

const sheetsUrl = (range, qs = '') =>
  `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}` +
  `/values/${encodeURIComponent(range)}${qs}`;

async function readRange(token, range) {
  const res = await fetch(sheetsUrl(range), { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets read ${range} failed: ${await res.text()}`);
  return (await res.json()).values || [];
}

async function appendRows(token, range, rows) {
  // RAW, not USER_ENTERED: the sheet already carries #ERROR! artifacts from
  // values that got interpreted as formulas. Never let that happen again.
  const res = await fetch(
    sheetsUrl(range, ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS'),
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ values: rows }),
    },
  );
  if (!res.ok) throw new Error(`Sheets append ${range} failed: ${await res.text()}`);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

// IDs are non-contiguous (HH001-HH044 with gaps), so take max+1, never a row count.
function nextId(existing, prefix, width, offset = 0) {
  const max = existing.reduce((acc, id) => {
    const m = String(id || '').match(new RegExp(`^${prefix}(\\d+)$`));
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `${prefix}${String(max + 1 + offset).padStart(width, '0')}`;
}

function normalisePhone(raw) {
  const d = String(raw || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+64')) return d.slice(1);
  if (d.startsWith('0')) return `64${d.slice(1)}`;
  return d;
}

function formatAddress(a) {
  if (!a) return '';
  if (typeof a === 'string') return a;
  return [a.street || a.line1, a.line2, a.city, a.state || a.region, a.postalCode || a.zip]
    .filter(Boolean)
    .join(', ');
}

const num = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : '');
const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
const text = (status, msg) => new Response(msg, { status });

export const config = { path: '/api/plutio-contract-signed' };
