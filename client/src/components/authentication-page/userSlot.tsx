import { useApi } from 'contexts/api'
import { UserHateoas } from 'interface'
import { observer } from 'mobx-react'
import React from 'react'
import './userSlot.scss'

export const UserSlotComponent: React.FC<{ user?: UserHateoas; onClick: () => void }> = observer(
  ({ onClick, user }) => {
    const api = useApi()
    return (
      <div className="user-slot" onClick={onClick}>
        {user ? (
          <>
            <img className="user-icon" src={api.hrefSync(user, 'getSprite')} alt="" />
            {user.name}
          </>
        ) : (
          <div className="user-icon" />
        )}
      </div>
    )
  }
)
