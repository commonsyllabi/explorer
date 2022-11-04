/* eslint-disable */

describe('Browses a user profile', () => {
    it('should navigate to the home page, browse some syllabi, and find a user', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabiCards"]').children().should('have.length', 15)
        cy.wait(2000)
        cy.get('[data-cy="nextPage"').click({ force: true })

        cy.get('[data-cy="syllabiCards"]').children().should('have.length', 4)
        cy.get('[data-cy="prevPage"]').click({ force: true })

        cy.get('[data-cy="filtersLanguage"]').select("German", { force: true })
        cy.get('[data-cy="syllabiCards"]').children().should('have.length', 1)

        cy.get('[data-cy="filtersReset"').click({ force: true })
        cy.get('[data-cy="syllabiCards"]').children().should('have.length', 15)

        cy.contains('Common Syllabi').click({ force: true })
    })

    it('should browse the user page', () => {
        cy.get('[data-cy="userSyllabiListing"]').children().should('have.length', 18)

        cy.get('[data-cy="userTabs"]').contains('Collections').click({ force: true })
    })
})

describe('Browses its own user profile', () => {
    it('should login and find admin controls on the profile', () => {
        cy.intercept('GET', '/auth/signin', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`[cypress] error logging inthe user (${res.statusMessage})`)
            })
        }).as('login')

        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="Login"]').click()

        cy.get('[data-cy="Login"]').click()

        cy.get('[data-cy="Login-email"]').type("pierre.depaz@gmail.com")
        cy.get('[data-cy="Login-password"]').type("12345678")

        cy.get('[data-cy="Login-submit"]').click()
        cy.wait('@login')
        cy.wait(1000)

        cy.get('[data-cy="loggedUser"]').click()
        cy.get('[data-cy="accountLink"]').click()
        cy.contains('Syllabi by you')
        cy.get('[data-cy="newSyllabusLink"]')
    })
})

export { }