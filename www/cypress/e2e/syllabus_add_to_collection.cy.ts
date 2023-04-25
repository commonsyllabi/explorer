/* eslint-disable */
const newCollectionName = "Fine Collectionitis"

describe('Adds a syllabus to a collections', () => {
    it('should sign in, navigate to a syllabus and add it to an existing collection', () => {
        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(500)
        
        cy.visit("/syllabus/46de6a2b-aacb-4c24-b1e1-6665821f846a")
        cy.get('[data-cy="show-add-collection"]').click()
        cy.get('[data-cy="user-collection"]').should('have.length', 2)
        cy.get('[data-cy="add-to-collection"]').first().click()
        cy.get('[data-cy="close-button"]').click()
    })

    it('should sign in, navigate to a syllabus and remove a syllabus from a collection', () => {
        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(500)
        
        cy.visit("/syllabus/46de6a2b-aacb-4c24-b1e1-6665821f846a")
        cy.get('[data-cy="show-add-collection"]').click()
        cy.get('[data-cy="user-collection"]').should('have.length', 2)
        cy.get('[data-cy="add-to-collection"]').should('have.length', 1)
        cy.get('[data-cy="remove-from-collection"]').should('have.length', 1)
        cy.get('[data-cy="remove-from-collection"]').click()
        cy.wait(500)

        cy.get('[data-cy="show-add-collection"]').click()
        cy.get('[data-cy="user-collection"]').should('have.length', 2)
        cy.get('[data-cy="add-to-collection"]').should('have.length', 2)
    })

    it('should sign in, navigate to a syllabus and add it to a new collection', () => {
        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(500)
        
        cy.visit("/syllabus/46de6a2b-aacb-4c24-b1e1-6665821f846a")
        cy.get('[data-cy="show-add-collection"]').click()
        cy.get('[data-cy="new-collection"]').click()
        cy.get('[data-cy="new-collection-name"]').clear().type(newCollectionName)
        cy.get('[data-cy="create-new-collection"]').click()
    })
})

export {}