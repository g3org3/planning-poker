import { Room } from 'services/room'

import { State } from './App.slice'

interface Store {
  app: State
}

export const selectCount = (store: Store): number => {
  return store.app.count
}

export const selectGetRooms = (store: Store): Array<Room> => {
  return Array.from(store.app.roomsById.values())
}

export const selectGetRoomById =
  (id: string) =>
  (store: Store): Room | undefined => {
    return store.app.roomsById.get(id)
  }

export const selectDisplayName = (state: Store): string => {
  return state.app.displayName
}
