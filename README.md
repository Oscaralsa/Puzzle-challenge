# [Puzzle challenge](https://puzzle-challenge-oscar.herokuapp.com/graphql)
Graphql API for puzzle challenge developed with Typescript, Node, GraphQL, PostgreSQL, Apollo and typeORM.

## Table of contents

-   [Installation](#installation)
    -   [Prerequisites](#Prerequisites)
    -   [Development](#Development)

## Installation


### Prerequisites

To be able to run this application you must need to install Node.js 12.0.0 or
newer. Additionally, You must specify several enviroment variables to be able
to connect to your PostgreSQL database. (This credentials can be found in your console).
Also the secret key to build the Json Web Token authentication for authentication.
If you want the API to send emails after a registration, you must provide the gmail address and
password, also you must to enable less secure application configuration in your gmail account.

```
RDS_HOSTNAME=
RDS_PORT=
RDS_DB_NAME=
RDS_USERNAME=
RDS_PASSWORD=
SECRET_KEY=
EMAIL_USER=
EMAIL_PASSWORD=
```

### Development

If you want to contribute or just review this project you may want to use live preview
technology, you must use the terminal to run the node application.

*Example of the graphQL API*
```bash
npm install
npm run start
```
