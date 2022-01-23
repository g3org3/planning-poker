import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Link,
  Select,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { Link as ReachLink, useNavigate } from '@reach/router'
import { Emoji } from 'emoji-mart'
import { FC, useEffect, useCallback, memo } from 'react'

import { useAuth } from 'config/auth'
import { dbPush, dbSet } from 'config/firebase'
import { useInput } from 'services/input'
import { vs } from 'services/room'
import { useGetUserDetails } from 'services/user'

interface Props {
  default?: boolean
  path?: string
}

const Home: FC<Props> = (props) => {
  const { currentUser, initialLoading } = useAuth()
  const userDetails = useGetUserDetails(currentUser)
  const navigate = useNavigate()
  const [name, inputPropsName, setName] = useInput<string>('')
  const [joined, inputPropsJoined] = useInput<string>('')
  const [votingSystem, inputPropsVS, setVS] = useInput<string>('fib')
  const [code, inputPropsCode] = useInput<string>('')
  const toast = useToast()
  const bg = {
    border: useColorModeValue('gray.200', 'gray.500'),
  }

  useEffect(() => {
    if (userDetails === undefined) return
    if (!initialLoading && !userDetails && currentUser) {
      const payload = {
        id: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        isAdmin: false,
        isSuperAdmin: false,
      }
      dbSet('/poker/users', currentUser.uid, payload)
    }
    if (!initialLoading && !currentUser) {
      navigate('/login')
    }
  }, [userDetails, initialLoading, currentUser, navigate])

  const isDisabled = !name || !votingSystem

  const onSubmit = useCallback(
    (e: any) => {
      if (isDisabled) return
      e.preventDefault()
      const payload = {
        name,
        votingSystem,
      }
      const { key } = dbPush('/poker/rooms/', payload)
      if (key) {
        dbSet(`/poker/rooms/${key}/`, 'id', key)
        dbSet(`/poker/roomNames/`, key, name)
      }
      setName('')
      setVS('')
      toast({ title: 'New Room Created', status: 'success' })
      navigate(`/poker/${key}`)
    },
    // eslint-disable-next-line
    [isDisabled, name, votingSystem]
  )

  return (
    <Flex direction="column" alignItems="center" gap={10}>
      <Heading as="h1" display="flex" alignItems="center" textAlign={{ base: 'center', md: 'left' }}>
        <Emoji emoji=":hand:" size={28} />{' '}
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 0, md: 2 }}>
          <Flex justifyContent="center">Welcome to</Flex>
          <Flex justifyContent="center">Planning Poker</Flex>
        </Flex>{' '}
        <Emoji emoji=":black_joker:" size={28} />
      </Heading>

      <Flex gap={10} direction={{ base: 'column', md: 'row' }}>
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap={6}>
            <Heading as="h2" fontSize="2xl">
              Create a room
            </Heading>
            <Input placeholder="Room's name" {...inputPropsName} />
            <Select placeholder="Voting system" {...inputPropsVS}>
              {Object.entries(vs).map(([name, val]) => (
                <option key={name} value={name}>
                  {name} ({val.join(', ')})
                </option>
              ))}
            </Select>
            <Button disabled={isDisabled} type="submit" colorScheme="blue">
              Create Room
            </Button>
          </Flex>
        </form>

        <Box borderLeft={{ base: '0', md: '1px' }} borderColor={bg.border} paddingLeft={{ base: 0, md: 10 }}>
          <form>
            <Flex direction="column" gap={6}>
              <Heading as="h2" fontSize="2xl">
                Join a room
              </Heading>
              <Input placeholder="Room's code" {...inputPropsCode} />
              <Button
                as={(props) => <Link as={ReachLink} {...props} />}
                colorScheme="teal"
                to={`/poker/${code}`}
              >
                Join Room
              </Button>
            </Flex>
          </form>
        </Box>
      </Flex>
      {userDetails?.rooms && (
        <Flex direction="column" gap={6} minW="300px">
          <Heading as="h2" fontSize="2xl">
            Latest room joined
          </Heading>
          <Select placeholder="pick a room" {...inputPropsJoined}>
            {userDetails.rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </Select>
          <Button
            as={(props) => <Link as={ReachLink} {...props} />}
            colorScheme="teal"
            to={`/poker/${joined}`}
          >
            Join Room
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default memo(Home)
