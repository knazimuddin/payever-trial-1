# Payever transactions micro

- communicates with checkout databases
- fetches transations
- provides transaction operations

## Prod server
Run `npm start` for a prod server. Server will be started at `http://localhost:3000/`.

## Development server

Run `npm start:dev` for a dev server. Server will be started at `http://localhost:3040/`. The app will automatically rebuild if you change any of the source files.

## Running unit tests

Run `npm run test` for single run and `npm run test:watch` for watch mode.

## Unit tests coverage report

Run `npm run test:coverage` to generate coverage report

## Running e2e tests

Run `npm run e2e` for single run and `npm run e2e:watch` for watch mode.

## Running artillery tests

Run `npm run test:artillery-load` for load testing

Run `SCRIPT=<script> npm run test:artillery-scenario` for functional testing

where `<script>` is the API section name: business, integration, etc. (as in swagger).
The correct names can be seen in the dir ./tests/artillery/scenarios/.

For example, `SCRIPT=business npm run test:artillery-scenario`