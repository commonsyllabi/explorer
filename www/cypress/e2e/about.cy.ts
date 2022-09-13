/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.

describe('Navigation', () => {
    it('should navigate to the about page', () => {
        cy.visit('http://localhost:3000/about')

        cy.get('#aboutLinks').children().should('have.length', 3)
    })
})