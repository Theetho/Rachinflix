import classNames from 'classnames'
import { SupportedLanguages_3166, TypeSupportedLanguages_3166 } from 'interface/management/language'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'

export const VideoSelectorComponent: React.FC<{
  videos: string[] | undefined
  alt: string
  select: (language: TypeSupportedLanguages_3166, video: string) => void
}> = observer(({ videos, alt, select }) => {
  const state = useLocalObservable(() => ({
    seleted: {} as Record<TypeSupportedLanguages_3166, undefined | number>,
    currentLanguage: 0,
    isSelected(index: number) {
      return Object.values(this.seleted).find(value => value === index) != null
    },
    selectedLanguage(index: number) {
      return Object.keys(this.seleted)
        .filter(key => this.seleted[key as TypeSupportedLanguages_3166] === index)
        .join(', ')
    }
  }))

  useEffect(() => {
    state.seleted = SupportedLanguages_3166.reduce((result, language) => {
      result[language] = undefined
      return result
    }, {} as Record<TypeSupportedLanguages_3166, undefined | number>)

    state.currentLanguage = 0
  }, [videos, videos?.length])

  return (
    <div className="video-selector">
      {videos?.map((video, index) => (
        <>
          {video ? (
            <div className={classNames('trailer', state.isSelected(index) && 'selected')}>
              <div className="video">
                <iframe src={video} height="281px" width="100%" allowFullScreen />
                <div className="selected-language" style={{ pointerEvents: 'none' }}>
                  {state.selectedLanguage(index)}
                </div>
              </div>
              <div
                className="trailer-selector"
                onClick={() => {
                  select(SupportedLanguages_3166[state.currentLanguage], video)
                  state.seleted[SupportedLanguages_3166[state.currentLanguage]] = index
                  state.currentLanguage = (state.currentLanguage + 1) % SupportedLanguages_3166.length
                }}
              >
                Trailer n°{index + 1}
              </div>
            </div>
          ) : (
            <>{alt}</>
          )}
        </>
      ))}
    </div>
  )
})
