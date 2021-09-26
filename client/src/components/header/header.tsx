import { observer } from 'mobx-react'
import React from 'react'
import './header.scss'
import { SearchMenuComponent } from './searchMenu'
import { UserMenuComponent } from './userMenu'

export const HeaderComponent: React.FC = observer(() => (
  <>
    <header id="header">
      <div id="header-left">
        <SearchMenuComponent />
        <img
          id="header-logo"
          src="https://fontmeme.com/permalink/201018/a77c5e25e3d37d60b42a875cdcfbcf99.png"
          alt="Rachinflix"
        />
      </div>
      <div id="header-right">
        <UserMenuComponent />
      </div>
    </header>
  </>
))