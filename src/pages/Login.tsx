import { Button, Flex, Heading, useColorModeValue, useToast } from '@chakra-ui/react'
import { useNavigate, WindowLocation } from '@reach/router'
import qs from 'query-string'
import { FC, useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc'

import { useAuth } from 'config/auth'

interface Props {
  path?: string
  location?: WindowLocation
}

const Login: FC<Props> = ({ location }) => {
  const btnBackground = useColorModeValue('gray.200', 'blue.800')
  const toast = useToast()
  const navigate = useNavigate()
  const { currentUser, loginWithGoogle } = useAuth()

  useEffect(() => {
    if (currentUser) {
      const { returnUrl } = qs.parse(location?.search || '?')
      navigate(returnUrl && typeof returnUrl === 'string' ? returnUrl : '/')
    }
  }, [currentUser, navigate, location])

  const onClickLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      toast({
        title: 'Error to login',
        // @ts-ignore
        description: err.message,
        status: 'error',
      })
    }
  }

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" gap={8}>
      <Heading>Login</Heading>
      <Flex direction="column" gap={2} minWidth={{ base: '', md: '400px' }}>
        <Button leftIcon={<FcGoogle />} onClick={onClickLogin} bg={btnBackground}>
          Authenticate with Google
        </Button>
      </Flex>
    </Flex>
  )
}

export default Login
