import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
    fragment BookDetails on Book {
        title
        author {
            name
        }
        published
        genres
    }
`

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }
${BOOK_DETAILS}
`

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query {
        allBooks {
            ...BookDetails
        }
    }
${BOOK_DETAILS}
`

export const SOME_BOOKS = gql`
    query someBooks($author: String, $genre: String) {
        allBooks(
            author: $author, 
            genre: $genre) {
                ...BookDetails
        }
    }
${BOOK_DETAILS}
`

export const ADD_BOOK = gql`
    mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(
            title: $title,
            author: $author,
            published: $published,
            genres: $genres
            ) {
                ...BookDetails
            }
    }
${BOOK_DETAILS}
`

export const CREATE_AUTHOR = gql`
    mutation createAuthor($name: String!, $born: Int) {
        addAuthor(
            name: $name,
            born: $born
        ) {
            name
            born
            bookCount
        }
    }
`

export const EDIT_AUTHOR = gql`
    mutation editYear($name: String!, $year: Int!) {
        editAuthor(
            name: $name,
            setBornTo: $year
        ) {
            name
            born
        }
    }
`

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(
            username: $username,
            password: $password
        ) {
            value
        }
    }
`

export const ME = gql`
    query {
        me {
            username
            favoriteGenre
        }
    }
`