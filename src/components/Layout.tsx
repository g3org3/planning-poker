import {
  Avatar,
  Button,
  Flex,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as ReachLink, useNavigate, WindowLocation } from '@reach/router'
import { AnimatePresence, motion } from 'framer-motion'
import React, { memo, useCallback } from 'react'
import { FiX } from 'react-icons/fi'

import ColorModeSwitcher from 'components/ColorModeSwitcher'
import { useAuth } from 'config/auth'

export type MenuItems = Array<{
  path: string
  label: string
  icon: string
}>

interface Props {
  title: string
  homeUrl?: string
  by?: string
  children: React.ReactNode
  path?: string
  location?: WindowLocation
  menuItems?: MenuItems
}

const Layout: React.FC<Props> = ({ homeUrl, children, title, by, menuItems, location }) => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const bg = {
    navbar: useColorModeValue('teal.300', 'teal.500'),
    divider: useColorModeValue('gray.200', 'gray.700'),
  }
  const pagePadding = { base: '10px', md: '20px 40px' }

  const onClickAuth = useCallback(() => {
    if (currentUser) {
      logout()
    } else {
      navigate('/login')
    }
  }, [logout, currentUser, navigate])

  return (
    <>
      <Flex direction="column" minH="100vh" minWidth="100vw" pt="48px">
        <Flex
          bg={bg.navbar}
          position="fixed"
          zIndex="2"
          top="0"
          width="100vw"
          height="48px"
          alignItems="center"
          gap="10px"
          boxShadow="md"
          padding={pagePadding}
        >
          <Menu>
            <MenuButton variant="ghost" as={Button}>
              <Avatar src={currentUser?.photoURL || ''} size="sm" />
            </MenuButton>
            <MenuList>
              {menuItems?.map((item) => (
                <MenuItem key={item.path}>
                  <Link as={ReachLink} to={item.path} display="flex" gap={2}>
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </MenuItem>
              ))}
              {menuItems && <MenuDivider color={bg.divider} />}
              <MenuItem onClick={onClickAuth} icon={<span>🔓</span>}>
                {currentUser ? 'Log out' : 'Log in'}
              </MenuItem>
            </MenuList>
          </Menu>
          <Flex grow={{ base: '1', md: '0' }} justifyContent="center">
            <AnimatePresence>
              <motion.div whileHover={{ scale: 1.2 }}>
                <Link as={ReachLink} to={homeUrl || '/'}>
                  <Heading as="h1" size="md" display="flex" alignItems="center">
                    {title}{' '}
                    {by ? (
                      <>
                        <FiX size={13} /> {currentUser?.displayName || by}
                      </>
                    ) : null}
                  </Heading>
                </Link>
              </motion.div>
            </AnimatePresence>
          </Flex>
          <Flex flexGrow={{ base: '0', md: '1' }} gap={3} justify="flex-end" alignItems="center">
            <ColorModeSwitcher />
          </Flex>
        </Flex>
        <Flex padding={pagePadding} direction="column">
          {children}
        </Flex>
      </Flex>
    </>
  )
}

export default memo(Layout)
