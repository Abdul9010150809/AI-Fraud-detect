const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/v1/ingest/text') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}')
        const resp = { risk_score: 10, confidence: 0.8, processing_time: 0.01, details: { received: payload } }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(resp))
      } catch (e) {
        res.writeHead(400)
        res.end('bad json')
      }
    })
    return
  }

  if ((req.method === 'POST') && (req.url.startsWith('/api/v1/ingest/image') || req.url.startsWith('/api/v1/ingest/audio'))) {
    // accept multipart/form-data bodies but ignore contents for mock
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ risk_score: 5, confidence: 0.7 }))
    return
  }

  res.writeHead(404)
  res.end('not found')
})

const port = process.env.E2E_PORT || 8001
server.listen(port, '127.0.0.1', () => console.log(`mock server listening ${port}`))

process.on('SIGINT', () => server.close(() => process.exit(0)))