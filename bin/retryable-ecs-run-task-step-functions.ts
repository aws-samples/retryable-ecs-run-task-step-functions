#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { RetryableEcsRunTaskStepFunctionsStack } from "../lib/retryable-ecs-run-task-step-functions-stack";

const app = new cdk.App();
new RetryableEcsRunTaskStepFunctionsStack(app, "RetryableEcsRunTaskStepFunctionsStack");
