import { Api } from 'api/api'
import React from 'react'

const ApiContext = React.createContext(new Api('/api'))

export const ApiProvider: React.FC<{ api: Api }> = ({ children, api }) => (
  <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
)

export const useApi = () => React.useContext(ApiContext)
