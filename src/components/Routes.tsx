import { Router } from '@reach/router'

import Layout, { MenuItems } from 'components/Layout'
import Home from 'pages/Home'
import Login from 'pages/Login'
import Poker from 'pages/Poker'
import SuperAdmin from 'pages/SuperAdmin'
import Welcome from 'pages/Welcome'

import Secured from './Secured'

const menuItems: MenuItems = []

const Routes = () => {
  return (
    <Router>
      <Layout title="Planning Poker" by="Jorge Adolfo" homeUrl="/poker" menuItems={menuItems} path="/">
        <Home path="/poker" />
        <Secured path="/super-admin" isSuperAdmin>
          <SuperAdmin path="/" />
        </Secured>
        <Poker path="/poker/:roomId" />
        <Login path="/login" />
        <Welcome default />
      </Layout>
    </Router>
  )
}

export default Routes
