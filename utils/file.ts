import fs from "fs"

export const readJSON = <T>(path: string): T => {
  return JSON.parse(fs.readFileSync(path, {flag: "a+"}).toString() || "{}")
}
export const writeJSON = (path: string, data: any) => {
  return fs.writeFileSync(path, JSON.stringify(data))
}