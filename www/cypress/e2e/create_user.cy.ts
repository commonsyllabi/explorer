/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Create a new user', () => {
  it('should navigate to the home page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')

    cy.get('#login-btn').contains('Login')
    cy.get('#login-btn').click()
  })

  it('should enter all user details', () => {
    cy.get('#dropdown-level').click()
    cy.get('#dropdown-semester').click()
    cy.get('#dropdown-field').click()
    cy.get('#dropdown-language').click()
  })
})

export { }
