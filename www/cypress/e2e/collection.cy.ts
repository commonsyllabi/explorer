/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.

describe('Navigation', () => {
    it('should navigate to the collection page', () => {
        cy.visit('http://localhost:3000/collection/b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a9')
        cy.get('h1').contains('Good Stuff')
        cy.get('.card').should('have.length', 1)
    })
})