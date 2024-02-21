const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
mongoose.set('strictQuery', false)

require('dotenv').config()

const MONGO_URI = process.env.MONGO_URI

console.log('connecting to', MONGO_URI)

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

let authors = [
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
*/

let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon ',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

const typeDefs = `
    type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  
  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book!
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
    createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }
`

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const books = await Book.find({}).populate('author')
            if (!args.author && !args.genre) return books
            else if (!args.genre) return books.filter(b => b.author.name === args.author)
            else if (!args.author) return books.filter(b => b.genres.includes(args.genre))
            else return books.filter(b => b.author.name === args.author && b.genres.includes(args.genre))
        },
        allAuthors: async () => {
            const authors = await Author.find({})
            const books = await Book.find({}).populate('author')
            return authors.map(a => {return {
                name: a.name,
                born: a.born,
                bookCount: books.reduce((acc, cur) => cur.author.name === a.name ? acc + 1 : acc, 0)
            }
            })
        },
        me: (root, args, context) => context.currentUser
    },
    Mutation: {
        addBook: async (root, args, context) => {
            if (!context.currentUser) {
                throw new GraphQLError('User not logged in', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const existingAuth = await Author.findOne({ name: args.author })
            let bookObject
            if (!existingAuth) {
                console.log('new author')
                const auth = new Author({ name: args.author })
                try {
                    const newAuth = await auth.save()
                    bookObject = { ...args, author: newAuth }
                } catch (error) {
                    throw new GraphQLError('Saving author failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.author,
                            error
                        }
                    })
                }
            } else {
                bookObject = { ...args, author: existingAuth }
            }
            const book = new Book(bookObject)
            try {
                await book.save()
            } catch (error) {
                throw new GraphQLError('Saving book failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.title,
                        error
                    }
                })
            }
            return book
        },
        editAuthor: async (root, args, context) => {
            if (!context.currentUser) {
                throw new GraphQLError('User not logged in', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }
            return Author.findOneAndUpdate(
                { name: args.name },
                { ...args, born: args.setBornTo },
                { new: true, runValidators: true })
        },
        createUser: async (root, args) => {
            const user = new User( { username: args.username, favoriteGenre: args.favoriteGenre })
            return user.save()
                .catch (error => {
                    throw new GraphQLError('Creating user failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.username,
                            error
                        }
                    })
                }) 
        },
        login: async (root, args) => {
            const user = await User.findOne( { username: args.username })
            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: { code: 'BAD_USER_INPUT' }
                })
            }
            const token = jwt.sign({ user: user.username, id: user._id }, process.env.SECRET_KEY)
            return { value: token }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4001 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), process.env.SECRET_KEY
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    }
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})