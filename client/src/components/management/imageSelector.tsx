import classNames from 'classnames'
import { CustomSkeleton } from 'components/common/skeletons'
import { SupportedLanguages_3166, TypeSupportedLanguages_3166 } from 'interface/management/language'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'

export const ImageSelectorComponent: React.FC<{
  images: string[] | undefined
  alt: string
  type: 'backdrops' | 'posters'
  select: (language: TypeSupportedLanguages_3166, image: string) => void
}> = observer(({ images, alt, type, select }) => {
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
  }, [images, images?.length])

  return (
    <div className="image-selector">
      <div className={type}>
        {!images ? (
          <>
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
            <CustomSkeleton condition={true} className="image" width={'17.5vw'} height={'17.5vh'} />
          </>
        ) : (
          images.map((image, index) => (
            <>
              {image ? (
                <div
                  className={classNames('image', state.isSelected(index) && 'selected')}
                  onClick={() => {
                    select(SupportedLanguages_3166[state.currentLanguage], image)
                    state.seleted[SupportedLanguages_3166[state.currentLanguage]] = index
                    state.currentLanguage = (state.currentLanguage + 1) % SupportedLanguages_3166.length
                  }}
                >
                  <img src={image} alt={alt} />
                  <div className="selected-language" style={{ pointerEvents: 'none' }}>
                    {state.selectedLanguage(index)}
                  </div>
                </div>
              ) : (
                <>{alt}</>
              )}
            </>
          ))
        )}
      </div>
    </div>
  )
})
