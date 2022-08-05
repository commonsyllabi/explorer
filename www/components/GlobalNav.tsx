import * as React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useSession, signIn, signOut } from "next-auth/react"

export function GlobalNav() {
  const { data: session } = useSession()
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
              <Nav.Link href="#login" className="py-3 text-end">
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <>
            Signed in! <br />
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
            <Nav.Link href="#login" className="py-3 text-end">
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      </Container>
    </Navbar>
    )
  }
}
