/* eslint-disable */
describe('Adds a syllabus to a collections', () => {
    let newCollectionName = "Famosa Collecya"
    it('should sign in, navigate to the profile and create a new collection', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click({force: true})
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(1000)

        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="new-collection-button"]').click()
        cy.get('[data-cy="new-collection-name"]').clear().type(newCollectionName)
        cy.get('[data-cy="create-new-collection"]').click({force: true})
        
        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="collectionCard"]').last().contains(newCollectionName)
    })

    it('should sign in, navigate to the profile, select the last collection and delete it', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click({force: true})
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")

        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(1000)

        cy.get('[data-cy="libraryLink"]').click()
        cy.get('[data-cy="collectionsTab"]').click()
        cy.get('[data-cy="collectionCard"] a').first().click()
    })
})