import { enableMapSet } from 'immer'

import app from 'modules/App'

enableMapSet()

const reducers = {
  app: app.reducer,
}

export default reducers
