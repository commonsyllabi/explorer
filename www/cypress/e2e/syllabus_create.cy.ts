/* eslint-disable */
// Disable ESLint to prevent failing linting inside the Next.js repo.

import { login } from "../support/e2e"

let stub = {
    title: "Intro to studies",
    public: true,
    institution: {
        name: "Khartum Jamiyat",
        country: "Sudan",
        url: "https://khartum.jamiyat",
        term: "Fall",
        year: "2002"
    },
    academic_fields: ['01 - Education', '011 - Education', '0111 - Education science'],
    academic_level: {
        code: 'Master',
        literal: 'Master\'s'
    },
    language: {
        code: 'fr',
        literal: 'French'
    },
    duration: 7,
    tags: ['intro', 'education', 'development'],
    description: 'This is a description of a non-existing course. I made ChatGPT write a description, but it was too cringe.',
    learning_outcomes: ['You will learn to learn', 'You will learn not to use ChatGPT'],
    topic_outlines: ['Education sciences', 'Non-algorithmic sciences'],
    readings: ['Culture Numérique, Dominique Cardon, Presses de Sciences Po, 2019.', 'The Ignorant Schoolmaster: Five Lessons in Intellectual Emancipation. By JACQUES RANCIÈRE. Translated with an introduction by KRISTIN ROSS. Stanford University Press, 1991.148pp.'],
    assignments: ['Learn something new and unexpected', 'Teach something new and unexpected'],
    grading_rubric: 'Everybody passes as long as they show up',
    other: "This course has involved me in teaching as well as in learning. The best classes happen when I do the least.",
    attachments: [
        {
            name: "yoo.ooo",
            url: "http://yoo.ooo/",
            description: "Here is an example of one of the greatest webpages out there. We shall all strive to attain this level of purity."
        },
        {
            name: 'Text File',
            description: 'One could argue that all is, ultimately, a text file. This file here is a starting point.',
            url: 'test_attachment.txt'
        }
    ]
}

let newSyllabusUUID: String
describe('Create a new syllabus', () => {

    it('navigates to the home page', () => {
        cy.visit('/')
        cy.get('[data-cy="syllabusCard"]').should('have.length.greaterThan', 1)
        cy.get('[data-cy="signin-button"]').click()
    })

    it('logs in and creates a syllabus', () => {
        cy.intercept('POST', '/syllabi/', (req) => {
            req.continue((res) => {
                console.log('[cypress] created syllabus', res);
                if (res.statusCode == 201) {
                    newSyllabusUUID = res.body.uuid
                }
            })
        }).as('createSyllabus')

        cy.intercept('POST', '/syllabi/*/institutions', (req) => {
            req.continue((res) => {
                if (res.statusCode == 200) console.log('[cypress] created institution', res.body);
                else throw new Error('[cypress] failed to create institution')
            })
        }).as('createInstitution')

        cy.intercept('POST', '/attachments/*', (req) => {
            req.continue((res) => {
                if (res.statusCode == 201) console.log('[cypress] created attachment', res.body);
                else throw new Error('[cypress] failed to create attachment')

            })
        }).as('createAttachment')

        login('test-user')
        cy.visit('/')
        cy.get('[data-cy="newSyllabusLink"]').click()
        cy.wait(500)

        //-- BEGIN SYLLABUS INPUT

        cy.get('[data-cy="courseTitleInput"]').type(stub.title, { force: true })

        //-- click twice to check that toggle works and make sure it is set to listed
        cy.get('[data-cy="courseStatusInput"]').click({ force: true })
        cy.get('[data-cy="courseStatusLabel"]').contains("Private")
        cy.get('[data-cy="courseStatusInput"]').click({ force: true })
        cy.get('[data-cy="courseStatusLabel"]').contains("Public")

        //-- add institution
        cy.get('[data-cy="institutionNameInput"]').type(stub.institution.name, { force: true })
        cy.get('[data-cy="institutionCountryInput"]').select(stub.institution.country, { force: true })
        cy.get('[data-cy="institutionYearInput"]').type(stub.institution.year, { force: true })
        cy.get('[data-cy="institutionUrlInput"]').type(stub.institution.url, { force: true })
        cy.get('[data-cy="institutionTermInput"]').type(stub.institution.term, { force: true })


        //-- add academic fields and check academic fields
        cy.get('#academic_field_broad').select(stub.academic_fields[0], { force: true })
        cy.get('#academic_field_narrow').select(stub.academic_fields[1], { force: true })
        cy.get('#academic_field_detailed').select(stub.academic_fields[2], { force: true })
        cy.get('[data-cy="academicLevelInput"]').select(stub.academic_level.code, { force: true })
        cy.get('[data-cy="courseLanguageInput"]').select(stub.language.code, { force: true })
        cy.get('[data-cy="courseDurationInput"]').type(stub.duration.toString(), { force: true })

        cy.get('[data-cy="courseTagsInput"]').type(stub.tags.join(", "), { force: true })

        cy.get('[data-cy="courseDescriptionInput"]').type(stub.description, { force: true })

        cy.get('[data-cy="learning_outcomes-add"]').click({ force: true })
        cy.get('[data-cy="learning_outcomes-item"]').last().type(stub.learning_outcomes[0], { force: true })
        cy.get('[data-cy="learning_outcomes-add"]').click({ force: true })
        cy.get('[data-cy="learning_outcomes-item"]').last().type(stub.learning_outcomes[1], { force: true })

        cy.get('[data-cy="topic_outlines-add"]').click({ force: true })
        cy.get('[data-cy="topic_outlines-item"]').last().type(stub.topic_outlines[0], { force: true })
        cy.get('[data-cy="topic_outlines-add"]').click({ force: true })
        cy.get('[data-cy="topic_outlines-item"]').last().type(stub.topic_outlines[1], { force: true })

        cy.get('[data-cy="readings-add"]').click({ force: true })
        cy.get('[data-cy="readings-item"]').last().type(stub.readings[0], { force: true })
        cy.get('[data-cy="readings-add"]').click({ force: true })
        cy.get('[data-cy="readings-item"]').last().type(stub.readings[1], { force: true })

        cy.get('[data-cy="assignments-add"]').click({ force: true })
        cy.get('[data-cy="assignments-item"]').last().type(stub.assignments[0], { force: true })
        cy.get('[data-cy="assignments-add"]').click({ force: true })
        cy.get('[data-cy="assignments-item"]').last().type(stub.assignments[1], { force: true })

        cy.get('[data-cy="courseGradingRubric"]').type(stub.grading_rubric, { force: true })

        cy.get('[data-cy="courseOther"]').type(stub.other, { force: true })

        //-- add url attachment
        cy.get('[data-cy="new-attachment-name"]').type(stub.attachments[0].name, { force: true })
        cy.get('[data-cy="new-attachment-description"]').type(stub.attachments[0].description, { force: true })
        cy.get('[data-cy="new-attachment-type-url"]').click({ force: true })
        cy.get('[data-cy="new-attachment-url"]').type(stub.attachments[0].url, { force: true })
        cy.get('[data-cy="attachment-add"]').click({ force: true })

        //-- add file attachment
        cy.get('[data-cy="new-attachment-name"]').type(stub.attachments[1].name, { force: true })
        cy.get('[data-cy="new-attachment-description"]').type(stub.attachments[1].description, { force: true })
        cy.get('[data-cy="new-attachment-type-file"]').click({ force: true })
        cy.get('[data-cy="new-attachment-file"]').selectFile(`cypress/fixtures/${stub.attachments[1].url}`, { log: true, force: true })
        cy.get('[data-cy="attachment-add"]').click({ force: true })

        cy.wait(200)

        cy.get('[data-cy="courseSubmitButton"').click()

        cy.wait('@createSyllabus')
        cy.wait('@createInstitution')
        cy.wait('@createAttachment')
    })

    it('navigates to the syllabus page and checks all fields', () => {
        if (!newSyllabusUUID) throw new Error(`incorrect newSyllabusUUID: ${newSyllabusUUID}`)

        cy.visit(`/syllabus/${newSyllabusUUID}`)

        cy.wait(2000)

        cy.get('[data-cy="course-title"]').contains(stub.title)
        cy.get('[data-cy="courseInstructors"').first().contains('Pierre Depaz')
        cy.get('[data-cy="course-tag"]').should('have.length', stub.tags.length)

        
        cy.get('[data-cy="course-language"]').contains(stub.language.literal)
        cy.get('[data-cy="course-level"]').contains(stub.academic_level.literal)
        cy.get('[data-cy="course-fields"]').children().should('have.length', 3)
        
        cy.get('[data-cy="course-institution-name"]').contains(stub.institution.name)
        cy.get('[data-cy="course-institution-country"]').contains(stub.institution.country)
        cy.get('[data-cy="course-institution-term"]').contains(stub.institution.term)
        cy.get('[data-cy="course-institution-year"]').contains(stub.institution.year)

        cy.get('[data-cy="course-description"]').contains(stub.description)

        // AssertionError: Timed out retrying after 4000ms: Expected to find content: 'You will learn to learn' within the element: <h2.__className_615156.font-bold.text-lg> but never did. -> THE ISSUE IS THAT THE header of the

        cy.get('[data-cy="course-learning-outcomes-item"]').should('have.length', stub.learning_outcomes.length)
        cy.get('[data-cy="course-learning-outcomes-item"]').first().contains(stub.learning_outcomes[0])
        cy.get('[data-cy="course-learning-outcomes-item"]').last().contains(stub.learning_outcomes[1])

        cy.get('[data-cy="course-topic-outlines-item"]').should('have.length', stub.topic_outlines.length)
        cy.get('[data-cy="course-topic-outlines-item"]').first().contains(stub.topic_outlines[0])
        cy.get('[data-cy="course-topic-outlines-item"]').last().contains(stub.topic_outlines[1])

        cy.get('[data-cy="course-readings-item"]').should('have.length', stub.readings.length)
        cy.get('[data-cy="course-readings-item"]').first().contains(stub.readings[0])
        cy.get('[data-cy="course-readings-item"]').last().contains(stub.readings[1])
        cy.get('[data-cy="course-assignments-item"]').should('have.length', stub.learning_outcomes.length)
        cy.get('[data-cy="course-assignments-item"]').first().contains(stub.assignments[0])
        cy.get('[data-cy="course-assignments-item"]').last().contains(stub.assignments[1])

        cy.get('[data-cy="course-grading-rubric"]').contains(stub.grading_rubric)
        cy.get('[data-cy="course-other"]').contains(stub.other)
        cy.get('[data-cy="course-attachment"]').should('have.length', 2)
    })

    it('navigates to the syllabus page page and deletes it', () => {
        login('test-user')

        if (!newSyllabusUUID) throw new Error(`incorrect newSyllabusUUID: ${newSyllabusUUID}`)

        cy.visit(`/syllabus/${newSyllabusUUID}`)
        cy.wait(2000)

        cy.get('[data-cy="delete-syllabus"]').click()
        cy.get('[data-cy="delete-modal"]')
        cy.get('[data-cy="confirm-delete-syllabus"]').click()
    })
})

export { }