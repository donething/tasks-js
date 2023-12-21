/**
 * 给任务 promise 增加 tag，以便给任务打印对应的网站等信息
 */
export interface PromiseName<T, V> {
  // 如 "v2ex"
  tag: T
  // 任务 Promise
  promise: V
}
