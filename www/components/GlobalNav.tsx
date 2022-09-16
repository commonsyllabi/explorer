import * as React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import { useSession, signIn, signOut } from "next-auth/react";
import { setEnvironmentData } from "worker_threads";

const GlobalNav: React.FunctionComponent = () => {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
    return (
      <Navbar
        bg="light"
        expand="lg"
        className="d-flex justify-content-md-between border-bottom"
      >
        <Container>
          <Navbar.Brand href="/">Syllabi Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="global-nav" />
        </Container>
        <Container>
          <Navbar.Collapse id="global-nav" className="flex-row-reverse">
            <Nav className="float-end">
              <Nav.Link href="/NewSyllabus" className="py-3 text-end">
                + New Syllabus
              </Nav.Link>

              <NavDropdown
                title={session.user.name}
                id="userNavDropdown"
                className=" text-end align-self-center"
                align="end"
                data-cy="Logged user"
              >
                <NavDropdown.Item
                  href={`/user/${session.user._id}`}
                  className="py-2 text-end"
                >
                  My Account
                </NavDropdown.Item>

                <NavDropdown.Item href="/about" className="py-2 text-end">
                  About
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item
                  href="#"
                  className="py-2 text-end"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
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
                href="/auth/signin"
                className="py-3 text-end"
                id="login-btn"
                data-cy="Login"
              >
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
};

export default GlobalNav;
