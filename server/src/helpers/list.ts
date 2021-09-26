export function inline(args) {
  return `{ ${Object.keys(args).reduce((acc, cur) => `${acc}${cur}: ${args[cur]}, `, '')}`.replace(
    /, $/,
    ' }'
  )
}
