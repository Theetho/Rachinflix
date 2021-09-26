export type TypeLinkHateoas = { href: string }

export type TypeActionHateoas = {
  href: string
  method: 'GET' | 'get' | 'POST' | 'post' | 'PUT' | 'put' | 'PATCH' | 'patch' | 'DELETE' | 'delete'
  body?: any
}

export type TypeHateoas = {
  _links?: Record<string, TypeLinkHateoas | TypeLinkHateoas[] | Record<string, TypeLinkHateoas | TypeLinkHateoas[]>>
  _actions?: Record<
    string,
    TypeActionHateoas | TypeActionHateoas[] | Record<string, TypeActionHateoas | TypeActionHateoas[]>
  >
}

type FollowLink = string
type FollowAction = `@${string}`
export type TypePatternHateoas = FollowLink | FollowAction

/**
 * 
 actionorlink = {
    getPoster: { href: `/season/${string}/poster?language=${Language}` }
    getTrailer: { href: `/season/${string}/trailer?language=${Language}` }
    getEpisodes: {
      [episode: string]: { href: `/episode/${string}?language=${Language}` }
    }
  }
 *
 */
function find<T extends TypeLinkHateoas | TypeActionHateoas>(
  actionorlink: Record<string, T | T[] | Record<string, T | T[]>> | undefined,
  name: string
): T | undefined {
  if (actionorlink == null) return undefined

  let result = (actionorlink as Record<string, T> | undefined)?.[name]

  // true with name === getPoster || name === getTrailer
  if (result) return result

  // Would give [{href: ...}, {href: ...}, {[episode]}]
  Object.values(actionorlink as Record<string, T | Record<string, T>>).forEach(sublevel => {
    if (result) return
    if (sublevel.href) return

    Object.keys(sublevel).forEach(key => {
      if (key === name) {
        result = (sublevel as Record<string, T>)[key]
      }
    })
  })

  return result
}

export class Api {
  prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
  }

  private error(pattern: string): Error {
    return new Error(`No link or action '${pattern}' for this object`)
  }

  async get<T = any>(href: string): Promise<T> {
    href = href.startsWith('/') ? `${this.prefix}${href}` : `${this.prefix}/${href}`

    return fetch(href, { cache: 'reload' })
      .then(res => res?.json())
      .catch(e => {
        // console.error(`Can't parse the received object (is the hateoas query returning void ? If yes, ignore that)`)
        return undefined
      })
  }

  async post<T = any>(href: string, body: any): Promise<T> {
    href = href.startsWith('/') ? `${this.prefix}${href}` : `${this.prefix}/${href}`

    return fetch(href, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'reload',
      body: JSON.stringify(body)
    })
      .then(res => res?.json())
      .catch(e => {
        // console.error(`Can't parse the received object (is the hateoas query returning void ? If yes, ignore that)`)
        return undefined
      })
  }

  async query<T = any>(hateoas: TypeHateoas, pattern: TypePatternHateoas): Promise<T> {
    return this._executor(hateoas, pattern, this._query, this)
  }

  async href(hateoas: TypeHateoas, pattern: TypePatternHateoas): Promise<string> {
    return this._executor(hateoas, pattern, this._href, this)
  }

  hrefSync(hateoas: TypeHateoas, pattern: TypePatternHateoas) {
    return this._href(hateoas, pattern, this)
  }

  addPrefix(href: string) {
    return href.startsWith('/') ? `${this.prefix}${href}` : `${this.prefix}/${href}`
  }

  private async _executor<T = any>(
    hateoas: TypeHateoas,
    pattern: TypePatternHateoas,
    executor: (hateoas: TypeHateoas, pattern: TypePatternHateoas, _this: Api) => T,
    _this: Api
  ): Promise<T> {
    let patterns = pattern.split('.')
    let step = Object.assign({}, hateoas)

    // Make all the intermediary request
    while (patterns.length > 1) {
      step = await this._query(step, patterns[0], _this)
      patterns = patterns.slice(1)
    }

    return await executor(step, patterns[0], _this)
  }

  private async _query<T = any>(hateoas: TypeHateoas, pattern: TypePatternHateoas, _this: Api): Promise<T> {
    // Follow an action
    if (pattern.startsWith('@')) {
      const name = pattern.slice(1)
      const action = find(hateoas._actions, name)
      if (action == null) {
        throw _this.error(pattern)
      }

      let { href, method, body } = action

      href = href.startsWith('/') ? `${_this.prefix}${href}` : `${_this.prefix}/${href}`

      return fetch(href, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'reload',
        body: JSON.stringify(body)
      })
        .then(res => res?.json())
        .catch(e => {
          // console.error(`Can't parse the received object (is the hateoas query returning void ? If yes, ignore that)`)
          return undefined
        })
      // Follow a link
    } else {
      const link = find(hateoas._links, pattern)
      if (link == null) {
        throw _this.error(pattern)
      }

      if (Array.isArray(link)) {
        return new Promise((resolve, reject) => {
          Promise.all(
            link.map(({ href }) => {
              href = href.startsWith('/') ? `${_this.prefix}${href}` : `${_this.prefix}/${href}`

              return fetch(href, { cache: 'reload' })
                .then(res => res?.json())
                .catch(e => {
                  // console.error(
                  //   `Can't parse the received object (is the hateoas query returning void ? If yes, ignore that)`
                  // )
                  return undefined
                })
            })
          ).then(result => resolve(result as unknown as T))
        })
      }

      let { href } = link
      href = href.startsWith('/') ? `${_this.prefix}${href}` : `${_this.prefix}/${href}`

      return fetch(href, { cache: 'reload' })
        .then(res => res?.json())
        .catch(e => {
          // console.error(`Can't parse the received object (is the hateoas query returning void ? If yes, ignore that)`)
          return undefined
        })
    }
  }

  private _href(hateoas: TypeHateoas, pattern: TypePatternHateoas, _this: Api): string {
    // Follow an action
    if (pattern.startsWith('@')) {
      const name = pattern.slice(1)
      const action = find(hateoas._actions, name)
      if (action == null) {
        throw _this.error(pattern)
      }

      let { href } = action

      return href.startsWith('/') ? `${_this.prefix}${href}` : `${_this.prefix}/${href}`
      // Follow a link
    } else {
      const link = find(hateoas._links, pattern)
      if (link == null) {
        throw _this.error(pattern)
      }

      let { href } = link
      return href.startsWith('/') ? `${_this.prefix}${href}` : `${_this.prefix}/${href}`
    }
  }
}
