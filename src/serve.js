/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

import express from 'express';

import graphqlHTTP from 'express-graphql';

import schema from './schema/schema';


const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

/* jshint ignore:start */
let startPort = async () => {
    try {
        let portConfigure = await app.listen(3000);
        console.log(`API is now running on port 3000`);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}
startPort();
/* jshint ignore:end */



