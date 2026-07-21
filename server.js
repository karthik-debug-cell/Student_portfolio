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
 *  - EventEmitter-based portfolio analytics
 *  - JavaScript timer demonstrations
 *
 * Demonstrated Concepts:
 *  ✔ EventEmitter  (on, emit, once)
 *  ✔ setTimeout    (delayed analytics ready message)
 *  ✔ clearTimeout  (cancel timeout on early shutdown)
 *  ✔ setInterval   (periodic analytics dashboard)
 *  ✔ clearInterval (stop dashboard on shutdown)
 *
 * Run with: node server.js
 * Default port: 3000  (override with PORT env var)
 * ====================================================
 */

'use strict';

require('dotenv').config();

const http         = require('http');
const fs           = require('fs');
const path         = require('path');
const EventEmitter = require('events');
const { connectDB, getDB, closeDB } = require('./db');

/* =============================================
   CONFIGURATION
   ============================================= */

const PORT      = process.env.PORT || 3000;
const HOST      = process.env.HOST || 'localhost';
const ROOT_DIR  = __dirname;   // Portfolio root folder

/* =============================================
   SERVER LIFE CYCLE & START TIME
   ============================================= */

const serverStartTime = Date.now();

/* =============================================
   EVENTEMITTER – Single Instance
   ============================================= */

const emitter = new EventEmitter();

/* =============================================
   ANALYTICS – Counters
   ============================================= */

const analytics = {
  visitors        : 0,
  projectsViewed  : 0,
  projectOpens    : 0,
  resumeDownloads : 0,
  githubVisits    : 0,
  linkedinVisits  : 0,
  contactMessages : 0,
};

/* =============================================
   TIMER REFERENCES
   Stored so clearTimeout / clearInterval
   can cancel them during shutdown.
   ============================================= */

let analyticsReadyTimeout = null;   // setTimeout  → clearTimeout
let dashboardInterval     = null;   // setInterval → clearInterval

/* =============================================
   UTILITY FUNCTIONS
   ============================================= */

/**
 * Formats uptime milliseconds into a human-readable string.
 * @param {number} ms - Milliseconds of uptime
 * @returns {string} Formatted uptime (e.g. "12m 45s")
 */
function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Prints the professional real-time analytics dashboard.
 */
function printLiveDashboard() {
  console.log('======================================');
  console.log('📊 Portfolio Analytics');
  console.log(`👤 Visitors            : ${analytics.visitors}`);
  console.log(`📂 Projects Viewed     : ${analytics.projectsViewed}`);
  console.log(`🔍 Project Opens       : ${analytics.projectOpens}`);
  console.log(`📥 Resume Downloads    : ${analytics.resumeDownloads}`);
  console.log(`🐙 GitHub Visits       : ${analytics.githubVisits}`);
  console.log(`💼 LinkedIn Visits     : ${analytics.linkedinVisits}`);
  console.log(`📧 Contact Messages    : ${analytics.contactMessages}`);
  console.log('======================================');
}

/**
 * Prints the 20-second interval live analytics update.
 */
function printIntervalDashboard() {
  console.log('📊 Live Analytics Update');
  console.log(`Visitors : ${analytics.visitors}`);
  console.log(`Projects Viewed : ${analytics.projectsViewed}`);
  console.log(`Resume Downloads : ${analytics.resumeDownloads}`);
  console.log(`GitHub Visits : ${analytics.githubVisits}`);
  console.log(`LinkedIn Visits : ${analytics.linkedinVisits}`);
  console.log(`Contact Messages : ${analytics.contactMessages}`);
}

/**
 * Prints the detailed server session report.
 */
function printSessionSummary() {
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeStr = formatUptime(uptimeMs);

  console.log('============================================');
  console.log('🛑 Portfolio Server Stopped');
  console.log('========== Session Summary ==========');
  console.log(`🕒 Server Uptime       : ${uptimeStr}`);
  console.log(`👤 Visitors            : ${analytics.visitors}`);
  console.log(`📂 Projects Viewed     : ${analytics.projectsViewed}`);
  console.log(`🔍 Project Opens       : ${analytics.projectOpens}`);
  console.log(`📥 Resume Downloads    : ${analytics.resumeDownloads}`);
  console.log(`🐙 GitHub Visits       : ${analytics.githubVisits}`);
  console.log(`💼 LinkedIn Visits     : ${analytics.linkedinVisits}`);
  console.log(`📧 Contact Messages    : ${analytics.contactMessages}`);
  console.log('=====================================');
  console.log('Thank you for using Portfolio Analytics.');
  console.log('============================================');
}

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
   CUSTOM CALLBACK FUNCTIONS
   ============================================= */

/**
 * Custom callback-based function to track a visitor.
 * @param {function} callback - Function executed after processing
 */
function trackVisitor(callback) {
  analytics.visitors++;
  emitter.emit('portfolioVisited');
  if (typeof callback === 'function') {
    callback(analytics.visitors);
  }
}

/**
 * Custom callback-based function to track project views.
 * @param {function} callback - Function executed after processing
 */
function viewProjects(callback) {
  analytics.projectsViewed++;
  emitter.emit('projectsViewed');
  if (typeof callback === 'function') {
    callback(analytics.projectsViewed);
  }
}

/**
 * Custom callback-based function to track project opening.
 * @param {string} projectName - The name of the project opened
 * @param {function} callback - Function executed after processing
 */
function openProject(projectName, callback) {
  if (typeof projectName === 'function') {
    callback = projectName;
    projectName = 'Unnamed Project';
  }
  analytics.projectOpens++;
  emitter.emit('projectOpened', projectName);
  if (typeof callback === 'function') {
    callback(projectName, analytics.projectOpens);
  }
}

/**
 * Custom callback-based function to track resume downloads.
 * @param {function} callback - Function executed after processing
 */
function downloadResume(callback) {
  analytics.resumeDownloads++;
  emitter.emit('resumeDownloaded');
  if (typeof callback === 'function') {
    callback(analytics.resumeDownloads);
  }
}

/**
 * Custom callback-based function to track GitHub visits.
 * @param {function} callback - Function executed after processing
 */
function githubVisit(callback) {
  analytics.githubVisits++;
  emitter.emit('githubVisited');
  if (typeof callback === 'function') {
    callback(analytics.githubVisits);
  }
}

/**
 * Custom callback-based function to track LinkedIn visits.
 * @param {function} callback - Function executed after processing
 */
function linkedinVisit(callback) {
  analytics.linkedinVisits++;
  emitter.emit('linkedinVisited');
  if (typeof callback === 'function') {
    callback(analytics.linkedinVisits);
  }
}

/**
 * Custom callback-based function to track contact submissions.
 * @param {Object} data - Contact form data
 * @param {function} callback - Function executed after processing
 */
function contactSubmitted(data, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = { name: 'Anonymous Visitor' };
  }
  analytics.contactMessages++;
  emitter.emit('contactSubmitted', data);
  if (typeof callback === 'function') {
    callback(data, analytics.contactMessages);
  }
}

/* =============================================
   EVENT LISTENERS — emitter.once()
   Fires exactly ONE time when the server starts.
   ============================================= */

emitter.once('serverStarted', () => {
  console.log('🚀 Portfolio Server Started');
  console.log('Analytics Engine Initialized Successfully');
});

/* =============================================
   EVENT LISTENERS — emitter.on()
   These fire every time the event is emitted.
   Each one increments a counter, prints a
   formatted message, and updates the live dashboard.
   ============================================= */

emitter.on('portfolioVisited', () => {
  console.log('📌 portfolioVisited event occurred');
  printLiveDashboard();
});

emitter.on('projectsViewed', () => {
  console.log('📌 projectsViewed event occurred');
  printLiveDashboard();
});

emitter.on('projectOpened', (projectName) => {
  const details = projectName ? ` (${projectName})` : '';
  console.log(`📌 projectOpened event occurred${details}`);
  printLiveDashboard();
});

emitter.on('resumeDownloaded', () => {
  console.log('📌 resumeDownloaded event occurred');
  printLiveDashboard();
});

emitter.on('githubVisited', () => {
  console.log('📌 githubVisited event occurred');
  printLiveDashboard();
});

emitter.on('linkedinVisited', () => {
  console.log('📌 linkedinVisited event occurred');
  printLiveDashboard();
});

emitter.on('contactSubmitted', (data) => {
  console.log('📧 Contact Message Stored Successfully');
  console.log('📧 New Contact Message Received');
  console.log(`Current Messages : ${analytics.contactMessages}`);
  const from = data && data.name ? ` from ${data.name}` : '';
  console.log(`📌 contactSubmitted event occurred${from}`);
  printLiveDashboard();
});

/* =============================================
   EVENT LISTENER — serverStopped
   ============================================= */

emitter.on('serverStopped', () => {
  printSessionSummary();
});

/* =============================================
   EVENT ROUTE MAP
   Maps /event/<action> → event name for emit().
   ============================================= */

const EVENT_ROUTES = {
  '/event/visit'    : 'portfolioVisited',
  '/event/projects' : 'projectsViewed',
  '/event/project'  : 'projectOpened',
  '/event/resume'   : 'resumeDownloaded',
  '/event/github'   : 'githubVisited',
  '/event/linkedin' : 'linkedinVisited',
  '/event/contact'  : 'contactSubmitted',
};

/* =============================================
   PAGE → EVENT MAP
   Automatically emit events when real pages
   or files are served during normal browsing.
   ============================================= */

const PAGE_EVENTS = {
  '/index.html'      : 'portfolioVisited',
  '/'                : 'portfolioVisited',
  '/projects.html'   : 'projectsViewed',
  '/assets/resume.pdf': 'resumeDownloaded',
};

/**
 * Emit the analytics event that matches a served page.
 * Called after a file is successfully served.
 * @param {string} urlPath - The URL path that was served
 */
function emitPageEvent(urlPath) {
  const eventName = PAGE_EVENTS[urlPath];
  if (eventName) {
    if (eventName === 'portfolioVisited') {
      trackVisitor((count) => {
        console.log(`[Auto-track Page Callback] trackVisitor completed. Total: ${count}`);
      });
    } else if (eventName === 'projectsViewed') {
      viewProjects((count) => {
        console.log(`[Auto-track Page Callback] viewProjects completed. Total: ${count}`);
      });
    } else if (eventName === 'resumeDownloaded') {
      downloadResume((count) => {
        console.log(`[Auto-track Page Callback] downloadResume completed. Total: ${count}`);
      });
    }
  }
}

/* =============================================
   HELPER – Send JSON Response
   ============================================= */

/**
 * Sends a JSON response.
 * @param {http.ServerResponse} res
 * @param {number}              statusCode
 * @param {Object}              data
 */
function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type'              : 'application/json; charset=utf-8',
    'Content-Length'            : Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
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

  // Parse the URL using WHATWG URL API (no deprecation warning)
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const urlPath   = decodeURIComponent(parsedUrl.pathname || '/');

  /* ---- Analytics Event Endpoints ---- */
  // When an event endpoint is hit, invoke the matching custom callback function
  if (EVENT_ROUTES[urlPath]) {
    const eventName = EVENT_ROUTES[urlPath];

    if (eventName === 'portfolioVisited') {
      trackVisitor((count) => {
        console.log(`[HTTP Callback] trackVisitor completed. Total: ${count}`);
      });
    } else if (eventName === 'projectsViewed') {
      viewProjects((count) => {
        console.log(`[HTTP Callback] viewProjects completed. Total: ${count}`);
      });
    } else if (eventName === 'projectOpened') {
      const name = parsedUrl.searchParams.get('name') || 'Unnamed Project';
      openProject(name, (projectName, count) => {
        console.log(`[HTTP Callback] openProject completed for "${projectName}". Total: ${count}`);
      });
    } else if (eventName === 'resumeDownloaded') {
      downloadResume((count) => {
        console.log(`[HTTP Callback] downloadResume completed. Total: ${count}`);
      });
    } else if (eventName === 'githubVisited') {
      githubVisit((count) => {
        console.log(`[HTTP Callback] githubVisit completed. Total: ${count}`);
      });
    } else if (eventName === 'linkedinVisited') {
      linkedinVisit((count) => {
        console.log(`[HTTP Callback] linkedinVisit completed. Total: ${count}`);
      });
    } else if (eventName === 'contactSubmitted') {
      const data = Object.fromEntries(parsedUrl.searchParams);
      contactSubmitted(data, (submittedData, count) => {
        console.log(`[HTTP Callback] contactSubmitted completed for "${submittedData.name || 'Anonymous'}". Total: ${count}`);
      });
    }

    sendJSON(res, 200, { success: true, event: eventName, analytics });
    log(req.method, urlPath, 200, Date.now() - startTime);
    return;
  }

  /* ---- Analytics Dashboard Endpoint ---- */
  if (urlPath === '/analytics') {
    sendJSON(res, 200, { analytics });
    log(req.method, urlPath, 200, Date.now() - startTime);
    return;
  }

  /* ---- Contact Form POST Endpoint ---- */
  if (urlPath === '/contact' && req.method === 'POST') {
    let bodyChunks = [];
    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(bodyChunks).toString('utf8');
        let data = {};
        try {
          data = JSON.parse(bodyStr);
        } catch (jsonErr) {
          sendJSON(res, 400, { success: false, message: 'Failed to send message.' });
          log(req.method, urlPath, 400, Date.now() - startTime);
          return;
        }

        const { name, email, subject, message } = data;

        // Validation: Reject empty submissions, return proper failure responses
        if (
          !name || typeof name !== 'string' || !name.trim() ||
          !email || typeof email !== 'string' || !email.trim() ||
          !subject || typeof subject !== 'string' || !subject.trim() ||
          !message || typeof message !== 'string' || !message.trim()
        ) {
          sendJSON(res, 400, { success: false, message: 'Failed to send message.' });
          log(req.method, urlPath, 400, Date.now() - startTime);
          return;
        }

        // Email format validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          sendJSON(res, 400, { success: false, message: 'Failed to send message.' });
          log(req.method, urlPath, 400, Date.now() - startTime);
          return;
        }

        // IP Address
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

        // Formatted Date and Time
        const currentDate = new Date();
        const submittedDate = currentDate.toISOString().split('T')[0];
        const submittedTime = currentDate.toTimeString().split(' ')[0];

        const contactDocument = {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          submittedDate,
          submittedTime,
          ipAddress,
          createdAt: currentDate
        };

        // Insert into MongoDB
        const database = getDB();
        const collection = database.collection('contacts');
        await collection.insertOne(contactDocument);

        // Update Analytics & Emit Event using the custom callback function
        contactSubmitted(contactDocument, (submittedData, count) => {
          // Print DATABASE LOG exactly as formatted in requirements
          console.log('==================================');
          console.log('MongoDB Connected');
          console.log('New Contact Saved');
          console.log(`Name : ${submittedData.name}`);
          console.log(`Email : ${submittedData.email}`);
          console.log(`Date : ${submittedData.submittedDate}`);
          console.log(`Time : ${submittedData.submittedTime}`);
          console.log(`Total Messages : ${count}`);
          console.log('==================================');
        });

        sendJSON(res, 200, { success: true, message: 'Message sent successfully.' });
        log(req.method, urlPath, 200, Date.now() - startTime);

      } catch (dbErr) {
        console.error('❌ Error saving contact to database:', dbErr.message);
        sendJSON(res, 500, { success: false, message: 'Failed to send message.' });
        log(req.method, urlPath, 500, Date.now() - startTime);
      }
    });
    return;
  }

  /* ---- Static File Serving ---- */

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

    let responseData = data;
    if (ext === '.html') {
      let htmlContent = data.toString('utf8');
      const trackingScript = `
<script>
  // Injected analytics tracking script
  document.addEventListener('DOMContentLoaded', () => {
    // Track GitHub link clicks
    document.querySelectorAll('a[href*="github.com"]').forEach(link => {
      link.addEventListener('click', () => {
        fetch('/event/github');
      });
    });

    // Track LinkedIn link clicks
    document.querySelectorAll('a[href*="linkedin.com"]').forEach(link => {
      link.addEventListener('click', () => {
        fetch('/event/linkedin');
      });
    });

    // Track Project Opens (GitHub link clicks on project cards)
    document.querySelectorAll('a[id^="proj"]').forEach(link => {
      link.addEventListener('click', () => {
        const card = link.closest('.project-card') || link.closest('.featured-project-card');
        const titleEl = card ? card.querySelector('.project-title, .featured-project-title') : null;
        const title = titleEl ? titleEl.textContent.trim() : 'Project';
        fetch('/event/project?name=' + encodeURIComponent(title));
      });
    });

    // Track Contact Message submissions (clicking on any contact actions)
    document.querySelectorAll('a[id*="contact-"]').forEach(link => {
      link.addEventListener('click', () => {
        fetch('/event/contact?name=' + encodeURIComponent(link.id));
      });
    });

    // Track Resume Downloads
    document.querySelectorAll('a[href*="resume.pdf"]').forEach(link => {
      link.addEventListener('click', () => {
        fetch('/event/resume');
      });
    });
  });
</script>
`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${trackingScript}</body>`);
        responseData = Buffer.from(htmlContent, 'utf8');
      }
    }

    // Build response headers
    const headers = {
      'Content-Type'  : mimeType,
      'Content-Length': Buffer.byteLength(responseData),
      ...getSecurityHeaders(),
    };

    // Send the file
    res.writeHead(200, headers);

    // Don't send body for HEAD requests
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(responseData);
    }

    // Auto-emit analytics event for this page
    emitPageEvent(urlPath);

    log(req.method, urlPath, 200, Date.now() - startTime);
  });
});

/* =============================================
   START SERVER
   ============================================= */

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    server.listen(PORT, HOST, () => {
      console.log('\n\x1b[1m\x1b[35m  ╔══════════════════════════════════════╗');
      console.log('  ║   Karthik M – Portfolio Server      ║');
      console.log('  ╚══════════════════════════════════════╝\x1b[0m');
      console.log(`\n  \x1b[36m🌐  Server running at:\x1b[0m  \x1b[1mhttp://${HOST}:${PORT}\x1b[0m`);
      console.log(`  \x1b[36m📁  Serving from:\x1b[0m       ${ROOT_DIR}`);
      console.log('\n  \x1b[90mPress Ctrl+C to stop the server.\x1b[0m');

      // ── emitter.emit() ── triggers the .once() listener above
      emitter.emit('serverStarted');

      /* ================================================
         JAVASCRIPT TIMERS DEMONSTRATION
         ================================================ */

      // 1. setTimeout()
      //    Three seconds after the server starts,
      //    display "Analytics Engine Ready".
      analyticsReadyTimeout = setTimeout(() => {
        console.log('✅ Analytics Engine Ready\n');
        analyticsReadyTimeout = null; // Already fired
      }, 3000);

      // 3. setInterval()
      //    Every 20 seconds, automatically display
      //    the current analytics dashboard.
      dashboardInterval = setInterval(() => {
        printIntervalDashboard();
      }, 20000);
    });
  } catch (error) {
    console.error('❌ Failed to start the server due to database connection error:', error.message);
    process.exit(1);
  }
}

startServer();

/* =============================================
   GRACEFUL SHUTDOWN
   ============================================= */

/**
 * Handles graceful shutdown on SIGINT / SIGTERM.
 * Demonstrates clearTimeout() and clearInterval().
 */
function gracefulShutdown() {
  console.log('\nShutting down server...');

  // 2. clearTimeout()
  //    If the "Analytics Engine Ready" timeout hasn't
  //    fired yet, cancel it before shutting down.
  if (analyticsReadyTimeout) {
    clearTimeout(analyticsReadyTimeout);
    analyticsReadyTimeout = null;
  }

  // 4. clearInterval()
  //    Stop the 20-second periodic dashboard.
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
    dashboardInterval = null;
  }

  // Emit serverStopped event (which prints the Session Summary report)
  emitter.emit('serverStopped');

  // Close HTTP server and exit
  server.close(async () => {
    try {
      await closeDB();
    } catch (dbErr) {
      console.error('Error closing DB on shutdown:', dbErr.message);
    }
    process.exit(0);
  });
}

process.on('SIGINT',  gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

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
