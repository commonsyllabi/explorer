/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.

describe('Navigation', () => {
    it('should navigate to the syllabus page', () => {
        cy.visit('http://localhost:3000/syllabus/46de6a2b-aacb-4c24-b1e1-3495821f846a')

        cy.get('h1').contains('Ungewohnt')
        cy.get('.course-instructors').children().first().contains('Justyna Poplawska')
        cy.get('.course-tags').children().should('have.length', 3)
        cy.get('.course-description')
        cy.get('.course-resource').should('have.length', 3)
    })
})

export {}