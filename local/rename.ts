/**
 * 重命名目录下的文件
 */

let path = require("path")
let fs = require("fs")

const DST = "D:/Test"
const MOVIE = ".avi.mkv.mp4"

let files = fs.readdirSync(DST)

for (let f of files) {
  let p = path.join(DST, f)
  let stat = fs.lstatSync(p)

  if (stat.isDirectory() || MOVIE.indexOf(path.extname(f)) === -1) {
    continue
  }

  // let newName = f.replace(/\(.*?\)/g, "").replace(/[\-_\s]/g, "")
  let newName = f.replace("gg", "")
  console.log("🤨 重命名：", p)
  fs.renameSync(p, path.join(DST, newName))
}