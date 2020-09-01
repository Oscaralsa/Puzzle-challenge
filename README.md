# Puzzle-challenge
Graphql API for puzzle challenge developed with Typescript, Node, GraphQL, PostgreSQL, Apollo and typeORM.

## Table of contents

-   [Installation](#installation)
    -   [Prerequisites](#Prerequisites)
    -   [Development](#Development)
-   [Usage](#usage)

## Installation


### Prerequisites

To be able to run this application you must need to install Node.js 12.0.0 or
newer. Additionally, You must specify several enviroment variables to be able
to connect to your PostgreSQL database. (This credentials can be found in your console).
Also the secret key to build the Json Web Token authentication

```
RDS_HOSTNAME=
RDS_PORT=
RDS_DB_NAME=
RDS_USERNAME=
RDS_PASSWORD=
SECRET_KEY=
```

### Development

If you want to contribute or just review this project you may want to use live preview
technology, you must use the terminal to run the node application.

*Example of the graphQL API*
```bash
npm install
npm run start
```
