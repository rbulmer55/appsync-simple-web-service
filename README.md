# appsync-simple-web-service

This repo uses the AWS CDK to build a Simple Web Service Pattern in serverless using AWS AppSync and DynamoDB.

This project uses TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## GraphQL Schema

### Mutations

```
input SongInput {
  name: String!
  artist: String!
}

Type Mutation{
    addSong(input: SongInput!): Song
}
```

### Queries

```
type Song {
  id: String!
  name: String!
  artist: String!
}

type Query {
  getSongs: [Song!]
}
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npm run deploy` deploy this stack to development
- `npm run diff` compare deployed stack with current state
- `npm run synth` emits the synthesized CloudFormation template
