import * as cdk from "aws-cdk-lib";
import { Template } from 'aws-cdk-lib/assertions';
import { RetryableEcsRunTaskStepFunctionsStack } from "../lib/retryable-ecs-run-task-step-functions-stack";

test("Snapshot test", () => {
  const app = new cdk.App();
  const stack = new RetryableEcsRunTaskStepFunctionsStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});
