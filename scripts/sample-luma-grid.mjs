import sharp from 'sharp'

const file = process.argv[2]
const img = sharp(file)
const { width, height } = await img.metadata()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const ch = info.channels
const step = 32
const rows = []
for (let y = 0; y < height; y += step) {
  let line = String(y).padStart(4, ' ') + ' '
  for (let x = 0; x < width; x += step) {
    const i = (y * width + x) * ch
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const l = Math.round((r + g + b) / 3)
    line += l.toString().padStart(4, ' ')
  }
  rows.push(line)
}
console.log(file, width, height)
console.log('    ' + [...Array(Math.ceil(width / step)).keys()].map((i) => String(i * step).padStart(4, ' ')).join(''))
console.log(rows.join('\n'))
