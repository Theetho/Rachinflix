import classNames from 'classnames'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { UserHateoas, UserModifiedOrCreated } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import { UserCreatorComponent } from './userCreator'
import { UserSlotComponent } from './userSlot'
import './welcome.scss'

export const WelcomePage: React.FC = observer(() => {
  const api = useApi()
  const store = useStore()

  const state = useLocalObservable(() => ({
    create: false,
    logoloaded: false,
    logoanimated: false,
    users: undefined as UserHateoas[] | undefined
  }))

  useEffect(() => {
    if (!state.logoloaded) return

    setTimeout(() => (state.logoanimated = true), 1200)
  }, [state.logoloaded])

  useEffect(() => {
    api.get<UserHateoas[]>('/users').then(users => (state.users = users))
  }, [])

  return (
    <div id="welcome-page">
      <img
        src="https://fontmeme.com/permalink/201018/a77c5e25e3d37d60b42a875cdcfbcf99.png"
        onLoad={() => (state.logoloaded = true)}
        className={classNames(state.create && 'small')}
        alt="Rachinflix"
      />
      {state.logoanimated && (
        <>
          {!state.create ? (
            <div className={'user-slots'}>
              {state.users?.map((user, index) => (
                <UserSlotComponent user={user} key={`${user.name}-${index}`} onClick={() => store.setUser(user)} />
              ))}
              <UserSlotComponent onClick={() => (state.create = true)} />
            </div>
          ) : (
            <UserCreatorComponent
              onSave={(user: UserModifiedOrCreated) => {
                state.create = false
                api
                  .post<{ _links: { getUsers: { href: string } } }>('/users', user)
                  .then(users => api.query<UserHateoas[]>(users, 'getUsers').then(users => (state.users = users)))
              }}
              onCancel={() => (state.create = false)}
            />
          )}
        </>
      )}
    </div>
  )
})
