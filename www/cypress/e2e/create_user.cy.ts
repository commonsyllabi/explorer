/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Create a new user', () => {
  it('should navigate to the home page', () => {
    // Start from the index page
    cy.visit('/')

    cy.get('[data-cy="signin-button"]').click({force: true})
  })

  it('should enter all user details', () => {
    cy.intercept('POST', '/users', {
      statusCode: 201,
      body: {}
    }).as('signUp')

    cy.get('[data-cy="Signup-tab"]').click({ force: true })
    cy.wait(500)

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
    cy.visit('/')

    cy.get('[data-cy="signin-button"]').click()
  })

  it('should enter all login details', () => {
    cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
      req.continue((res) => {
        if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
      })
    }).as('login')

    cy.get('[data-cy="signin-button"]').click({ force: true })

    cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", {force: true})
    cy.get('[data-cy="signin-button-password"]').type("12345678")

    cy.get('[data-cy="signin-button-submit"]').click()
    cy.wait('@login')

    cy.get('[data-cy="libraryLink"]')
  })
})

export { }
