/* eslint-disable */

describe('Test user sign up and sign in flow', () => {
  it('should find the login page', () => {
    cy.visit('/')
    cy.get('[data-cy="signin-button"]').click({force: true})
  })

  it('should sign up a new user', () => {
    cy.intercept('POST', '/users', {
      statusCode: 201,
      body: {}
    }).as('signUp')

    cy.visit('/')
    cy.get('[data-cy="signin-button"]').click()

    cy.get('[data-cy="signup-tab"]').click({ force: true })
    cy.wait(500)

    cy.get('[data-cy="Signup-name"]').type("Test user")
    cy.get('[data-cy="Signup-email"]').type("pierre.depaz@gmail.com")
    cy.get('[data-cy="Signup-email-conf"]').type("pierre.depaz@gmail.com")
    cy.get('[data-cy="Signup-password"]').type("87654321")
    cy.get('[data-cy="Signup-password-conf"]').type("87654321")

    cy.get('[data-cy="terms-toggle"]').click()

    cy.get('[data-cy="Signup-submit"]').click()

    cy.wait('@signUp').then((res) => {
      cy.get('[data-cy="Success"]')
    })

  })

  it('should sign in an existing user', () => {
    cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
      req.continue((res) => {
        if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
      })
    }).as('login')
    cy.visit('/auth/signin')
    cy.get('[data-cy="signin-tab"]').click({ force: true })

    cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", {force: true})
    cy.get('[data-cy="signin-button-password"]').type("12345678")
    cy.get('[data-cy="signin-button-submit"]').click()
    cy.wait('@login')

    cy.get('[data-cy="libraryLink"]')
  })
})

export { }
