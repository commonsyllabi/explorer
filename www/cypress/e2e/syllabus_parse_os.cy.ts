/* eslint-disable */
import { login } from "../support/e2e"

describe('Browses its own user profile', () => {
    it('should login and find admin controls on the profile', () => {
        cy.intercept('POST', '/syllabi/parse', (req) => {
            req.continue((res) => {
                if (res.statusCode == 200) console.log('[cypress] parsed syllabus', res.body);
                else throw new Error('[cypress] failed to parse syllabus')
            })            
        }).as('parseSyllabus')
        login('test-user')

        cy.visit('/new-syllabus')
        cy.get('[data-cy="opensyllabus-file-input"]').selectFile(`cypress/fixtures/osp.docx`, { log: true, force: true })
        cy.wait('@parseSyllabus')
        cy.get('[data-cy="parsed-field"]').should('have.length', 10)
        cy.get('[data-cy="courseTitleInput"]').should('have.value', "What is Law?")
    })
})

export { }