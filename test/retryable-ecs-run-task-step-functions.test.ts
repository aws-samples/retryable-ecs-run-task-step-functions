import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { RetryableEcsRunTaskStepFunctionsStack } from "../lib/retryable-ecs-run-task-step-functions-stack";

test("Snapshot test", () => {
    const app = new cdk.App();
    const stack = new RetryableEcsRunTaskStepFunctionsStack(app, "MyTestStack");
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
