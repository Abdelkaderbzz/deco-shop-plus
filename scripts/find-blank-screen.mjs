import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const file = process.argv[2]
const img = sharp(file)
const { width, height } = await img.metadata()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const channels = info.channels

function isWhite(i) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  return r > 235 && g > 235 && b > 235 && Math.abs(r - g) < 12 && Math.abs(g - b) < 12
}

let minX = width
let minY = height
let maxX = 0
let maxY = 0
let count = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels
    if (isWhite(i)) {
      count++
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

console.log(JSON.stringify({ file, width, height, count, minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY }, null, 2))
