/* eslint-disable */

import { login } from "../support/e2e"

describe('User profile deletion', () => {
    it('deletes the user profile', () => {
        cy.intercept('DELETE', '/users/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to delete user')
                }
            })
        }).as('deleteUser')

        login('test-user')

        cy.visit('/')
        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="delete-user"]').click()
        cy.wait('@deleteUser')
    })
})

export {}