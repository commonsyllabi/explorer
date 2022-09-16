/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Create a new user', () => {
  it('should navigate to the home page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')

    cy.get('[data-cy="Login"]').click()
  })

  it('should enter all user details', () => {
    cy.intercept('POST', 'http://localhost:3046/users',{
      statusCode: 201,
      body: {}
    }).as('signUp')

    cy.contains('Sign up').click({force: true})

    cy.get('[data-cy="Signup-name"]').type("Test user")
    cy.get('[data-cy="Signup-email"]').type("pierre.depaz@gmail.com")
    cy.get('[data-cy="Signup-email-conf"]').type("pierre.depaz@gmail.com")
    cy.get('[data-cy="Signup-password"]').type("87654321")
    cy.get('[data-cy="Signup-password-conf"]').type("87654321")

    cy.get('[data-cy="Signup-submit"]').click()
    
    cy.wait('@signUp').then((res) => {
      cy.get('[data-cy="Success"]')
    })
    
  })
})

describe('Login an existing user', () => {
  it('should navigate to the home page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')

    cy.get('[data-cy="Login"]').click()
  })

  it('should enter all login details', () => {
    cy.intercept('POST', '/api/*',(req) => {
      console.log("yeyas")
      req.continue((res) => {
        expect(res.statusCode).to.be('200')
      })
    }).as('login')

    cy.contains('Login').click({force: true})

    cy.get('[data-cy="Login-email"]').type("pierre.depaz@gmail.com")
    cy.get('[data-cy="Login-password"]').type("12345678")
    
    cy.get('[data-cy="Login-submit"]').click()

    cy.get('[data-cy="Logged user"]')
  })
})

export { }
