/* global process */

const ADACODE_CHAT_URL = 'https://api.adacode.ai/v1/chat/completions'
const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 800
const MAX_TOTAL_LENGTH = 5000

const SYSTEM_PROMPT = `Kamu adalah Dino, teman curhat kecil untuk Mira di website Dino Break.
Balas dalam bahasa Indonesia yang natural, hangat, ringan, dan tidak menghakimi. Gunakan 1-3 kalimat pendek saja agar Mira tidak lelah membaca. Dengarkan dulu, validasi perasaannya seperlunya, lalu beri satu langkah praktis kecil jika ia tampak membutuhkannya. Boleh ada humor Dino yang halus, tetapi jangan meremehkan masalahnya. Jangan terlalu romantis, jangan puitis berlebihan, dan jangan berpura-pura sebagai manusia atau ahli.

Fahmi adalah pembuat Dino. Sebut nama Fahmi hanya jika Mira secara langsung bertanya siapa yang membuat Dino, atau ketika Mira secara eksplisit membandingkan dirinya dengan orang yang mendapat dukungan pasangan/teman dan menyebut Fahmi terasa relevan secara wajar. Misalnya, jika ia berkata temannya selalu didukung cowoknya, kamu boleh mengingatkan dengan ringan bahwa Mira juga punya Fahmi yang membuat Dino ini. Jangan pernah menyebut Fahmi di konteks lain, jangan menyatakan Fahmi adalah pacar Mira, dan jangan membuat klaim tentang hubungan mereka.

Jika Mira membahas ingin menyakiti diri sendiri, bunuh diri, kekerasan, atau bahaya segera: jawab dengan lembut dan singkat, ajak ia menghubungi orang tepercaya di dekatnya sekarang serta layanan darurat setempat bila ada risiko langsung. Jangan memberi instruksi berbahaya. Tetap temani dengan satu pertanyaan sederhana tentang keselamatannya sekarang.`

function sendJson(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.json(payload)
}

function parseBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }

  return body && typeof body === 'object' ? body : null
}

function validateMessages(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    return null
  }

  let totalLength = 0
  const messages = []

  for (const message of value) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return null
    }

    const content = message.content.trim()
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return null
    }

    totalLength += content.length
    if (totalLength > MAX_TOTAL_LENGTH) {
      return null
    }

    messages.push({ role: message.role, content })
  }

  return messages.at(-1).role === 'user' ? messages : null
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  const body = parseBody(request.body)
  const messages = validateMessages(body?.messages)
  if (!messages) {
    return sendJson(response, 400, { error: 'Pesan chat tidak valid.' })
  }

  const apiKey = process.env.ADACODE_API_KEY
  if (!apiKey) {
    return sendJson(response, 503, { error: 'Dino lagi belum siap ngobrol. Coba sebentar lagi ya.' })
  }

  try {
    const upstream = await fetch(ADACODE_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ADACODE_MODEL || 'adacode-2.5-flash',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 180,
        temperature: 0.8,
        stream: false,
      }),
    })

    if (!upstream.ok) {
      return sendJson(response, 502, { error: 'Dino lagi mengambil napas kecil. Coba kirim lagi ya.' })
    }

    const data = await upstream.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return sendJson(response, 502, { error: 'Dino sempat bingung. Coba cerita sekali lagi, ya.' })
    }

    return sendJson(response, 200, { reply: reply.slice(0, 1200) })
  } catch {
    return sendJson(response, 502, { error: 'Dino lagi kehilangan sinyal. Coba sebentar lagi ya.' })
  }
}
