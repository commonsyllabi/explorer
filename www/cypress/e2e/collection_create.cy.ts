/* eslint-disable */
describe('Adds a syllabus to a collections', () => {
    let newCollectionName = "Famosa Collecya"

    it('should sign in, navigate to a syllabus and add it to a collection', () => {
        cy.intercept('POST', '/api/auth/callback/credentials?', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) throw new Error(`Error logging the user in ${res.statusMessage}`)
            })
        }).as('login')

        cy.intercept('POST', '/collections/*/syllabi', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to add to collection')
                }
            })
        }).as('addToCollection')

        cy.intercept('DELETE', '/collections/*/syllabi/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to add to collection')
                }
            })
        }).as('removeFromCollection')

        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait('@login')

        cy.visit('/')
        cy.get('[data-cy="syllabus-card-title"]').first().click()

        cy.get('[data-cy="show-add-collection"]').click()
        cy.get('[data-cy="add-to-collection"]').first().click()
        cy.wait("@addToCollection")
        cy.get('[data-cy="user-collection"] a').first().click()

        cy.get('[data-cy="collection-item"]').should('have.length', 1)
        cy.get('[data-cy="remove-from-collection"]').first().click()
        cy.wait("@removeFromCollection")
        cy.get('[data-cy="no-collection-items"]')
    })

    it('should sign in, navigate to the profile and create a new collection', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(1000)

        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="new-collection-button"]').click()
        cy.get('[data-cy="new-collection-name"]').clear().type(newCollectionName)
        cy.get('[data-cy="create-new-collection"]').click({ force: true })

        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="collectionCard"]').last().contains(newCollectionName)
    })

    it('should sign in, navigate to the profile, select the last collection, change its name and delete it', () => {
        cy.intercept('PATCH', '/collections/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to edit institution')
                }
            })
        }).as('editCollection')

        cy.intercept('DELETE', '/collections/*', (req) => {
            req.continue((res) => {
                if (res.statusCode != 200) {
                    throw new Error('[cypress] failed to delete institution')
                }
            })
        }).as('deleteCollection')

        const _name = `${newCollectionName} (edited)`
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(1000)

        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="collectionCard"] a').first().click()

        cy.get('[data-cy="edit-button"]').click()
        cy.get('[data-cy="edit-collection-name"]').clear().type(_name)
        cy.get('[data-cy="save-button"]').click()
        cy.wait('@editCollection')

        cy.get('[data-cy="collection-name"]').contains(_name)

        cy.get('[data-cy="delete-button"]').click()
        cy.wait('@deleteCollection')
    })
})