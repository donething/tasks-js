/**
 * 执行任务后的返回值
 */
export interface Result<T, V> {
  // 标签。按需传递泛型
  tag: T
  // 返回数据
  data: V
}
