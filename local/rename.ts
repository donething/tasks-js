/**
 * 重命名目录下的文件
 */

let path = require("path")
let fs = require("fs")

const DST = "D:/Downloads/BaiduDisk/李翰祥风月片34部"
const MOVIE = ".avi.mkv.mp4"

let files = fs.readdirSync(DST)
for (let p of files) {
  let f = path.join(DST, p)
  let subfiles = fs.readdirSync(f)
  for (let subfile of subfiles) {
    if (MOVIE.indexOf(path.extname(subfile)) === -1) {
      continue
    }

    let newName = p.replace("[", "").replace("]", "")
    console.log("重命名：", path.join(DST, p, subfile))
    fs.renameSync(path.join(DST, p, subfile), path.join(DST, "New", newName))
  }
}