/**
 * ====================================================
 * KARTHIK M PORTFOLIO – server.js
 * Node.js Built-in HTTP Module Only (NO Express.js)
 * ====================================================
 *
 * Features:
 *  - Serves HTML, CSS, JS, Images, and PDF files
 *  - Custom 404 error page
 *  - MIME type detection
 *  - Security headers
 *  - Logging with timestamps
 *
 * Run with: node server.js
 * Default port: 3000  (override with PORT env var)
 * ====================================================
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

/* =============================================
   CONFIGURATION
   ============================================= */

const PORT      = process.env.PORT || 3000;
const HOST      = process.env.HOST || 'localhost';
const ROOT_DIR  = __dirname;   // Portfolio root folder

/* =============================================
   MIME TYPES MAP
   ============================================= */

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf' : 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf' : 'font/ttf',
  '.txt' : 'text/plain; charset=utf-8',
  '.md'  : 'text/markdown; charset=utf-8',
};

/* =============================================
   SECURITY HEADERS
   ============================================= */

/**
 * Returns a set of recommended security headers.
 * @returns {Object} HTTP security headers
 */
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options'   : 'nosniff',
    'X-Frame-Options'          : 'SAMEORIGIN',
    'X-XSS-Protection'         : '1; mode=block',
    'Referrer-Policy'          : 'strict-origin-when-cross-origin',
    'Cache-Control'            : 'public, max-age=3600',
  };
}

/* =============================================
   LOGGER
   ============================================= */

/**
 * Logs a formatted request entry to stdout.
 * @param {string} method   - HTTP method (GET, POST, etc.)
 * @param {string} urlPath  - Requested URL path
 * @param {number} statusCode - HTTP status code returned
 * @param {number} ms       - Response time in milliseconds
 */
function log(method, urlPath, statusCode, ms) {
  const timestamp = new Date().toISOString();
  const status    = statusCode >= 400 ? `\x1b[31m${statusCode}\x1b[0m` : `\x1b[32m${statusCode}\x1b[0m`;
  console.log(`[${timestamp}] ${method.padEnd(4)} ${status}  ${urlPath}  (${ms}ms)`);
}

/* =============================================
   404 PAGE
   ============================================= */

/**
 * Sends a custom-styled 404 HTML page.
 * @param {http.ServerResponse} res
 */
function send404(res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 – Page Not Found | Karthik M</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #07070f;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 480px; }
    .code {
      font-size: 7rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
    p  { color: #94a3b8; margin-bottom: 2rem; line-height: 1.7; }
    a {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      text-decoration: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    a:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.5); }
  </style>
</head>
<body>
  <div class="container">
    <div class="code">404</div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
    <a href="/">← Go Home</a>
  </div>
</body>
</html>`;

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

/* =============================================
   FILE SERVER
   ============================================= */

/**
 * Resolves a URL path to a physical file path.
 * Falls back to index.html for the root "/" route.
 * @param {string} urlPath
 * @returns {string} Absolute filesystem path
 */
function resolveFilePath(urlPath) {
  // Normalize: strip query strings and trailing slashes
  let filePath = urlPath.split('?')[0];

  // Map root to index.html
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  // Prevent directory traversal attacks
  const resolved = path.resolve(ROOT_DIR, '.' + filePath);
  if (!resolved.startsWith(ROOT_DIR)) {
    return null; // Attempted directory traversal
  }

  return resolved;
}

/* =============================================
   HTTP SERVER
   ============================================= */

const server = http.createServer((req, res) => {
  const startTime = Date.now();

  // Parse the URL
  const parsedUrl = url.parse(req.url);
  const urlPath   = decodeURIComponent(parsedUrl.pathname || '/');

  // Only handle GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    log(req.method, urlPath, 405, Date.now() - startTime);
    return;
  }

  // Resolve file path
  const filePath = resolveFilePath(urlPath);

  if (!filePath) {
    send404(res);
    log(req.method, urlPath, 404, Date.now() - startTime);
    return;
  }

  // Get file extension for MIME type
  const ext      = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found → 404
        send404(res);
        log(req.method, urlPath, 404, Date.now() - startTime);
      } else {
        // Server error → 500
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        log(req.method, urlPath, 500, Date.now() - startTime);
      }
      return;
    }

    // Build response headers
    const headers = {
      'Content-Type'  : mimeType,
      'Content-Length': Buffer.byteLength(data),
      ...getSecurityHeaders(),
    };

    // Send the file
    res.writeHead(200, headers);

    // Don't send body for HEAD requests
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }

    log(req.method, urlPath, 200, Date.now() - startTime);
  });
});

/* =============================================
   START SERVER
   ============================================= */

server.listen(PORT, HOST, () => {
  console.log('\n\x1b[1m\x1b[35m  ╔══════════════════════════════════════╗');
  console.log('  ║   Karthik M – Portfolio Server      ║');
  console.log('  ╚══════════════════════════════════════╝\x1b[0m');
  console.log(`\n  \x1b[36m🌐  Server running at:\x1b[0m  \x1b[1mhttp://${HOST}:${PORT}\x1b[0m`);
  console.log(`  \x1b[36m📁  Serving from:\x1b[0m       ${ROOT_DIR}`);
  console.log('\n  \x1b[90mPress Ctrl+C to stop the server.\x1b[0m\n');
});

/* =============================================
   GRACEFUL SHUTDOWN
   ============================================= */

process.on('SIGTERM', () => {
  console.log('\n\x1b[33m  Shutting down server...\x1b[0m');
  server.close(() => {
    console.log('  \x1b[32mServer closed. Goodbye! 👋\x1b[0m\n');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\x1b[33m  Shutting down server...\x1b[0m');
  server.close(() => {
    console.log('  \x1b[32mServer closed. Goodbye! 👋\x1b[0m\n');
    process.exit(0);
  });
});

/**
 * Handle uncaught errors gracefully
 */
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n\x1b[31m  ✗ Port ${PORT} is already in use.\x1b[0m`);
    console.error(`  Try: PORT=3001 node server.js\n`);
  } else {
    console.error('\n\x1b[31m  Server error:\x1b[0m', err.message);
  }
  process.exit(1);
});
