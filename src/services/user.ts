import { User } from 'firebase/auth'
import { useState, useEffect } from 'react'

import { dbOnValue } from 'config/firebase'

export type UserDetails = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  rooms?: Array<{ id: string; name: string }>
}

export const useGetUserDetails = (currentUser: User | null) => {
  const [details, setDetails] = useState<UserDetails | null | undefined>(undefined)

  useEffect(() => {
    if (currentUser) {
      dbOnValue(`/poker/users/${currentUser.uid}`, (snap) => {
        const userDetails = snap.val()
        if (!userDetails) {
          setDetails(null)

          return
        }
        if (userDetails && userDetails.roomIds) {
          userDetails.rooms = Object.values(userDetails.roomIds)
        } else {
          userDetails.rooms = []
        }
        setDetails(userDetails)
      })
    }
  }, [currentUser])

  return details
}
