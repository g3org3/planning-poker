import { Box, Flex, Progress, Text, useToast } from '@chakra-ui/react'
import { Emoji } from 'emoji-mart'
import { FC, ReactNode, useEffect, useState } from 'react'

import { useAuth } from 'config/auth'
import { useGetUserDetails } from 'services/user'

interface Props {
  path?: string
  teamId?: string
  isSuperAdmin?: boolean
  children: ReactNode
}

// @ts-ignore
const Secured: FC<Props> = ({ teamId, children, isSuperAdmin }) => {
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const userDetails = useGetUserDetails(currentUser)
  const toast = useToast()

  useEffect(() => {
    if (!teamId && !isSuperAdmin) return
    if (userDetails === undefined) return

    if (userDetails && userDetails.rooms && teamId) {
      if (userDetails.rooms.map((x) => x.id).includes(teamId)) {
        setLoading(false)
      } else {
        setLoading(true)
        toast({ title: 'Project not found', status: 'warning' })
      }
    } else if (isSuperAdmin && userDetails && userDetails.isSuperAdmin) {
      setLoading(false)
    } else {
      setLoading(true)
      toast({ title: 'Project not found.', status: 'warning' })
    }
  }, [userDetails, teamId, toast, isSuperAdmin])

  if (loading) {
    return (
      <Box>
        <Flex direction="column" textAlign="center">
          <Emoji set="google" emoji=":hand:" size={32} />
          <Text fontFamily="monospace" fontSize={28}>
            Checking Credentials
          </Text>
          <Progress isIndeterminate />
        </Flex>
      </Box>
    )
  }

  return children
}

export default Secured
