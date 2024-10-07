import React from 'react';
import { Navbar } from 'flowbite-react';
import { Link } from 'react-router-dom';

const AppNavbar: React.FC = () => {
  return (
    <Navbar fluid rounded>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link as={Link} to="/configuration" active={window.location.pathname === '/configuration'}>
          Configuration
        </Navbar.Link>
        <Navbar.Link as={Link} to="/" active={window.location.pathname === '/'}>
          Manage Agents
        </Navbar.Link>
        <Navbar.Link as={Link} to="/launcher" active={window.location.pathname === '/launcher'}>
          Launcher
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;
