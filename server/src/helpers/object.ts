export function omit(object: Record<string, any>, field: string) {
  const result = Object.assign({}, object)
  delete result[field]
  return result
}
