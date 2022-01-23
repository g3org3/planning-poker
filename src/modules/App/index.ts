import * as _selectors from './App.selectors'
import slice from './App.slice'

export const selectors = _selectors
export const actions = slice.actions
export const reducer = slice.reducer

export default slice
