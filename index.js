const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const app = express();
/*
We need schema so that graphql can know which data to access based on the data which we send in.
we need to pass this schema in our express-graphql function to acknowledge the graphql about schema
*/
const {
    GraphQLSchema ,
    GraphQLObjectType, // This allows us to create a dynamic object full of other types.( basically just an Object)
    GraphQLString ,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require("graphql");

//Schema
const schemaOld = new GraphQLSchema({
    query : new GraphQLObjectType({
        name : "HelloWorld",
        //This basically means that our HelloWorld Object has a message field which is gonna return a string.
        //Field takes in a function . So in order to not use "return" keyword we are wrapping it in parentheses.  , ({})
        fields : () => ({
            message : {
                type : GraphQLString ,
                // This basically contains a functions which tells the GraphQL where to get information from.
                resolve : () => "Hello World"
            }
        })
    })
});
/*
Reason we need to return an object in field bcuz bookType returns authorType and authorType returns and uses bookType . so , if we are
just going to use normal return method it will give us an error cuz one is always going to be above another.
*/
// BOOKS-AuthOR
const bookType = new GraphQLObjectType({
    name : "Book" ,
    description : "Book with Author",
    fields : () => ({
        //We Don't need resolve in these cases bcuz our object already has id , name etc field . So , It will automatically pull it.
        id : { type: GraphQLNonNull(GraphQLInt) },
        name : { type: GraphQLNonNull(GraphQLString) },
        authorId : { type: GraphQLNonNull(GraphQLInt)},
        author : {
            type : authorType ,
            //Resolve Takes in Parent (here , book) and args and this book is coming from the books of root query.
            resolve : (book)=>{
                return authors.find(author => author.id === book.authorId );
            }
        }
    })
});
const authorType = new GraphQLObjectType({
    name : "Author" ,
    description : "Author Names",
    fields : () => ({
        //We Don't need resolve in these cases bcuz our object already has id , name etc field . So , It will automatically pull it.
        id : { type: GraphQLNonNull(GraphQLInt) },
        name : { type: GraphQLNonNull(GraphQLString) },
        books : {
            type : new GraphQLList(bookType),
            resolve : (author)=>{
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
});

//Root Query is essentially just a query from everything pulls down from , we can consider it a starting point.
const rootQueryType = new GraphQLObjectType({
    name : "Query",
    description : "Root Query",
    fields : ()=>({
        //Since we have already defined bookType , so now we don't really have to define author type again in it . and we can still get author etc from querying a single book
        // book(id:1){..}
        book : {
            type : bookType,
            description : "A single Book",
            args: {
              id : {type : GraphQLInt}
            },
            resolve : (parent , args) => books.find(book => book.id === args.id)
        },
        books : {
            type : new GraphQLList(bookType) ,
            description : "List Of Books",
            resolve : ()=> books
        },
        author : {
            type : authorType ,
            description : "An Author",
            args : {
                id : {type : GraphQLInt}
            },
            resolve : (parent,args)=> authors.find(author => author.id === args.id)
        },
        authors : {
            type : new GraphQLList(authorType) ,
            description : "List Of authors",
            resolve : ()=> authors
        }
    })
});
//Mutations = POST , PUT , DELETE
/*
mutation {
  addBook(name:"New Book",authorId : 1){
    id
    name
    authorId
    author{
      name
    }
  }
}
 */
const rootMutationType = new GraphQLObjectType({
    name : "Mutations",
    description : "root of Mutation",
    fields : () => ({
        addBook : {
            //return Type after addition of Book
            type : bookType,
            description : "Addition Of Book",
            args:{
                name : {type : GraphQLNonNull(GraphQLString)},
                authorId : {type : GraphQLNonNull(GraphQLInt)}
            },
            resolve : (parent,args)=>{
                const book = {
                    id : books.length + 1 ,
                    name : args.name ,
                    authorId : args.authorId
                }
                books.push(book);
                return book
            }
        },
        addAuthor : {
            //return Type after addition of Book
            type : authorType,
            description : "Addition Of an Author",
            args:{
                name : {type : GraphQLNonNull(GraphQLString)},
            },
            resolve : (parent,args)=>{
                const author = {
                    id : authors.length + 1 ,
                    name : args.name ,
                }
                authors.push(author);
                return author
            }
        }
    })
});

const schema = new GraphQLSchema({
    query : rootQueryType,
    mutation : rootMutationType
})


app.use("/graphql",expressGraphQL({
    schema : schema ,
    // graphiql will give us a UI to work with GraphQL server without having to manually call it with POSTMAN.
    graphiql : true
}));
app.listen(8000,()=>console.log("Server has Started"));

//Dummy Data
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]
const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]
