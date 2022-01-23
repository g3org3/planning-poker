import { Flex } from '@chakra-ui/react'
import { useNavigate } from '@reach/router'
import { FC, useEffect } from 'react'

import { useAuth } from 'config/auth'

interface Props {
  default?: boolean
  path?: string
}

const Empty: FC<Props> = () => {
  const { currentUser, initialLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser && !initialLoading) navigate('/login')
    if (currentUser && !initialLoading) navigate('/poker')
  }, [currentUser, navigate, initialLoading])

  return (
    <>
      <Flex direction="column"></Flex>
    </>
  )
}

export default Empty
