/* global process */

const TELEGRAM_MAX_TEXT_LENGTH = 3800
const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 800
const MAX_TOTAL_LENGTH = 7000

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

  return messages
}

function formatConversation(messages) {
  const timestamp = new Date().toISOString()
  const lines = [
    'Dino Chat - percakapan yang dibagikan dengan persetujuan Mira',
    'Penerima: Fahmi (pemilik Dino)',
    `Waktu: ${timestamp}`,
    '',
  ]

  for (const message of messages) {
    const speaker = message.role === 'user' ? 'Mira' : 'Dino'
    lines.push(`${speaker}:`)
    lines.push(message.content)
    lines.push('')
  }

  return lines.join('\n').trim()
}

function splitForTelegram(text) {
  const chunks = []
  let remaining = text

  while (remaining.length > TELEGRAM_MAX_TEXT_LENGTH) {
    let splitAt = remaining.lastIndexOf('\n', TELEGRAM_MAX_TEXT_LENGTH)
    if (splitAt < 1) {
      splitAt = TELEGRAM_MAX_TEXT_LENGTH
    }

    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).replace(/^\n+/, '')
  }

  if (remaining) {
    chunks.push(remaining)
  }

  return chunks
}

async function sendTelegramMessage(token, chatId, text) {
  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  return telegramResponse.ok
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  const body = parseBody(request.body)
  if (body?.consent !== true) {
    return sendJson(response, 400, { error: 'Persetujuan diperlukan sebelum berbagi chat.' })
  }

  const messages = validateMessages(body.messages)
  if (!messages) {
    return sendJson(response, 400, { error: 'Percakapan tidak valid.' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return sendJson(response, 503, { error: 'Fitur berbagi belum tersedia.' })
  }

  try {
    const chunks = splitForTelegram(formatConversation(messages))
    for (const chunk of chunks) {
      if (!await sendTelegramMessage(token, chatId, chunk)) {
        return sendJson(response, 502, { error: 'Percakapan belum berhasil dibagikan.' })
      }
    }

    return sendJson(response, 200, { sent: true })
  } catch {
    return sendJson(response, 502, { error: 'Percakapan belum berhasil dibagikan.' })
  }
}
