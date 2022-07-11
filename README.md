# explorer

Syllabus exploring and sharing platform

## notes

figure out proper has-many/belongs-to relations in bun

- add handlers to return everything based on querying a syllabus
- - right now the user isn't getting picked up, and the collections either: the solution might be to have more complex SQL queries (get the ID of the associated syllabus, the fetch the syllabus, etc.)

## questions

- [ ] does creating a syllabus require a user account? does it do it automatically (i.e., taking the associated email with the syllabus, automatically generating a password and sending it via email?)
- [ ] what is an appropriate level of nestedness when returning things from an API?
- [ ] do we make resources first-class citizens? aka does a user profile return the set of resources associated with it?