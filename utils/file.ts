import fs from "fs"

export const readJSON = <T>(path: string): T => {
  if (!fs.existsSync(path)) {
    return {} as T
  }

  return JSON.parse(fs.readFileSync(path).toString() || "{}")
}
export const writeJSON = (path: string, data: any) => {
  return fs.writeFileSync(path, JSON.stringify(data), {flag: "w"})
}
