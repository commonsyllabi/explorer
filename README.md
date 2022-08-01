# explorer

Syllabus exploring and sharing platform

## notes

figure out proper has-many/belongs-to relations in bun

- make just the dashboard private (which is just a grouping of user info, syllabi and collections)
- what do we do with dangling attachments? if a user deletes their account, do we offer to keep the collection with a ghost account? i think it's fair (we just anonimyze the account)
- for migrations: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## questions

### API
- [ ] does creating a syllabus require a user account? does it do it automatically (i.e., taking the associated email with the syllabus, automatically generating a password and sending it via email?)
- [x] do we make attachments first-class citizens? aka does a user profile return the set of attachments associated with it? __no, but they should all be accessible from regular path etc.

### sessions

- what is the "secret" that is given when creating a cookie store?
- what is the name of the session? "authsession" is the name of the cookie
- how do i form an api responses based on authorization status?, by checking whether or not the given uuid is an owner of an entitiy (this can also be done in sql queries `where id = xxx and user = yyy`)

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