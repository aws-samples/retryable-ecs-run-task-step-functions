import * as sns from "aws-cdk-lib/aws-sns";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as sfnt from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as lambdapy from "@aws-cdk/aws-lambda-python-alpha";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface RetryableRunTaskProps {
    readonly cluster: ecs.ICluster;
    readonly task: ecs.TaskDefinition;
    readonly errorNotifyTopic: sns.ITopic;
    readonly successNotifyTopic: sns.ITopic;
    readonly maxRetryCount?: number;
}

export class RetryableRunTask extends Construct {
    readonly stateMachine: sfn.StateMachine;

    constructor(scope: Construct, id: string, props: RetryableRunTaskProps) {
        super(scope, id);

        const runTask = new sfnt.EcsRunTask(this, `RunTask`, {
            cluster: props.cluster,
            taskDefinition: props.task,
            launchTarget: new sfnt.EcsFargateLaunchTarget({ platformVersion: ecs.FargatePlatformVersion.VERSION1_4 }),
            integrationPattern: sfn.IntegrationPattern.RUN_JOB,
            resultPath: "$.RunTask",
            containerOverrides: [
                {
                    containerDefinition: props.task.defaultContainer!,
                    // You can specify environment variable overrides here.
                    // environment: [
                    //     {
                    //         name: 'INPUT',
                    //         value: sfn.JsonPath.stringAt("$.YOUR_INPUT_PATH")
                    //     },
                    // ]
                },
            ],
        });

        const errorHandlerFunction = new lambdapy.PythonFunction(this, `ErrorHandlerFunction`, {
            runtime: Runtime.PYTHON_3_9,
            entry: "./lambda/error_handler",
        });

        const errorHandler = new sfnt.LambdaInvoke(this, `ErrorHandler`, {
            lambdaFunction: errorHandlerFunction,
            resultPath: "$.Error",
        });

        const notifyError = new sfnt.SnsPublish(this, `NotifyError`, {
            topic: props.errorNotifyTopic,
            message: sfn.TaskInput.fromJsonPathAt("$"),
            subject: "Task failed",
            resultPath: "$.Notify",
        });

        const notifySuccess = new sfnt.SnsPublish(this, `NotifySuccess`, {
            topic: props.successNotifyTopic,
            message: sfn.TaskInput.fromJsonPathAt("$"),
            subject: "Task successfully proceessed.",
            resultPath: "$.Notify",
        });

        const definition = sfn.Chain.start(
            runTask
                .addCatch(
                    errorHandler.next(
                        new sfn.Choice(this, `Retryable?`)
                            .when(
                                sfn.Condition.and(
                                    sfn.Condition.stringEquals("$.Error.Payload.type", "retryable"),
                                    sfn.Condition.numberLessThan("$.Error.Payload.retryCount", props.maxRetryCount ?? 5),
                                ),
                                new sfn.Wait(this, `RetryWait`, {
                                    time: sfn.WaitTime.secondsPath("$.Error.Payload.waitTimeSeconds"),
                                }).next(runTask),
                            )
                            .otherwise(notifyError),
                    ),
                    { resultPath: "$.RunTaskError" },
                )
                .next(notifySuccess),
        );

        this.stateMachine = new sfn.StateMachine(this, `StateMachine`, {
            definition,
        });
    }
}
