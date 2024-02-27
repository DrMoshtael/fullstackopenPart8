const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            console.log('all books')
            const books = await Book.find({}).populate('author')
            if (!args.author && !args.genre) return books
            else if (!args.genre) return books.filter(b => b.author.name === args.author)
            else if (!args.author) return books.filter(b => b.genres.includes(args.genre))
            else return books.filter(b => b.author.name === args.author && b.genres.includes(args.genre))
        },
        allAuthors: async () => {
            console.log('allAuthors resolver')
            const authors = await Author.find({})
            const books = await Book.find({}).populate('author')
            return authors.map(a => {
                return {
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
            console.log('addBook called')
            if (!context.currentUser) {
                console.log('user not logged in')
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
            pubsub.publish('BOOK_ADDED', { bookAdded: book })
            return book
        },
        editAuthor: async (root, args, context) => {
            console.log('editing Author')
            if (!context.currentUser) {
                console.log('not logged in')
                throw new GraphQLError('User not logged in', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }
            return Author.findOneAndUpdate(
                { name: args.name },
                { ...args, born: args.setBornTo },
                { new: true, runValidators: false })
        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
            return user.save()
                .catch(error => {
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
            const user = await User.findOne({ username: args.username })
            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: { code: 'BAD_USER_INPUT' }
                })
            }
            const token = jwt.sign({ user: user.username, id: user._id }, process.env.SECRET_KEY)
            return { value: token }
        },
        addAuthor: async (root, args, context) => {
            console.log('adding author')
            if (!context.currentUser) {
                console.log('user not logged in')
                throw new GraphQLError('User not logged in', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }
            const auth = new Author({ name: args.name, born: args. born })
            return auth.save()
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        }
    }
}

module.exports = resolvers