export function sortByNumber(e1: { number: number }, e2: { number: number }) {
  return e1.number < e2.number ? -1 : 1
}

export function sortByDate(e1: { date: number }, e2: { date: Number }) {
  return e1.date < e2.date ? 1 : -1
}
