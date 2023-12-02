import fs from "fs"

/**
 * 读取文件内容为 JSON
 */
export const readJSON = <T>(path: string): T => {
  if (!fs.existsSync(path)) {
    return {} as T
  }

  return JSON.parse(fs.readFileSync(path).toString() || "{}")
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
