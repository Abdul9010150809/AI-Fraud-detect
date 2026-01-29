const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

async function postJson(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function ingestText(body: any) {
  return postJson('/api/v1/ingest/text', body)
}

export async function ingestUrl(body: any) {
  return postJson('/api/v1/ingest/url', body)
}

export async function ingestTransaction(body: any) {
  return postJson('/api/v1/ingest/transaction', body)
}

export async function ingestFile(path: string, file: File) {
  const form = new FormData()
  form.append('file', file, file.name)
  const res = await fetch(`${BASE}${path}`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function ingestImage(file: File) {
  return ingestFile('/api/v1/ingest/image', file)
}

export async function ingestAudio(file: File) {
  return ingestFile('/api/v1/ingest/audio', file)
}
