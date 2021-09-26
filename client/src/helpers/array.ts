export const shuffle = (a: Array<any>): Array<any> => {
  var j, x, i
  var r = a.slice()
  for (i = r.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = r[i]
    r[i] = r[j]
    r[j] = x
  }
  return r
}

export function sortByNumber(s1: { number: number }, s2: { number: number }) {
  return s1.number < s2.number ? -1 : 1
}
