import { createSlice } from '@reduxjs/toolkit'

import { Room } from 'services/room'

export interface State {
  count: number
  roomsById: Map<string, Room>
  displayName: string
}

type Action<T> = { type: string; payload: T }

export default createSlice({
  name: 'app',
  initialState: {
    count: 0,
    roomsById: new Map<string, Room>(),
    displayName: '',
  },
  reducers: {
    addCount: (state: State) => {
      state.count += 1
    },
    addRoom: (state: State, action: Action<Room>) => {
      const room = action.payload
      state.roomsById.set(room.id, room)
    },
    setDisplayName: (state: State, action: Action<string>) => {
      const displayName = action.payload
      state.displayName = displayName
    },
  },
})
