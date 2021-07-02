import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as ec2 from "@aws-cdk/aws-ec2";
import { RetryableRunTask } from "./construct/retryable-run-task";
import { TargetTask } from "./construct/target-task";

export class RetryableEcsRunTaskStepFunctionsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, `Vpc`, { natGateways: 1 });

        const topic = new sns.Topic(this, `NotifyTopic`);

        const target = new TargetTask(this, `Target`, { vpc });

        const retryableRunTask = new RetryableRunTask(this, `RetryableRunTask`, {
            errorNotifyTopic: topic,
            successNotifyTopic: topic,
            task: target.retyableTaskDefinition,
            cluster: target.ecsCluster,
        });

        new cdk.CfnOutput(this, "StateMachineArn", {
            value: retryableRunTask.stateMachine.stateMachineArn,
            exportName: "StateMachineArn",
        });
    }
}
