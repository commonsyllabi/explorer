// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// For instance, you could define a `commands.ts` files where you overwrite cypress's command with your own.
// import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

export const login = ((name: string) => {
    cy.session(name, () => {
        cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
            })
        }).as('login')

        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click()
        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com")
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait('@login')
    })
})

export {}