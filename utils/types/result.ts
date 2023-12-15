/**
 * 执行任务后的返回值
 */
export interface Result<T> {
  // 标签。如 "v2ex"
  tag: string
  // 返回数据
  data: T;
}
