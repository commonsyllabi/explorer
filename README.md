# explorer

Syllabus exploring and sharing platform

## notes

figure out proper has-many/belongs-to relations in bun

- add handlers to return everything based on querying a syllabus
- - right now the user isn't getting picked up, and the collections either: the solution might be to have more complex SQL queries (get the ID of the associated syllabus, the fetch the syllabus, etc.)
- make just the dashboard private (grouping of user info, syllabi and collections)

## questions

### API
- [ ] does creating a syllabus require a user account? does it do it automatically (i.e., taking the associated email with the syllabus, automatically generating a password and sending it via email?)
- [ ] what is an appropriate level of nestedness when returning things from an API?
- [ ] do we make resources first-class citizens? aka does a user profile return the set of resources associated with it?

### sessions

- what is the "secret" that is given when creating a cookie store?
- what is the name of the session? "authsession" is the name of the cookie
- the key should be the uuid of the user, and the value the password. the email is just used for initial retrieval
- how do i prevent access to certain pages?
- how do i form an api responses based on auth status?
- not sure what is the difference between 	session.Set("user", "") and session.Delete("user")

### todo

- better organize test utils