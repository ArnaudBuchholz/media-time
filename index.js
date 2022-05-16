const { readdir, open } = require('fs/promises')
const { extname, join } = require('path')
const { utimes } = require('utimes');

async function main (folder) {
  const files = await readdir(folder)
  for await (file of files) {
    const extension = extname(file).toLowerCase()
    const filePath = join(folder, file)
    if (extension === '.jpg') {
      let fh
      let time
      try {
        fh = await open(filePath)
        const buffer = Buffer.alloc(65535)
        await fh.readv([buffer])
        const parser = require('exif-parser').create(buffer)
        const { DateTimeOriginal } = parser.parse().tags
        const utcDate = new Date(DateTimeOriginal * 1000)
        const localDate = new Date(
          utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(),
          utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds(), 0
        )
        time = localDate.getTime()
        console.log(file, localDate)
      } catch (e) {
        console.log(file, e)
      } finally {
        fh.close()
        await utimes(filePath, {
          btime: time,
          mtime: time,
          atime: time
        })
      }
    }
  }
}

main(...process.argv.slice(2))