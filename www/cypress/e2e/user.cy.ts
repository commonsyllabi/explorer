/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.

describe('Navigation', () => {
    it('should navigate to the user page', () => {
        cy.visit('http://localhost:3000/user/e7b74bcd-c864-41ee-b5a7-d3031f76c8a8')
        cy.get('#user-description').get('h2').contains('Justyna Poplawska')
        cy.get("#syllabi").children().children().should('have.length', 2) // this double-nesting of children() seems to show this is not the most satisfying structure?

        cy.get('#user-syllabi-collections-tabs-tab-collections').click({force: true})
        cy.get('#collections').children().children().should('have.length', 1)
    })
})

export {}