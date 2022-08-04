# explorer

Syllabus exploring and sharing platform

## notes

- for migrations: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## questions

### sessions

- what is the "secret" that is given when creating a cookie store?
- what is the name of the session? "cosyl_auth" is the name of the cookie
- how do i form an api response based on authorization status?, by checking whether or not the given uuid is an owner of an entitiy (this can also be done in sql queries `where id = xxx and user = yyy`)

### attachments

- is it ok to have both attachment and file as an input source? then we pick which one is not empty.
- how does one handle the case where there are both file and url?
- properly handle panic of attachments creation in syllabus

### todo

- better organize test utils
- think about user input validation/sanitization
- tests
    - take a look at the kinds of tests which should be in the handlers, and in the models (re: input validation, etc.)
    - harmonize what is being tested across models (i.e. syll handler is not testing for inexisting, valid uuid)
- decide whether or not institution should be its own model (probably yes, but the "position field" seems a bit tricky)