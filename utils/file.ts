import fs from "fs"

/**
 * 读取文件内容为 JSON
 */
export const readJSON = <T>(path: string, defautl?: T): T => {
  const tmp = defautl || ({} as T)
  if (!fs.existsSync(path)) {
    return tmp
  }

  const text = fs.readFileSync(path)
  if (!text) {
    return tmp
  }

  return JSON.parse(text.toString())
}

/**
 * 保存 JSON 文本到文件
 */
export const writeJSON = (path: string, data: any) => {
  const dir = path.substring(0, path.lastIndexOf("/"))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  }

  fs.writeFileSync(path, JSON.stringify(data), {flag: "w"})
}
