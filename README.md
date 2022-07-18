# explorer

Syllabus exploring and sharing platform

## notes

figure out proper has-many/belongs-to relations in bun

- make just the dashboard private (which is just a grouping of user info, syllabi and collections)
- what do we do with dangling resources? if a user deletes their account, do we offer to keep the collection with a ghost account? i think it's fair (we just anonimyze the account)

## questions

### API
- [ ] does creating a syllabus require a user account? does it do it automatically (i.e., taking the associated email with the syllabus, automatically generating a password and sending it via email?)
- [x] do we make resources first-class citizens? aka does a user profile return the set of resources associated with it? __no, but they should all be accessible from regular path etc.

### sessions

- what is the "secret" that is given when creating a cookie store?
- what is the name of the session? "authsession" is the name of the cookie
- how do i form an api responses based on authorization status?, by checking whether or not the given uuid is an owner of an entitiy (this can also be done in sql queries `where id = xxx and user = yyy`)

### todo

- better organize test utils
- think about user input validation/sanitization
- - make sure every handler is binding the input to check for wrong fields
- tests
    - take a look at the kinds of tests which should be in the handlers, and in the models (re: input validation, etc.)
    - deal with fixtures more properly
    - harmonize what is being tested across models (i.e. syll handler is not testing for inexisting, valid uuid)


### tasks

- have a confirmed field on the user model
- -  this led to discovering that the model wasn't properly updating due to `OmitZero()` bug. this led to refactoring of first getting the model, updating the required fields, and then calling update to the database. the question: is it ok to just send the full entity client side?
- - the way this is solved is by figuring out update with omitzero. the trick was to add a `returning("*")` clause at the end of the update operation, and that returns the updated model
- so now i'm updating all the tests for the handlers in order to comply with this new approach
- tests
- - user create/confirmation flow (implement)
- - request recovery
- - recovery without password
- - receovery with password