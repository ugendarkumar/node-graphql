/*jshint node: true */
/*jshint esversion: 6 */

import fetch from 'node-fetch';
import util from 'util';
import xml2js from 'xml2js';
import translate from 'google-translate-api';
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
const bookType = new GraphQLObjectType({
    name: 'Books',
    description: 'This contains books details',
    fields: () => ({
        title: {
            type: GraphQLString,
            args: {
                lang: {
                    type: GraphQLString
                }
            },
            /* jshint ignore:start */
            resolve: async (xml, args) => {
                let title = await translate(xml.GoodreadsResponse.book[0].title[0], { // api aggregation
                    to: args.lang
                });
                return title.text;
            }

            /* jshint ignore:end */
        },
        isbn: {
            type: GraphQLString,
            resolve: xml => (typeof xml.GoodreadsResponse.book[0].isbn[0] === 'string') ? xml.GoodreadsResponse.book[0].isbn[0] : ''
        }
    })
});

const authorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This contains author details',
    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: xml => xml.GoodreadsResponse.author[0].name[0] // data is available from query resolver
        },
        books: {
            type: new GraphQLList(bookType),
            /* jshint ignore:start */
            resolve: async (xml) => { // lazy loading to fetch each book 
                const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._);
                let booksData = await ids.map(async (id) => {
                    let dataReq = await fetch(`https://www.goodreads.com/book/show/${id}.xml?key=AMstopyIzJpTKO0pGwyA`);
                    dataReq = await dataReq.text();
                    dataReq = await parseXML(dataReq);
                    return dataReq;
                });
                return booksData;
            }
            /* jshint ignore:end */
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
                    // get data's for the authors 
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