let audioContext: AudioContext | null = null

const context = () => {
  audioContext ??= new AudioContext()
  return audioContext
}

const tone = (frequency: number, start: number, duration: number, volume = 0.12) => {
  const ctx = context()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, ctx.currentTime + start)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(ctx.currentTime + start)
  oscillator.stop(ctx.currentTime + start + duration)
}

const clap = (start: number) => {
  const ctx = context()
  const length = Math.floor(ctx.sampleRate * 0.09)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = .7
  gain.gain.value = .16
  source.buffer = buffer
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start(ctx.currentTime + start)
}

export const playCorrectChime = () => {
  tone(523.25, 0, .24)
  tone(659.25, .12, .26)
  tone(783.99, .24, .38, .15)
}

export const playQuizCelebration = () => {
  ;[0, .11, .23, .36, .48, .62, .75, .9, 1.05, 1.22].forEach(clap)
  tone(523.25, 0, .3, .1); tone(659.25, .18, .35, .1); tone(783.99, .38, .55, .13)
}

export const playWheelSpin = (duration = 1.7) => {
  const ctx = context()
  const ticks = 24
  for (let index = 0; index < ticks; index += 1) {
    const progress = index / ticks
    const start = duration * Math.pow(progress, 1.65)
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.value = 680 - progress * 260
    gain.gain.setValueAtTime(.055, ctx.currentTime + start)
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + start + .035)
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(ctx.currentTime + start)
    oscillator.stop(ctx.currentTime + start + .04)
  }
}

const speak = (message: string, kind: 'correct' | 'incorrect') => {
  if (!('speechSynthesis' in window)) return
  const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith('en'))
  const utterance = new SpeechSynthesisUtterance(message)
  utterance.lang = 'en-US'
  utterance.voice = kind === 'correct' ? (voices[0] ?? null) : (voices[1] ?? voices[0] ?? null)
  utterance.pitch = kind === 'correct' ? 1.35 : .88
  utterance.rate = kind === 'correct' ? 1.08 : .88
  utterance.volume = .9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export const playCorrectVoice = () => speak('Excellent! That is correct. Great job!', 'correct')

export const playIncorrectVoice = () => speak('Good try. That is not quite right. Keep learning, you have got this!', 'incorrect')
