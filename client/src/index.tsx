import { Api } from 'api/api'
import { EventHandlerProvider } from 'components/common/events'
import { StoreProvider } from 'components/common/store'
import { ApiProvider } from 'contexts/api'
import { EventEmitter } from 'fbemitter'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { App } from './App'
import './style.scss'

const eventHandler = new EventEmitter()
// const api = new Api('/api')
const api = new Api()

ReactDOM.render(
  <React.StrictMode>
    <EventHandlerProvider handler={eventHandler}>
      <ApiProvider api={api}>
        <StoreProvider>
          <Router>
            <App />
          </Router>
        </StoreProvider>
      </ApiProvider>
    </EventHandlerProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
