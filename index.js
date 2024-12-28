const { readdir } = require('fs/promises')
const { extname, join } = require('path')
const { utimes } = require('utimes')
const { exiftool } = require("exiftool-vendored")

async function main (folder) {
  const files = await readdir(folder)
  for (file of files) {
    const extension = extname(file).toLowerCase()
    const filePath = join(folder, file)
    if (['.jpg', '.mov', '.heic'].includes(extension)) {
      try {
        const tags = await exiftool.read(filePath)
        let tagName = {
          '.jpg': 'DateTimeOriginal',
          '.heic': 'DateTimeOriginal',
          '.mov': 'MediaCreateDate'
        }[extension]
        const exifDate = tags[tagName]
        if (extension === '.mov') {
          exifDate.minute += exifDate.tzoffsetMinutes // Bug ?
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
        console.log(file, e)
      }
    }
  }
  await exiftool.end();
  console.log('done.')
}

main(...process.argv.slice(2))
