import { EventEmitter } from 'fbemitter'
import React from 'react'

export enum ClientEvent {
  OpenBrowser = 'openbrowser',
  CloseBrowser = 'closebrowser',
  OpenPlayer = 'openplayer',
  ClosePlayer = 'closeplayer',
  Tooltip = 'tooltip',
  ChangeVideoUrl = 'changevideourl',
  ChangeVideoSubtitle = 'changevideosubtitle',
  LoadSubtitles = 'loadsubtitles',
  RemuxProgress = 'remuxprogress',
  RequestCustomEpisode = 'requestcustomepisode'
}

const EventHandlerContext = React.createContext(new EventEmitter())

export const EventHandlerProvider: React.FC<{ handler: EventEmitter }> = ({ children, handler }) => (
  <EventHandlerContext.Provider value={handler}>{children}</EventHandlerContext.Provider>
)

export const useEventHandler = () => React.useContext(EventHandlerContext)
