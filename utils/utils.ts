// 是否为青龙环境
export const isQL = !!process.env.cmd_ql

// 计算字符串型的数学计算
// @see https://stackoverflow.com/a/73250658
export const calStr = (expression: string) => {
  return new Function(` return ${expression}`)()
}
