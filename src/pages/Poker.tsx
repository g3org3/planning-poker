import { DeleteIcon, ViewOffIcon, ViewIcon } from '@chakra-ui/icons'
import { Box, Button, Code, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react'
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
      {typeof onClick === 'function' && (
        <Text
          transition="140ms"
          color={isActive ? 'blue.600' : 'transparent'}
          fontWeight="bold"
          height="30px"
        >
          picked
        </Text>
      )}
    </Flex>
  )
}

const Poker: FC<Props> = ({ roomId, location }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, initialLoading } = useAuth()
  const userDetails = useGetUserDetails(currentUser)
  const bgCenterBox = useColorModeValue('blue.200', 'blue.800')
  const room = useGetRoom(roomId)
  const issue = room && room.issues && room.issues['AF1'] ? room.issues['AF1'] : null
  const votesById = issue && issue.votes ? issue.votes : {}
  const votes = issue && issue.votes ? Object.values(issue.votes) : []
  const currentVote = votes && currentUser ? votesById[currentUser.uid] : null
  const isHidden = issue?.isHidden

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

    if (!isHidden) return

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

  return (
    <Flex direction="column" height="calc(100vh - 88px)">
      <Flex alignItems="center">
        <Heading gap={4}>
          <Emoji emoji={room?.emoji || ''} size={24} /> {room?.name}
        </Heading>
        <Flex flex={1} justifyContent="flex-end" alignItems="center">
          <Button
            disabled={!votes.length}
            leftIcon={<DeleteIcon />}
            onClick={onClickReset}
            variant="ghost"
            colorScheme="red"
          >
            Reset
          </Button>
        </Flex>
      </Flex>
      <Flex direction="column" alignItems="center" justifyContent="center" flex={1} gap={4}>
        <Flex
          bg={bgCenterBox}
          direction="column"
          color="blue.500"
          width={{ base: 'unset', md: '400px' }}
          minWidth={{ base: '300px', md: 'unset' }}
          height="160px"
          alignItems="center"
          justifyContent="center"
          borderRadius="20px"
          boxShadow="md"
          fontSize={32}
          gap={4}
        >
          {votes.length === 0 ? 'Pick your cards!' : 'Ready?'}
          <Button
            disabled={!votes.length}
            leftIcon={isHidden ? <ViewIcon /> : <ViewOffIcon />}
            colorScheme="blue"
            onClick={onClickReveal}
          >
            {isHidden ? 'Reveal' : 'Hide'} votes
          </Button>
        </Flex>
        {!votes.length && <Flex height="92px" width="120px"></Flex>}
        <Flex gap={4} overflow={{ base: 'auto', md: 'unset' }}>
          {votes.map((vote) => (
            <Flex key={vote.id} direction="column" alignItems="center" gap={2}>
              <Card points={vote.points} hidden={isHidden} />
              <Code p={1} pl={3} pr={3}>
                {vote.displayName}
              </Code>
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Flex
        gap={4}
        alignItems="flex-end"
        justifyContent={{ base: 'flex-start', md: 'center' }}
        overflow={{ base: 'auto', md: 'unset' }}
        height="120px"
      >
        {room?.votingSystem.map((card) => (
          <Card
            key={card}
            isActive={card === currentVote?.points}
            onClick={onClickCard(card)}
            points={card}
          />
        ))}
      </Flex>
      <Flex
        p={2}
        fontFamily="monospace"
        height="30px"
        fontSize={16}
        gap={4}
        overflow={{ base: 'auto', md: 'unset' }}
      >
        {room?.users?.map((u, i) => (
          <Flex alignItems="center" key={u.id} gap={2}>
            <pre>{u.displayName}</pre>
            <Box
              bg={u.connected ? 'green.300' : 'tomato'}
              display="inline-block"
              height={3}
              width={3}
              borderRadius="full"
            />
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export default Poker
