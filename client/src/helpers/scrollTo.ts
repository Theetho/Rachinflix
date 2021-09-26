/**
 * from https://stackoverflow.com/questions/52292603/is-there-a-callback-for-window-scrollto
 * Native scrollTo with callback
 * @param offset - offset to scroll to
 * @param callback - callback function
 */
export const scrollTo = (element: HTMLElement | undefined | null, callback: () => void) => {
  if (!element) return
  // from https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element-relative-to-the-browser-window
  const bodyRect = document.body.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  const offset =
    elementRect.top -
    bodyRect.top -
    // Add an offset to the offset, so that it scroll to the center of the page
    window.outerHeight * 0.15
  const fixedOffset = offset.toFixed()
  const onScroll = function () {
    const epsilon = Math.abs(Number.parseInt(fixedOffset) - Number.parseInt(window.pageYOffset.toFixed()))
    if (epsilon < 5) {
      window.removeEventListener('scroll', onScroll)
      callback()
    }
  }

  window.addEventListener('scroll', onScroll)
  onScroll()
  window.scrollTo({
    top: offset,
    behavior: 'smooth'
  })
}
