import { useState, useEffect } from 'react'

import { dbOnValue } from 'config/firebase'

export interface Vote {
  id: string
  displayName: string
  points: string
}

export interface RoomUser {
  id: string
  displayName: string
  connected: boolean
}

export interface Issue {
  isHidden: boolean
  votes: { [userId: string]: Vote }
}

export type Room = {
  id: string
  emoji: string
  name: string
  users?: Array<RoomUser>
  issues?: { [issueId: string]: Issue }
  votingSystem: Array<string>
}

export const vs = {
  fib: ['0', '1', '2', '5', '8', '13', '21', '?'],
  custom: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5'],
}

export const useGetRoom = (roomId?: string | null) => {
  const [val, setval] = useState<Room | null>(null)

  useEffect(() => {
    if (roomId) {
      dbOnValue(`/poker/rooms/${roomId}`, (snap) => {
        const value = snap.val()
        if (!value) {
          setval(null)

          return
        }
        if (value && value.users) {
          value.users = Object.values(value.users)
        } else {
          value.users = []
        }
        if (value.votingSystem && typeof value.votingSystem === 'string') {
          // @ts-ignore
          value.votingSystem = vs[value.votingSystem]
        } else {
          value.votingSystem = []
        }

        setval(value)
      })
    }
  }, [roomId])

  return val
}
