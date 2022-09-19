/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.


let newSyllabusUUID
describe('Create a new syllabus', () => {

    it('Navigates to the home page', () => {
        cy.visit('http://localhost:3000/')

        cy.get('[data-cy="Login"]').click()
    })

    it('Logs in and creates a syllabus', () => {
        cy.intercept('POST', '/syllabi/', (req) => {
            req.continue((res) => {
                console.log('[cypress] created syllabus', res);
                if(res.statusCode == 201){
                    newSyllabusUUID = res.body.uuid
                }                
            })
        }).as('createSyllabus')

        cy.intercept('POST', '/syllabi/*/institutions', (req) => {
            req.continue((res) => {
                if(res.statusCode == 200) console.log('[cypress] created institution', res.body);
                else throw new Error('failed to create institution')
            })
        }).as('createInstitution')

        cy.intercept('POST', '/attachments/*', (req) => {
            req.continue((res) => {
                if(res.statusCode == 201) console.log('[cypress] created attachment',   res.body);
                else throw new Error('failed to create attachment')
                
            })
        }).as('createAttachment')

        cy.contains('Login').click({ force: true })

        cy.get('[data-cy="Login-email"]').type("pierre.depaz@gmail.com")
        cy.get('[data-cy="Login-password"]').type("12345678")

        cy.get('[data-cy="Login-submit"]').click()

        cy.get('[data-cy="Logged user"]')

        cy.contains('+ New Syllabus').click()

        cy.get('[data-cy="courseTitleInput"]').type("Test class 1", {force: true})

        cy.get('[data-cy="courseStatusInput"]').click({force: true})
        cy.get('[data-cy="courseCodeInput"]').type("IMANY-UH-1001", {force: true})
        cy.get('[data-cy="academicLevelInput"]').select('1', {force: true})
        cy.get('[data-cy="courseLanguageInput"]').select('FR', {force: true})
        cy.get('[data-cy="courseDurationInput"]').type('7', {force: true})
        cy.get('[data-cy="courseDescriptionInput"]').type('Lorem ipsum dolores sit descriptio nuncam sed que tantamus', {force: true})

        cy.get('[data-cy="attachment-add"]').click({force: true})
        cy.get('[data-cy="attachment-add"]').click({force: true})
        cy.get('[data-cy="attachment-remove-2"]').click({force: true})

        cy.get('[data-cy="attachment-name-0"]').type('Weblink test', {force: true})
        cy.get('[data-cy="attachment-description-0"]').type('This is optional', {force: true})
        cy.contains('URL').click({force: true})
        cy.get('[data-cy="attachment-url-0"]').type('https://test.enframed.net', {force: true})

        cy.get('[data-cy="attachment-name-1"]').type('File test', {force: true})
        cy.get('[data-cy="attachment-description-1"]').type('This is also optional', {force: true})
        cy.get('[data-cy="attachment-file-1"]').selectFile('cypress/fixtures/test_attachment.txt', {log: true, force: true})

        cy.get('[data-cy="courseSubmitButton"').click()

        cy.wait('@createSyllabus')
        cy.wait('@createInstitution')
        cy.wait('@createAttachment')
    })
})

  describe('It visits the newly created syllabus', () => {
    it('should navigate to the syllabus page', () => {
        if(!newSyllabusUUID) throw new Error(`incorrect newSyllabusUUI: ${newSyllabusUUID}`)
        
        cy.visit(`http://localhost:3000/syllabus/${newSyllabusUUID}`)

        cy.get('h1').contains('Test class 1')
        cy.get('.course-instructors').children().first().contains('Pierre Depaz')
        
        cy.get('.course-description')
        cy.get('.course-resource').should('have.length', 2)
    })
})

export { }