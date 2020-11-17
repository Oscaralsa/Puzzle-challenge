# [Puzzle challenge](https://puzzle-challenge-oscar.herokuapp.com/graphql)
Graphql API for puzzle challenge developed with Typescript, Node, GraphQL, PostgreSQL, Apollo and typeORM.

## Table of contents

-   [Installation](#installation)
    -   [Prerequisites](#Prerequisites)
    -   [Development](#Development)
-   [Demo](#Demo)

## Installation


### Prerequisites

To be able to run this application you must need to install Node.js 12.0.0 or
newer. Additionally, if you want to connect to an external database, you must specify 
several enviroment variables to be able to connect to your PostgreSQL database, if you want 
to connect to heroku postgres, use the DATABASE_URL env var. (This credentials can be found in your console).
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

## Demo

[<img src="https://firebasestorage.googleapis.com/v0/b/cargox-4d7ef.appspot.com/o/Demo.png?alt=media&token=2ec1d4ae-20c2-454b-b001-7fa3846bcd2a"/>](https://puzzle-challenge-oscar.herokuapp.com/graphql)

You can find the API demo at https://puzzle-challenge-oscar.herokuapp.com/graphql
