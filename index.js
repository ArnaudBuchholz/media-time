const { readdir } = require('node:fs/promises')
const { extname, join } = require('node:path')
const readline = require('node:readline/promises')
const { stdin: input, stdout: output } = require('node:process')
const { utimes } = require('utimes')
const { exiftool } = require('exiftool-vendored')

const rl = readline.createInterface({ input, output })

const EXIF_TAG_PER_EXTENSION = {
  '.jpg': 'DateTimeOriginal',
  '.heic': 'DateTimeOriginal',
  '.mov': 'MediaCreateDate',
  '.mp4': 'MediaCreateDate'
};

async function main (...argv) {
  let errors = 0
  const folders = argv.filter(arg => !arg.startsWith('--'))
  for (const folder of folders) {
    console.log('📂', folder)
    const files = await readdir(folder)
    for (const file of files) {
      const extension = extname(file).toLowerCase()
      const filePath = join(folder, file)
      const tagName = EXIF_TAG_PER_EXTENSION[extension];
      let tags
      if (tagName !== undefined) {
        try {
          tags = await exiftool.read(filePath)
          const exifDate = tags[tagName]
          if (tagName === 'MediaCreateDate') {
            exifDate.minute += exifDate.tzoffsetMinutes
          }
          const localDate = new Date(
            exifDate.year, exifDate.month - 1, exifDate.day,
            exifDate.hour, exifDate.minute, exifDate.second, 0
          )
          console.log(file, localDate.toLocaleString())
          const time = localDate.getTime()
          await utimes(filePath, {
            btime: time,
            mtime: time,
            atime: time
          })
        } catch (e) {
          ++errors
          console.log('💣', file, e)
          if (tags) {
            console.log(tags)
          }
        }
      } else {
        console.log('❓', file)
      }
    }
  }
  await exiftool.end()
  console.log('✔ done.')
  if (errors) {
    await rl.question('Please review the problems...')
  }
  rl.close()
}

main(...process.argv.slice(2))
