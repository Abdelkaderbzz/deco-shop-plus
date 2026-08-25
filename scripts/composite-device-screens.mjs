import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'portfolio-mockups')

async function pasteScreen({ scene, shot, left, top, width, height, radius = 6, out }) {
  const screen = await sharp(join(dir, shot))
    .resize(width, height, { fit: 'cover', position: 'top' })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <rect width="100%" height="18" fill="rgba(255,255,255,0.10)"/>
            <rect y="${height - 40}" width="100%" height="40" fill="rgba(0,0,0,0.06)"/>
          </svg>`,
        ),
        blend: 'over',
      },
    ])
    .png()
    .toBuffer()

  const rounded = radius
    ? await sharp(screen)
        .composite([
          {
            input: Buffer.from(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/>
              </svg>`,
            ),
            blend: 'dest-in',
          },
        ])
        .png()
        .toBuffer()
    : screen

  await sharp(join(dir, scene))
    .composite([{ input: rounded, left, top }])
    .png()
    .toFile(join(dir, out))

  console.log('composited', out)
}

await pasteScreen({
  scene: 'scene-cover-laptop.png',
  shot: '01-home-desktop.png',
  left: 358,
  top: 642,
  width: 478,
  height: 286,
  radius: 4,
  out: 'scene-cover-laptop-live.png',
})

await pasteScreen({
  scene: 'scene-laptop-fabric.png',
  shot: '01-home-desktop.png',
  left: 416,
  top: 670,
  width: 448,
  height: 258,
  radius: 4,
  out: 'scene-laptop-fabric-live.png',
})

console.log('done')
