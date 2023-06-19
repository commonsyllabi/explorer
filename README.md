# Cosyll

 [Cosyll](https://cosyll.org) is a platform on which educators can publish and browse syllabi.

## Resources

- [Common Syllabi](https://common-syllabi.org) umbrella project.
- [API Reference](https://commonsyllabi.stoplight.io/)
- [CommonCartridge Go Package](https://pkg.go.dev/search?q=github.com%2Fcommonsyllabi%2Fcommoncartridge)

## Running

The API is a Go application (`go 1.18`), with a Postgresql backend (`14.5`). You can run it in a Docker container, requiring `Docker 20.10^`.

To run it, use the Makefile:

```Makefile
make build
make docker-run
```

The front-end is a Next.JS application. To install requirements and serve it:

```bash
cd www/
npm run install
npm run dev
```

## Testing

For the API:

```Makefile
make docker-test
```

For the front-end, we use Cypress:

In separate terminal sessions, run:

```bash
make docker-run
```

```bash
cd www/
yarn dev
```

```bash
cd www/
yarn cypress:headless
```

## Environment

The `.env` file contains the information required for deployment.

| variable | value |
|----------|-------|
| PORT | The port on which the backend runs. |
| DB_USER | The username to connect to the database with |
| DB_PASSWORD | The password for the database user |
| DB_HOST | The location of the database |
| DB_PORT | The port of the database |
| DB_NAME | The name of the database to connect to. |
| API_MODE | The mode in which to run the API (`test`, `debug`, `production`)
| RUN_FIXTURES | Whether or not to run the fixtures located in `api/models/fixtures` (`true`, `false`) |
| FIXTURES_PATH | Which fixtures file to load from `api/models/fixtures` (`full.yml`, `test.yml`) |

There are also two secrets that can be provided, in a `.secrets` file.

| variable | value |
|----------|-------|
| MAILGUN_API | The key to connect to Mailgun, in order to send automated emails. |
| ADMIN_KEY | A valid user UUID which bypasses authentication checks, by providing it as a URL `token` query parameter (e.g. `https://api.common-syllabi.org/syllabi/?token=ADMIN_KEY`) |
| OPENSYLLABUS_PARSER_API_TOKEN | To enable OS parsing on the New Syllabus page |
| SPACES_ACCESS_KEY | To enable blob storage |
| SPACES_SECRET_KEY | To enable blob storage |
