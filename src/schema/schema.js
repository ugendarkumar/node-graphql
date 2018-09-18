/*jshint node: true */
/*jshint esversion: 6 */

import fetch from 'node-fetch';
import util from 'util';
import xml2js from 'xml2js';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} from 'graphql';


const parseXML = util.promisify(xml2js.parseString);



/* jshint ignore:start */


/* jshint ignore:end */


const authorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This contains author details',
    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: xml => xml.GoodreadsResponse.author[0].name[0]
        }
    })
});

export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'query',
        description: 'this is where query for author occur',
        fields: () => ({
            author: {
                type: authorType,
                args: {
                    id: {
                        type: GraphQLInt
                    }
                },
                /* jshint ignore:start */
                resolve: async (roots, args) => {
                    let dataRes = await fetch(`https://www.goodreads.com/author/show.xml?id=${args.id}&key=AMstopyIzJpTKO0pGwyA`);
                    dataRes = await dataRes.text();
                    dataRes = await parseXML(dataRes);
                    return dataRes;
                }
                /* jshint ignore:end */
            }
        })
    })
});