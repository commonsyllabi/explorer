# explorer

Syllabus exploring and sharing platform

## notes

- for migrations: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## questions

### attachments

- how does one handle the case where there are both file and url?
- properly handle panic of attachments creation in syllabus

### todo

- should move the logic of parsing uuid from handlers to the authenticate function (i.e. it returns directly a uuid, not a string)
- think about user input validation/sanitization
- tests
    - take a look at the kinds of tests which should be in the handlers, and in the models (re: input validation, etc.)
    - harmonize what is being tested across models (i.e. syll handler is not testing for inexisting, valid uuid)
- decide whether or not institution should be its own model (probably yes, but the "position field" seems a bit tricky)