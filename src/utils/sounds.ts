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
