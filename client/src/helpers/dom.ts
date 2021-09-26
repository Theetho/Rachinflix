export function getCenter(element: HTMLElement) {
  const { x, width } = element.getBoundingClientRect()

  return x + width / 2
}

export function getHalfWidth(element: HTMLElement) {
  return element.getBoundingClientRect().width / 2
}
