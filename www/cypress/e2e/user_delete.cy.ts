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

        cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
            })
        }).as('login')

        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click()
        cy.get('[data-cy="signin-button-email"]').type("test@delete.com")
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait('@login')

        cy.visit('/')
        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="delete-user"]').click()
        cy.wait('@deleteUser')
    })
})

export {}