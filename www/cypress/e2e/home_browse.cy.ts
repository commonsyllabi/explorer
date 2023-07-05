/* eslint-disable */

describe('Create a new syllabus', () => {

    it('navigates to the home page', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length', 1)
        cy.get('[data-cy="userCard"]').should('have.length', 1)
        cy.get('[data-cy="collectionCard"]').should('have.length', 1)
    })
})

export { }