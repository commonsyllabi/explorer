/* eslint-disable */

import { login } from "../support/e2e"


// describe('Browses a user profile', () => {
//     it('should test the search filters on the index page, and browse the user page', () => {
//         cy.visit('/')
//         cy.get('[data-cy="syllabusCard"]').children().should('have.length', 19)
//         cy.wait(500)

//         //-- pagination test is disabled until we get it working again
//         // cy.get('[data-cy="nextPage"').click({ force: true })
//         // cy.get('[data-cy="syllabusCard"]').children().should('have.length', 4)
//         // cy.get('[data-cy="prevPage"]').click({ force: true })

//         cy.get('[data-cy="filtersLanguage"]').select("German", { force: true })
//         cy.get('[data-cy="syllabusCard"]').children().should('have.length', 1)

//         cy.get('[data-cy="filtersReset"').click({ force: true })
//         cy.get('[data-cy="syllabusCard"]').children().should('have.length', 19)

//         cy.contains('Common Syllabi').click({ force: true })

//         cy.get('[data-cy="syllabusCard"]').should('have.length', 19)

//         cy.get('[data-cy="userTabs"]').contains('Collections').click({ force: true })
//     })
// })

describe('Browses its own user profile', () => {
    it('should login and find admin controls on the profile', () => {
        login('test-user')

        cy.visit('/')
        cy.get('[data-cy="libraryLink"]').click()
        cy.contains('Syllabi')
        cy.get('[data-cy="newSyllabusLink"]')
    })
})

export { }