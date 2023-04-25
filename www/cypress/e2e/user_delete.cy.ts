/* eslint-disable */

describe('User profile deletion', () => {
    it('deletes the user profile', () => {
        cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
            })
        }).as('login')
        
        cy.intercept('DELETE', '/users/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to delete user')
                }
            })
        }).as('deleteUser')

        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait('@login')

        cy.get('[data-cy="libraryLink"]').click()

        cy.get('[data-cy="delete-user"]').click()
        cy.wait('@deleteUser')
    })
})