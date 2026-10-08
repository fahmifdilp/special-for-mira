import fs from 'node:fs'
import path from 'node:path'

const sampleRate = 44100
const bpm = 96
const beat = 60 / bpm
const bars = 8
const duration = beat * 4 * bars
const totalSamples = Math.round(sampleRate * duration)
const samples = new Float32Array(totalSamples)

const note = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.00,
}

const addTone = (start, length, frequency, amplitude, shape = 'sine', style = 'pluck') => {
  const from = Math.max(0, Math.floor(start * sampleRate))
  const to = Math.min(totalSamples, Math.ceil((start + length) * sampleRate))
  const attack = style === 'pad' ? Math.min(.18, length * .25) : .008
  const release = style === 'pad' ? Math.min(.35, length * .3) : Math.min(.18, length * .35)

  for (let index = from; index < to; index += 1) {
    const elapsed = index / sampleRate - start
    const progress = elapsed / length
    const attackEnvelope = Math.min(1, elapsed / attack)
    const releaseEnvelope = Math.min(1, (length - elapsed) / release)
    const envelope = Math.max(0, attackEnvelope * releaseEnvelope)
    const phase = elapsed * frequency * Math.PI * 2
    const wave = shape === 'triangle'
      ? (2 / Math.PI) * Math.asin(Math.sin(phase))
      : Math.sin(phase)
    const shimmer = shape === 'triangle' ? Math.sin(phase * 2.01) * .12 : 0
    const volume = style === 'pad'
      ? amplitude * (.72 + Math.sin(progress * Math.PI) * .28)
      : amplitude * Math.exp(-elapsed * (style === 'bass' ? 2.4 : 5.5))
    samples[index] += (wave + shimmer) * envelope * volume
  }
}

const addKick = (start) => {
  const length = .24
  const from = Math.floor(start * sampleRate)
  const to = Math.min(totalSamples, Math.ceil((start + length) * sampleRate))
  let phase = 0

  for (let index = from; index < to; index += 1) {
    const elapsed = (index - from) / sampleRate
    const frequency = 145 - elapsed * 420
    phase += frequency * Math.PI * 2 / sampleRate
    samples[index] += Math.sin(phase) * Math.exp(-elapsed * 18) * .22
  }
}

let randomSeed = 17
const random = () => {
  randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0
  return randomSeed / 4294967296
}

const addNoise = (start, length, amplitude, decay) => {
  const from = Math.floor(start * sampleRate)
  const to = Math.min(totalSamples, Math.ceil((start + length) * sampleRate))
  for (let index = from; index < to; index += 1) {
    const elapsed = (index - from) / sampleRate
    samples[index] += (random() * 2 - 1) * amplitude * Math.exp(-elapsed * decay)
  }
}

const chords = [
  ['C3', 'E3', 'G3', 'A3'],
  ['A2', 'C3', 'E3', 'G3'],
  ['F2', 'A3', 'C4', 'E4'],
  ['G2', 'D3', 'G3', 'A3'],
]

for (let bar = 0; bar < bars; bar += 1) {
  const barStart = bar * beat * 4
  const chord = chords[bar % chords.length]

  chord.forEach((pitch, index) => {
    addTone(barStart, beat * 4.1, note[pitch], .018 + index * .002, index % 2 ? 'triangle' : 'sine', 'pad')
  })

  addTone(barStart, beat * 1.7, note[chord[0]], .09, 'triangle', 'bass')
  addTone(barStart + beat * 2, beat * 1.7, note[chord[0]], .075, 'triangle', 'bass')

  addKick(barStart)
  addKick(barStart + beat * 2)
  addNoise(barStart + beat, .16, .075, 20)
  addNoise(barStart + beat * 3, .16, .075, 20)

  for (let eighth = 0; eighth < 8; eighth += 1) {
    addNoise(barStart + eighth * beat / 2, .035, .018, 80)
  }
}

const melody = [
  'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5',
  'E5', 'G5', 'A5', 'C5', 'A5', 'G5', 'E5', 'D5',
  'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5',
  'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5',
  'C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5',
  'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5',
  'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5',
  'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'E5', 'C5',
]

melody.forEach((pitch, index) => {
  const start = index * beat / 2
  addTone(start, beat * .42, note[pitch], .075, index % 3 === 0 ? 'triangle' : 'sine', 'pluck')
})

// A tiny two-note chirp makes the loop feel like a dino game without vocals.
for (let bar = 1; bar < bars; bar += 2) {
  const start = bar * beat * 4 + beat * 3.5
  addTone(start, .16, note.G5, .055, 'triangle', 'pluck')
  addTone(start + .14, .2, note.C5, .045, 'triangle', 'pluck')
}

const crossfadeSamples = Math.floor(sampleRate * .08)
const head = samples.slice(0, crossfadeSamples)
const tail = samples.slice(totalSamples - crossfadeSamples)
for (let index = 0; index < crossfadeSamples; index += 1) {
  const blend = index / crossfadeSamples
  samples[index] = tail[index] * (1 - blend) + head[index] * blend
  samples[totalSamples - crossfadeSamples + index] = tail[index] * blend + head[index] * (1 - blend)
}

let peak = 0
samples.forEach((value) => { peak = Math.max(peak, Math.abs(value)) })
const normalizer = peak > .85 ? .85 / peak : 1
const pcm = Buffer.alloc(totalSamples * 2)
for (let index = 0; index < totalSamples; index += 1) {
  const shaped = Math.tanh(samples[index] * normalizer * 1.12)
  pcm.writeInt16LE(Math.round(shaped * 32767), index * 2)
}

const header = Buffer.alloc(44)
header.write('RIFF', 0)
header.writeUInt32LE(36 + pcm.length, 4)
header.write('WAVE', 8)
header.write('fmt ', 12)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(1, 22)
header.writeUInt32LE(sampleRate, 24)
header.writeUInt32LE(sampleRate * 2, 28)
header.writeUInt16LE(2, 32)
header.writeUInt16LE(16, 34)
header.write('data', 36)
header.writeUInt32LE(pcm.length, 40)

const output = path.resolve('public/audio/dino-daydream.wav')
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, Buffer.concat([header, pcm]))
console.log(`Generated ${output} (${(fs.statSync(output).size / 1024).toFixed(1)} KB, ${duration.toFixed(1)}s loop)`)
