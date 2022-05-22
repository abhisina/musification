import React from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

export const Header = () => {
    return (
        <header>
            <Navbar expand="lg" bg="dark" variant="dark" className="fixed-top bg-info">
                <Navbar.Brand><Link to="/">sonif.ai</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Item><Link to="/video">Video&nbsp;</Link></Nav.Item>
                        <Nav.Item><Link to="/config">Config&nbsp;</Link></Nav.Item>
                        <Nav.Item><Link to="/about">About</Link></Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}
