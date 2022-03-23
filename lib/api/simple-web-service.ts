import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cdk from "@aws-cdk/core";
import * as path from "path";

import {
  functionValidateSongRes,
  beforeValidateSong,
  afterValidateSong,
} from "./resolvers";

export class SimpleWebServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "simple-web-service-songs",
      schema: appsync.Schema.fromAsset(
        path.join(__dirname, "schemas/simple-schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });

    const simpleWebTable = new dynamodb.Table(this, "SimpleWebTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const simpleWebDBDS = api.addDynamoDbDataSource(
      "DDBSimpleWebDataSource",
      simpleWebTable
    );

    simpleWebDBDS.createResolver({
      typeName: "Query",
      fieldName: "getSongs",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    const simpleWebNoneDS = api.addNoneDataSource("none");

    const validateFunction = new appsync.AppsyncFunction(
      this,
      "validateSongFn",
      {
        name: "simpleWebValidateFunction",
        api,
        dataSource: simpleWebNoneDS,
        //fromFile VTL demo
        requestMappingTemplate: appsync.MappingTemplate.fromFile(
          path.join(
            __dirname,
            "resolvers/songs/functions/function.validateSong.req.vtl"
          )
        ),
        //fromString VTL demo
        responseMappingTemplate: appsync.MappingTemplate.fromString(
          functionValidateSongRes
        ),
      }
    );

    const createFunction = new appsync.AppsyncFunction(this, "createSongFn", {
      name: "simpleWebCreateFunction",
      api,
      dataSource: simpleWebDBDS,
      /*
       * CDK can make mapping templates so much easier!!
       */
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition("id").auto(),
        appsync.Values.projecting("input")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    new appsync.Resolver(this, "createSongPipeline", {
      api,
      typeName: "Mutation",
      fieldName: "addSong",
      requestMappingTemplate:
        appsync.MappingTemplate.fromString(beforeValidateSong),
      pipelineConfig: [validateFunction, createFunction],
      responseMappingTemplate:
        appsync.MappingTemplate.fromString(afterValidateSong),
    });
  }
}
