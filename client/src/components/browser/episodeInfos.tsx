import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { useApi } from 'contexts/api'
import { EpisodeHateoas } from 'interface'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import './episodeInfos.scss'

export const EpisodeInfos: React.FC<{
  episode: EpisodeHateoas
  requestCustomEpisode: (season: number, episode: number) => void
}> = observer(({ episode, requestCustomEpisode }) => {
  const api = useApi()

  const [thumbnail, setThumbnail] = useState<string>()

  useEffect(() => {
    api.href(episode, 'getThumbnail').then(setThumbnail)
  }, [episode])

  return (
    <div className="episode-infos">
      <div className="number">{episode.number}</div>
      <LazyLoadImage className="thumbnail" src={thumbnail} alt={episode.number.toString()} />
      <div
        className="hover"
        onClick={() => {
          requestCustomEpisode(episode.season_number, episode.number)
        }}
      >
        <Icon name={IconName.PLAY} size={IconSize.MEDIUM} />
      </div>
      <div className="title">{episode.title}</div>
      {/* <div className="duration">{state.duration} min</div> */}
      <div className="overview">{episode.overview}</div>
    </div>
  )
})
