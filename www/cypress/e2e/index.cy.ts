/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.
// If you're using ESLint on your project, we recommend installing the ESLint Cypress plugin instead:
// https://github.com/cypress-io/eslint-plugin-cypress

describe('Navigation', () => {
  it('should navigate to the home page', () => {
    // Start from the index page
    cy.visit('http://localhost:3000/')

    cy.get('.navbar-brand').contains('Syllabi Explorer')

    cy.get('.card').should('have.length', 4)
  })
})

describe('Filtering', () => {
  it('should have all filters clickable', () => {
    cy.visit('http://localhost:3000/')

    cy.get('#dropdown-level').click()
    cy.get('#dropdown-semester').click()
    cy.get('#dropdown-field').click()
    cy.get('#dropdown-language').click()
  })
})

export { }
