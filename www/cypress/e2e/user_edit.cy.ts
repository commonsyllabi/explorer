/* eslint-disable */

describe('User profile editing', () => {
    const stub = {
        name: "Alexandra Elbakyan",
        bio: "Once upon a time was a librarian in the shadows.",
        education: ['The East', 'The Internet'],
        institutions: ['St. Petersburg University', 'Genesis University'],
        links: ['https://sci.hub', 'https://hub.sci'],
        email: "alexandra@elbakyan.net",
        original_email: "pierre.depaz@gmail.com"
    }

    it('edits the user profile', () => {
        cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
            })
        }).as('login')

        cy.intercept('PATCH', '/users/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to edit user')
                }
            })
        }).as('editUser')

        cy.intercept('POST', '/users/*/institutions', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to add institution')
                }
            })
        }).as('addInstitution')

        cy.intercept('DELETE', '/users/*/institutions/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to delete institution')
                }
            })
        }).as('deleteInstitution')

        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait('@login')

        cy.get('[data-cy="libraryLink"]').click()

        cy.get('[data-cy="user-name"] button').click()
        cy.get('[data-cy="user-name"] input').clear().type(stub.name)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-name"]').contains(stub.name)

        cy.get('[data-cy="user-bio"] button').click()
        cy.get('[data-cy="user-bio"] textarea').clear().type(stub.bio)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-bio"]').contains(stub.bio)

        cy.get('[data-cy="user-links"] button').click()
        cy.get('[data-cy="user-links"] input').first().clear().type(stub.links[0])
        cy.get('[data-cy="add-item-button"]').click()
        cy.get('[data-cy="user-links"] input').last().clear().type(stub.links[1])
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-link"]').first().contains(stub.links[0])
        cy.get('[data-cy="user-link"]').last().contains(stub.links[1])

        cy.get('[data-cy="user-education"] button').click()
        cy.get('[data-cy="user-education"] input').first().clear().type(stub.education[0])
        cy.get('[data-cy="add-item-button"]').click()
        cy.get('[data-cy="user-education"] input').last().clear().type(stub.education[1])
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-education-item"]').first().contains(stub.education[0])
        cy.get('[data-cy="user-education-item"]').last().contains(stub.education[1])

        cy.get('[data-cy="user-institutions"] button').click()
        cy.get('[data-cy="add-item-button"]').click()
        cy.get('[data-cy="user-institutions"] input').first().clear().type(stub.institutions[0])
        cy.get('[data-cy="add-item-button"]').click()
        cy.get('[data-cy="user-institutions"] input').last().clear().type(stub.institutions[1])
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@addInstitution')
        cy.get('[data-cy="user-institutions-item"]').first().contains(stub.institutions[0])
        cy.get('[data-cy="user-institutions-item"]').last().contains(stub.institutions[1])


        cy.get('[data-cy="user-email"] button').click()
        cy.get('[data-cy="user-email"] input').first().clear().type(stub.email)
        cy.get('[data-cy="user-email"] input').last().clear().type(stub.email)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-email"]').contains(stub.email)

        cy.get('[data-cy="user-email"] button').click()
        cy.get('[data-cy="user-email"] input').first().clear().type(stub.original_email)
        cy.get('[data-cy="user-email"] input').last().clear().type(stub.original_email)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editUser')
        cy.get('[data-cy="user-email"]').contains(stub.original_email)


        //-- finally delete the institutions
        cy.get('[data-cy="user-institutions-item"]').should('have.length', 2)
        cy.get('[data-cy="user-institutions"] button').click()
        cy.get('[data-cy="remove-item-button"]').first().click()
        cy.wait(500)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@deleteInstitution')
        cy.wait('@addInstitution')
        cy.get('[data-cy="user-institutions-item"]').should('have.length', 1)
    })
})

export { }