import { Button, ButtonVariation } from 'components/common/button'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { CustomSkeleton } from 'components/common/skeletons'
import { useApi } from 'contexts/api'
import { Research } from 'interface/management'
import { SearchItem } from 'interface/management/interface'
import {
  Language_3166_1,
  SupportedLanguages_3166,
  SupportedLanguages_639,
  TypeSupportedLanguages_3166,
  TypeSupportedLanguages_639
} from 'interface/management/language'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { ImageSelectorComponent } from './imageSelector'
import './managementPage.scss'
import { VideoSelectorComponent } from './videoSelector'

export const ManagementPage: React.FC = observer(() => {
  const api = useApi()

  const state = useLocalObservable(() => ({
    itemsToSearch: undefined as SearchItem[] | undefined,
    currentItem: undefined as SearchItem | undefined,
    currentResult: undefined as Research | undefined,
    currentIndex: 0,
    backdrops: {} as Record<TypeSupportedLanguages_3166, null | string>,
    posters: {} as Record<TypeSupportedLanguages_3166, null | string>,
    trailers: {} as Record<TypeSupportedLanguages_3166, null | string>,
    validate(type: 'films' | 'series' | 'seasons') {
      return type === 'films' || type === 'seasons'
        ? (this.currentResult?.backdrops[state.currentIndex].length === 0 ||
            // Only one backdrop is required
            Object.values(this.backdrops).reduce<boolean>((result, current) => result || current != null, false)) &&
            (this.currentResult?.posters[state.currentIndex].length === 0 ||
              Object.values(this.posters).reduce<boolean>((result, current) => result && current != null, true)) &&
            (this.currentResult?.trailers?.[state.currentIndex].length === 0 ||
              Object.values(this.trailers).reduce<boolean>((result, current) => result && current != null, true))
        : true
    },
    complete: false,
    showError: false
  }))

  useEffect(() => {
    document.getElementById('header-search-menu')?.setAttribute('style', 'display: none')
    document.getElementById('user-menu')?.setAttribute('style', 'display: none')

    api.get<SearchItem[]>('/management?type=films').then(itemsToSearch => {
      state.itemsToSearch = itemsToSearch
    })

    return () => {
      document.getElementById('header-search-menu')?.removeAttribute('style')
      document.getElementById('user-menu')?.removeAttribute('style')
    }
  }, [])

  useEffect(() => {
    if (state.itemsToSearch?.length === 0) {
      if (state.currentResult) {
        api
          .query<SearchItem[]>(state.currentResult, 'continue')
          .then(itemsToSearch => {
            if (itemsToSearch == null) {
              state.complete = true
            }
            state.itemsToSearch = itemsToSearch
          })
          .catch(() => {
            state.complete = true
          })
      }
      return
    }

    if (!state.itemsToSearch) {
      return
    }

    state.currentResult = undefined
    state.currentIndex = 0

    state.currentItem = state.itemsToSearch[state.currentIndex]
    api
      .query<Research>(state.currentItem, 'getInformations')
      .then(result => {
        state.currentResult = result
      })
      .catch(() => {
        state.complete = true
      })
  }, [state.itemsToSearch, state.itemsToSearch?.length])

  useEffect(() => {
    SupportedLanguages_3166.map(language => {
      state.backdrops[language] = null
      state.posters[language] = null
      state.trailers[language] = null
    })

    state.showError = false
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [state.currentResult])

  const maxIndex = useMemo(() => {
    return (state.currentResult?.results?.length ?? 1) - 1
  }, [state.currentResult])

  return (
    <>
      <div id="management-page">
        {state.complete ? (
          <div>No more files</div>
        ) : (
          <>
            <div className="management-media">
              {(!state.currentResult || maxIndex > 0) && (
                <div
                  className={`slider`}
                  onClick={() => {
                    state.currentIndex -= 1
                    if (state.currentIndex < 0) {
                      state.currentIndex = maxIndex
                    }
                  }}
                >
                  <Icon name={IconName.CHEVRON_LEFT} size={IconSize.MEDIUM} />
                </div>
              )}
              <h1>
                <CustomSkeleton condition={state.currentResult == null} width={'15em'} height={'1em'}>
                  {state.currentItem?.title}
                </CustomSkeleton>
              </h1>
              {(!state.currentResult || maxIndex > 0) && (
                <div
                  className={`slider`}
                  onClick={() => {
                    state.currentIndex += 1
                    if (state.currentIndex > maxIndex) {
                      state.currentIndex = 0
                    }
                  }}
                >
                  <Icon name={IconName.CHEVRON_RIGHT} size={IconSize.MEDIUM} />
                </div>
              )}
            </div>
            <div className="titles-overviews">
              {SupportedLanguages_639.map((language: TypeSupportedLanguages_639) => (
                <div>
                  <h3>
                    <CustomSkeleton condition={!state.currentResult} width={'20vw'} height="100%">
                      {state.currentResult?.results?.[state.currentIndex][language].title}
                    </CustomSkeleton>
                  </h3>
                  <div>
                    <CustomSkeleton condition={!state.currentResult} width={'40vw'} height="1em">
                      {state.currentResult?.results?.[state.currentIndex][language].overview}
                    </CustomSkeleton>
                  </div>
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                  <CustomSkeleton
                    condition={!state.currentResult}
                    width={'40vw'}
                    height="1em"
                    style={{ marginTop: '0.5em' }}
                  />
                </div>
              ))}
            </div>
            <h2>Backdrops</h2>
            <ImageSelectorComponent
              images={state.currentResult?.backdrops?.[state.currentIndex]}
              alt="No backdrops"
              type="backdrops"
              select={(language: TypeSupportedLanguages_3166, image: string) => {
                state.backdrops[language] = image
              }}
            />
            <h2>Posters</h2>
            <ImageSelectorComponent
              images={state.currentResult?.posters?.[state.currentIndex]}
              alt="No posters"
              type="posters"
              select={(language: TypeSupportedLanguages_3166, image: string) => {
                state.posters[language] = image
              }}
            />
            <h2>Trailers</h2>
            <VideoSelectorComponent
              videos={state.currentResult?.trailers?.[state.currentIndex]}
              alt="No videos"
              select={(language: TypeSupportedLanguages_3166, video: string) => {
                state.trailers[language] = video
              }}
            />
            {state.showError && (
              <div className="missing-fields">
                {SupportedLanguages_3166.map(language => (
                  <>
                    {state.backdrops[language] == null && <div>Missing backdrop for language '{language}'</div>}
                    {state.posters[language] == null && <div>Missing poster for language '{language}'</div>}
                    {state.trailers[language] == null && <div>Missing trailer for language '{language}'</div>}
                  </>
                ))}
              </div>
            )}
            <Button
              onClick={() => {
                if (!state.currentItem) {
                  return
                }

                if (state.currentResult && state.validate(state.currentResult.type)) {
                  if (state.currentResult.results) {
                    const results = state.currentResult.results

                    state.currentResult._actions.register.body = {
                      tmdb_id: results[state.currentIndex].tmdb_id,
                      backdrop: state.backdrops[Language_3166_1.ENG_US as TypeSupportedLanguages_3166],
                      posters: state.posters,
                      trailers: state.trailers
                    }
                  }

                  api.query(state.currentResult, '@register').catch(e => {
                    console.error(`Can't register this media: `, e)
                  })

                  state.itemsToSearch = state.itemsToSearch?.slice(1)
                } else {
                  state.showError = true
                }
              }}
              variation={ButtonVariation.Octonary}
            >
              <div>Validate</div>
            </Button>
          </>
        )}
      </div>
    </>
  )
})
