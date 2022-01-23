import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useNavigate, WindowLocation } from '@reach/router'
import { Emoji } from 'emoji-mart'
import { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useAuth } from 'config/auth'
import { dbSet, dbOnDisconnect, dbRemove } from 'config/firebase'
import { useGetRoom } from 'services/room'
import { useGetUserDetails } from 'services/user'

interface Props {
  default?: boolean
  path?: string
  roomId?: string
  location?: WindowLocation
}

interface CardProps {
  points: string
  onClick?: () => void
  hidden?: boolean
  isActive?: boolean
}
const Card: FC<CardProps> = ({ points, onClick, isActive, hidden, ...props }) => {
  const hover =
    typeof onClick === 'function' ? { top: '-10px', bg: 'blue.500', color: 'white', boxShadow: 'md' } : {}
  const active =
    typeof onClick === 'function' ? { top: '-20px', bg: 'blue.700', color: 'white', boxShadow: 'lg' } : {}

  return (
    <Flex direction="column">
      <Flex
        position="relative"
        top={isActive ? '-10px' : '0px'}
        onClick={onClick}
        transition="300ms"
        color="blue.600"
        width="50px"
        height="80px"
        alignItems="center"
        justifyContent="center"
        _hover={hover}
        _active={active}
        cursor={typeof onClick === 'function' ? 'pointer' : 'normal'}
        border="2px"
        borderColor="blue.400"
        fontWeight="bold"
        fontSize={24}
        borderRadius="lg"
        bg={hidden ? 'blue.400' : ''}
        {...props}
      >
        {!hidden && <Text>{points}</Text>}
      </Flex>
      {isActive && <Text color="blue.600">picked</Text>}
    </Flex>
  )
}

const Poker: FC<Props> = ({ roomId, location }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, initialLoading } = useAuth()
  const userDetails = useGetUserDetails(currentUser)
  // const bg = { footer: useColorModeValue('teal.100', 'blue.600') }
  const room = useGetRoom(roomId)

  useEffect(() => {
    if (room && currentUser) {
      dbOnDisconnect(`/poker/rooms/${room.id}/users/${currentUser.uid}/connected`)
    }
  }, [room, currentUser])

  useEffect(() => {
    if (room && currentUser) {
      dbSet(`/poker/rooms/${room.id}/users/${currentUser.uid}`, 'displayName', currentUser.displayName)
      dbSet(`/poker/rooms/${room.id}/users/${currentUser.uid}`, 'connected', true)
      dbSet(`/poker/rooms/${room.id}/users/${currentUser.uid}`, 'id', currentUser.uid)
      dbSet(`/poker/users/${currentUser.uid}/roomIds/${room.id}`, 'id', room.id)
      dbSet(`/poker/users/${currentUser.uid}/roomIds/${room.id}`, 'name', room.name)
    }
  }, [room, dispatch, currentUser])

  const onClickCard = (card: string) => () => {
    if (!room || !currentUser) return

    dbSet(`/poker/rooms/${room.id}/issues/AF1/votes/${currentUser.uid}`, 'id', currentUser.uid)
    dbSet(
      `/poker/rooms/${room.id}/issues/AF1/votes/${currentUser.uid}`,
      'displayName',
      currentUser.displayName
    )
    dbSet(`/poker/rooms/${room.id}/issues/AF1/votes/${currentUser.uid}`, 'points', card)
  }

  const onClickReset = () => {
    if (room) {
      dbRemove(`/poker/rooms/${room.id}/issues/AF1/votes`)
      dbSet(`/poker/rooms/${room.id}/issues/AF1`, 'isHidden', true)
    }
  }

  const onClickReveal = () => {
    if (room) {
      dbSet(`/poker/rooms/${room.id}/issues/AF1`, 'isHidden', !isHidden)
    }
  }

  useEffect(() => {
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
      const query =
        location && location.pathname ? '?returnUrl=' + encodeURIComponent(location?.pathname) : ''
      navigate('/login' + query)
    }
  }, [userDetails, initialLoading, currentUser, navigate, location])

  const issue = room && room.issues && room.issues['AF1'] ? room.issues['AF1'] : null
  const votesById = issue && issue.votes ? issue.votes : {}
  const votes = issue && issue.votes ? Object.values(issue.votes) : []
  const currentVote = votes && currentUser ? votesById[currentUser.uid] : null
  const isHidden = issue?.isHidden

  return (
    <Flex direction="column" height="calc(100vh - 88px)">
      <Flex direction="column">
        <Heading gap={4}>
          <Emoji emoji={room?.emoji || ''} size={24} /> {room?.name}
        </Heading>
      </Flex>
      <Flex mt={4}>
        <Button onClick={onClickReset} size="sm" variant="outline" colorScheme="red">
          Reset
        </Button>
      </Flex>
      <Flex direction="column" alignItems="center" justifyContent="center" flex={1} gap={4}>
        <Flex
          bg="blue.100"
          direction="column"
          color="blue.500"
          p={10}
          pl={20}
          pr={20}
          borderRadius="20px"
          fontSize={32}
          gap={4}
        >
          Pick your cards!
          <Button colorScheme="blue" onClick={onClickReveal}>
            {isHidden ? 'Reveal' : 'Hide'} votes
          </Button>
        </Flex>
        <Flex gap={4}>
          {votes.map((vote) => (
            <Flex key={vote.id} direction="column" alignItems="center">
              <Card points={vote.points} hidden={isHidden} />
              {vote.displayName}
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Flex gap={4} justifyContent="center">
        {room?.votingSystem.map((card) => (
          <Card
            key={card}
            isActive={card === currentVote?.points}
            onClick={onClickCard(card)}
            points={card}
          />
        ))}
      </Flex>
      <Flex p={2} fontFamily="monospace" fontSize={16} gap={4}>
        Connected:{' '}
        {room?.users?.map((u, i) => (
          <Flex alignItems="center" key={u.id} gap={2}>
            {u.displayName}{' '}
            <Box
              bg={u.connected ? 'green.300' : 'tomato'}
              display="inline-block"
              height={3}
              width={3}
              borderRadius="full"
            />{' '}
            {i + 1 === room?.users?.length ? '' : ', '}
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export default Poker
