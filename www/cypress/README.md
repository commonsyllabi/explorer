# Testing

## Setup

In order to run the full end-to-end tests, you should have the following running, each in their own terminal windows:

- backend `make docker-run`
- frontend `yarn dev`
- cypress `yarn cypress`

If you are not actively working on tests, and just want to check that everything still behaves the way it should be, you can run `yarn cypress:headless` instead (with the backend and frontend still running).