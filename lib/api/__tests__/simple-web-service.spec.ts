import { Template } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import * as SimpleWebService from "../simple-web-service";

describe("simple-web-service", () => {
  it("AppSync API Created", () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SimpleWebService.SimpleWebServiceStack(
      app,
      "MyTestStack"
    );
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::AppSync::GraphQLApi", {});
  });
});
