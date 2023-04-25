/* eslint-disable */

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
        code: 'FR',
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

describe('Edits a syllabus body', () => {
    it('should sign in, navigate to the profile and select a syllabus', () => {
        cy.visit('/')
        cy.get('[data-cy="signin-button"]').click({ force: true })
        cy.wait(500)

        cy.get('[data-cy="signin-button-email"]').type("pierre.depaz@gmail.com", { force: true })
        cy.get('[data-cy="signin-button-password"]').type("12345678")
        cy.get('[data-cy="signin-button-submit"]').click()
        cy.wait(500)

        cy.get('[data-cy="libraryLink"]').click({force: true})
        cy.get('[data-cy="userTabs"]')

        cy.get('[data-cy="syllabus-card-title"]').contains("Digital Culture").click()

        //-- editing institutions
        cy.get('[data-cy="institution-meta"] button').click()
        cy.get('[data-cy="edit-institution-name"]').clear().type(stub.institution.name)
        cy.get('[data-cy="edit-institution-country"]').select(stub.institution.country)
        cy.get('[data-cy="edit-institution-term"]').clear().type(stub.institution.term)
        cy.get('[data-cy="edit-institution-year"]').clear().type(stub.institution.year)
        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-institution-name"]').contains(stub.institution.name)
        cy.get('[data-cy="course-institution-country"]').contains(stub.institution.country)
        cy.get('[data-cy="course-institution-term"]').contains(stub.institution.term)
        cy.get('[data-cy="course-institution-year"]').contains(stub.institution.year)

        //-- editing meta
        cy.get('[data-cy="syllabus-meta"] button').click()
        cy.get('[data-cy="courseLanguageInput"]').select(stub.language.code)
        cy.get('[data-cy="academicLevelInput"]').select(stub.academic_level.code)
        cy.get('[data-cy="academic-fields-broad"]').select(stub.academic_fields[0])
        cy.get('[data-cy="academic-fields-narrow"]').select(stub.academic_fields[1])
        cy.get('[data-cy="academic-fields-detailed"]').select(stub.academic_fields[2])

        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-language"]').contains(stub.language.literal)
        cy.get('[data-cy="course-level"]').contains(stub.academic_level.literal)
        cy.get('[data-cy="course-fields"]').children().first()
            .contains("Basic")
            .next().contains(stub.academic_fields[1].split(" ")[2])
            .next().contains(stub.academic_fields[2].split(" ")[2])

        //-- editing body
        cy.get('[data-cy="course-title"] button').click()
        cy.get('[data-cy="edit-course-title"]').clear().type(stub.title)
        cy.get('[data-cy="save-button"]').click()
        cy.get('[data-cy="course-title"]').contains(stub.title)

        cy.get('[data-cy="course-tags"] button').last().click()
        cy.get('[data-cy="edit-course-tags"]').clear().type(stub.tags.join(", "))
        cy.get('[data-cy="save-button"]').click()
        cy.get('[data-cy="course-tags"]').children()
            .first().contains(stub.tags[0]).parent()
            .next().contains(stub.tags[1]).parent()
            .next().contains(stub.tags[2])

        cy.get('[data-cy="course-description"] button').click()
        cy.get('[data-cy="edit-course-description"]').clear().type(stub.description)
        cy.get('[data-cy="save-button"]').click()
        cy.get('[data-cy="course-description"]').contains(stub.description)

        cy.get('[data-cy="course-learning-outcomes"] button').click()
        cy.get('[data-cy="edit-course-learning-outcomes"] input').first().clear().type(stub.learning_outcomes[0])
        cy.get('[data-cy="add-new-button"]').click()
        cy.get('[data-cy="edit-course-learning-outcomes"] input').last().clear().type(stub.learning_outcomes[1])
        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-learning-outcomes"] li')
            .first().contains(stub.learning_outcomes[0])
            .parent().last().contains(stub.learning_outcomes[1])

        cy.get('[data-cy="course-readings"] button').click()
        cy.get('[data-cy="edit-course-readings"] input').first().clear().type(stub.readings[0])
        cy.get('[data-cy="add-new-button"]').click()
        cy.get('[data-cy="edit-course-readings"] input').last().clear().type(stub.readings[1])
        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-readings"] li')
            .first().contains(stub.readings[0])
            .parent().last().contains(stub.readings[1])

        cy.get('[data-cy="course-topic-outlines"] button').click()
        cy.get('[data-cy="edit-course-topic-outlines"] input').first().clear().type(stub.topic_outlines[0])
        cy.get('[data-cy="add-new-button"]').click()
        cy.get('[data-cy="edit-course-topic-outlines"] input').last().clear().type(stub.topic_outlines[1])
        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-topic-outlines"] li')
            .first().contains(stub.topic_outlines[0])
            .parent().last().contains(stub.topic_outlines[1])

        cy.get('[data-cy="course-assignments"] button').click()
        cy.get('[data-cy="edit-course-assignments"] input').first().clear().type(stub.assignments[0])
        cy.get('[data-cy="add-new-button"]').click()
        cy.get('[data-cy="edit-course-assignments"] input').last().clear().type(stub.assignments[1])
        cy.get('[data-cy="save-button"]').click()

        cy.get('[data-cy="course-assignments"] li')
            .first().contains(stub.assignments[0])
            .parent().last().contains(stub.assignments[1])


        cy.get('[data-cy="course-other"] button').click()
        cy.get('[data-cy="edit-course-other"]').clear().type(stub.other)
        cy.get('[data-cy="save-button"]').click()
        cy.get('[data-cy="course-other"]').contains(stub.other)


        cy.get('[data-cy="course-grading-rubric"] button').click()
        cy.get('[data-cy="edit-course-grading-rubric"]').clear().type(stub.grading_rubric)
        cy.get('[data-cy="save-button"]').click()
        cy.get('[data-cy="course-grading-rubric"]').contains(stub.grading_rubric)

        //-- edit attachment
        cy.get('[data-cy="course-attachment"] button').click()
        cy.get('[data-cy="course-attachment-button-cancel"]').click()

        cy.get('[data-cy="course-attachment"] button').click()
        cy.get('[data-cy="course-attachment-button-edit"]').click()

        cy.get('[data-cy="edit-attachment-name"]').clear().type(stub.attachments[0].name)
        cy.get('[data-cy="edit-attachment-description"]').clear().type(stub.attachments[0].description)
        cy.get('[data-cy="edit-attachment-url"]').clear().type(stub.attachments[0].url)
        cy.get('[data-cy="button-save"]').click()

        //-- add attachment
        cy.get('[data-cy="new-attachment-name"]').clear().type(stub.attachments[1].name)
        cy.get('[data-cy="new-attachment-description"]').clear().type(stub.attachments[1].description)
        cy.get('[data-cy="new-attachment-file"]').selectFile(`cypress/fixtures/${stub.attachments[1].url}`, { log: true, force: true })
        cy.get('[data-cy="attachment-add"]').click()
        cy.wait(500)

        //-- todo: check that the created syllabus has the proper fields
        cy.get('[data-cy="course-attachment"]').should('have.length', 2)

        //-- delete attachment
        cy.get('[data-cy="course-attachment"] button').last().click()
        cy.get('[data-cy="course-attachment-button-delete"]').click()
    })
})

export {}