import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";

interface TargetTaskProps {
    readonly vpc: ec2.IVpc;
}

// define a sample ecs task
export class TargetTask extends cdk.Construct {
    readonly retyableTaskDefinition: ecs.FargateTaskDefinition;
    readonly ecsCluster: ecs.Cluster;

    constructor(scope: cdk.Construct, id: string, props: TargetTaskProps) {
        super(scope, id);

        const cluster = new ecs.Cluster(this, `Cluster`, {
            vpc: props.vpc,
        });

        const td = new ecs.FargateTaskDefinition(this, `TaskDefinition`, {
            memoryLimitMiB: 512,
            cpu: 256,
        });

        td.addContainer(`Container`, {
            image: ecs.ContainerImage.fromAsset("./app", {
                ignoreMode: cdk.IgnoreMode.DOCKER,
            }),
            logging: new ecs.AwsLogDriver({
                streamPrefix: "Container",
            }),
        });

        this.ecsCluster = cluster;
        this.retyableTaskDefinition = td;
    }
}
