import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useSession, signIn, signOut } from "next-auth/react";

export function GlobalNav() {
  const { data: session } = useSession();
  if (session) {
    return (
      <Navbar
        bg="light"
        expand="lg"
        className="d-flex justify-content-md-between border-bottom"
      >
        <Container>
          <Navbar.Brand href="/">Syllabi Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
        <Container>
          <Navbar.Collapse id="basic-navbar-nav" className="flex-row-reverse">
            <Nav className="float-end">
              <Nav.Link href="/about" className="py-3 text-end">
                About
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <>
            Hi {session.user?.name}! <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
        </Container>
      </Navbar>
    );
  } else {
    return (
      <Navbar
        bg="light"
        expand="lg"
        className="d-flex justify-content-md-between border-bottom"
      >
        <Container>
          <Navbar.Brand href="/">Syllabi Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
        <Container>
          <Navbar.Collapse id="basic-navbar-nav" className="flex-row-reverse">
            <Nav className="float-end">
              <Nav.Link href="/about" className="py-3 text-end">
                About
              </Nav.Link>
              <Nav.Link
                onClick={() => signIn()}
                href="/auth/signin"
                className="py-3 text-end"
              >
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}
