export type RemuxHateoas = {
  done: boolean
  progress: number
  _links: {
    continue: { href: string }
  }
}
