# Curiosity Report: AWS Cloud Development Kit (CDK)

## Introduction

We briefly talked about infrastructure as code (IaC) in one of our classes. In my opinion, IaC is a really interesting topic to learn more about because although it was important for us to learn about all the different AWS services we are using for the class, and creating them through the AWS Console was a great way to do that, from what I can tell, esentially all teams in industry define their stack with IaC rather than building it manually through the console. This is because of the many benefits you can get from having your infrastructure stack outlined in code. When we talked about IaC in our class, we went over basic CloudFormation. CloudFormation scripts are extremely verbose and therefore difficult to write, and also difficult to understand when you come back to it later. I have a little experience with CDK at my job, but I wanted to learn more about it and how you can create a stack using AWS CDK.

## Benefits of Infrastructure as Code

We went over these benefits in class, but it is important to remember why it makes more sense for every company to use IaC.

1. Deploy Different Environments - Every high quality enterprise application will need to have an environment identical to production that can be used for testing, and likely another used for development. It is essential that the technology stacks in all environments are the same, or else you won't have confidence that something that works in your development or stage environment will actually work in your production environment. Having your infrastructure set up in code allows you to deploy multiple environments that will be verifiably identical.

2. Faster, Easier Deployment - Provisioning and hooking up resources correctly in the AWS console is an absolute pain. Using IaC frameworks automate the creation process for you, and ensure everything gets created in the correct order and is hooked up properly according to your configuration.

3. Disaster Recovery - You can always deploy or redeploy your entire stack at the click of a button. You don't have to remember anything that you had to consider when creating the stack. The code will remember all those details for you.

4. Source Control - If your stack is defined in code, stack changes can be easily tracked and managed through source control. You can track every change that is made to your stack.

There are many more benefits, but it is clear to see that these benefits are enough to make this an essential aspect of any high quality enterprise application.

## What is CDK and why use it?

AWS CDK is a framework created by AWS that allows you to write actual code (in a variety of popular languages), to provision and create technology stacks in AWS. CDK takes the code you write and translates it to raw CloudFormation which is what we looked at in class.

Benefits of CDK:

- Real Programming Power
  - Rather than using a markup language to create your stack (ex. yaml) you can use a real programming language which gives you all the power and flexibility of your desired language. For example, you can use loops, conditionals, functions, and classes however you wish.

- Allows for abstraction/reuse
  - CDK encourages creating reusable constructs allowing you to reuse a portion of your stack if it appears in multiple places (ex. a SQS Queue hooked up to a Lambda function)

- Type Safety and IDE Support
  - Because you are programming in your regular programming language, you have all the regular support you get from that language that you wouldn't get when using a markup language

- Close integration with AWS
  - Admittedly, this can be both a pro and a con. CDK is highly integrated with AWS which makes it easy to work with AWS if that is your desired cloud provider. However, this also means it doesn't have as much flexibility as something like Terraform which is designed to integrate with multiple cloud computing platforms.

- Automatic Permissions
  - CDK can generate IAM roles and policies for many common integrations, and helper methods like `grantRead` and `grantWrite` often apply scoped permissions automatically. This reduces manual IAM work, but you still need to review generated permissions to ensure least privilege.

## Getting Started With CDK

To use CDK in a JavaScript project with npm (like `jwt-pizza-service`), follow these steps:

- Install the CDK CLI globally: `npm install -g aws-cdk`
  - Verify with `cdk --version`
- Create an AWS account and configure credentials locally (more about how to do that [here](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html))
- Use npm to install AWS libraries as needed
  - You will need `aws-cdk-lib` at minimum
- Run `cdk synth` to ensure everything is working.
- More details on these steps can be found in the AWS documentation [here](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html).

## More CDK Details

- AWS has extensive documentation outlining how to use CDK. It can be found [here](https://docs.aws.amazon.com/cdk/api/v2/).
- In CDK, an App is the root container, a Stack groups related infrastructure, and a Construct defines an individual resource or pattern.
- CDK often auto-generates IAM roles, but it is still critical to understand what permissions are granted.
- Resources can reference each other easily by using variables in code.
- `cdk synth` converts your code into a CloudFormation template that you can review.
- `cdk deploy` provisions or updates resources.
- `cdk diff` is a super useful command that shows a diff of your local changes to the stack that is currently deployed in AWS. It shows which resources will be created/modified/destroyed if you were to run `cdk deploy`.
- Levels of Constructs - In CDK there are three common construct levels.
  - Level 1 Constructs (L1): These are the lowest level constructs that map directly to AWS resources. They offer very little abstraction, and require you to specify everything manually.
  - Level 2 Constructs (L2): These are the most commonly used constructs. They let you specify the settings you want, while offering sensible defaults for everything else. They wrap L1 constructs with a cleaner API.
  - Level 3 Constructs (L3): These are high level patterns that combine multiple resources into a working solution. They make it easy to create super common architectures in one line. (ex. An API Gateway that maps to Lambdas).
  - You should use L2 constructs almost all of the time, unless you need the fine grained control offered by L1 constructs or have a specific pattern than can be implemented by an L3 construct.

## Example: Lambda Function exposed via API Gateway

Here I provide four examples for the same core pattern: a Lambda function exposed through API Gateway. The examples are shown in raw CloudFormation, then CDK L1, L2, and L3 styles.

These snippets are intentionally simplified for comparison. A full production-ready stack would also include details such as Lambda invoke permissions for API Gateway and explicit deployment/stage configuration where needed.

### CloudFormation Example

```json
{
  "Resources": {
    "MyLambdaRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": { "Service": ["lambda.amazonaws.com"] },
              "Action": ["sts:AssumeRole"]
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ]
      }
    },
    "MyLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Handler": "index.handler",
        "Runtime": "nodejs18.x",
        "Role": { "Fn::GetAtt": ["MyLambdaRole", "Arn"] },
        "Code": {
          "ZipFile": "exports.handler = async () => ({ statusCode: 200, body: 'Hello' });"
        }
      }
    },
    "MyApi": {
      "Type": "AWS::ApiGateway::RestApi",
      "Properties": { "Name": "MyApi" }
    },
    "MyResource": {
      "Type": "AWS::ApiGateway::Resource",
      "Properties": {
        "ParentId": { "Fn::GetAtt": ["MyApi", "RootResourceId"] },
        "PathPart": "hello",
        "RestApiId": { "Ref": "MyApi" }
      }
    },
    "MyMethod": {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "HttpMethod": "GET",
        "ResourceId": { "Ref": "MyResource" },
        "RestApiId": { "Ref": "MyApi" },
        "AuthorizationType": "NONE",
        "Integration": {
          "Type": "AWS_PROXY",
          "IntegrationHttpMethod": "POST",
          "Uri": {
            "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${MyLambda.Arn}/invocations"
          }
        }
      }
    }
  }
}
```

You will notice this is very verbose. This is similar to what we worked with in class. It requires every field to be specified.

### L1 Constructs Example

```javascript
const role = new iam.CfnRole(this, 'MyLambdaRole', {
  assumeRolePolicyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: ['lambda.amazonaws.com'] },
        Action: ['sts:AssumeRole'],
      },
    ],
  },
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
  ],
});

const fn = new lambda.CfnFunction(this, 'MyLambda', {
  handler: 'index.handler',
  runtime: 'nodejs18.x',
  role: role.attrArn,
  code: {
    zipFile: `exports.handler = async () => ({ statusCode: 200, body: 'Hello' });`,
  },
});

const api = new apigateway.CfnRestApi(this, 'MyApi', { name: 'MyApi' });
```

You will notice this is less verbose, as it requires less boilerplate text. However, it is still very close to raw CloudFormation, just written in code. You still have to specify essentially every setting, it just allows you to do it in JavaScript syntax using variables and function calls.

### L2 Constructs Example

```javascript
const fn = new lambda.Function(this, 'MyLambda', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromInline(
    `exports.handler = async () => ({ statusCode: 200, body: 'Hello' });`,
  ),
});

const api = new apigateway.RestApi(this, 'MyApi');

const hello = api.root.addResource('hello');
hello.addMethod('GET', new apigateway.LambdaIntegration(fn));
```

Here you can start to see the benefits of CDK. In much less code we are able to do the same thing. For example, creating an API Gateway is done in a single line, and in two more lines of code we have attached the Lambda to the API Gateway.

CDK is automatically creating an IAM role that allows these two resources to communicate, and we never have to concern ourselves with the ARNs of the two resources. They will be hooked up automatically in the CloudFormation that is generated from this code.

Also, because we are using JavaScript, we could import a handler from elsewhere in the codebase instead of using inline code. Inline code is only used here for simplicity. This shows how CDK can fit naturally into an existing JavaScript project.

### L3 Constructs Example

```javascript
const fn = new lambda.Function(this, 'MyLambda', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromInline(
    `exports.handler = async () => ({ statusCode: 200, body: 'Hello' });`,
  ),
});

new apigateway.LambdaRestApi(this, 'MyApi', {
  handler: fn,
});
```

Here we can see that the API Gateway is created and mapped to the lambda in a single line of code using the `LambdaRestApi` L3 construct. Remember, L3 constructs are high level patterns of multiple resources that are made simpler by combining them to a single API within CDK.

Here, CDK is automatically creating an API Gateway, setting up the route, and all the permissions required to make that happen.

Hopefully you can see the benefits of allowing CDK to generate these IAM policies. Not only do you not have to worry about doing it yourself, it is automatically using the most secure settings it can.

## Conclusion

I think AWS CDK is a fantastic tool for writing IaC, which is an essential skill for any DevOps engineer. Hopefully after going over the benefits and showing how simple it can be, you agree with what I have found.

I enjoyed learning more about CDK and specifically the different levels of constructs in CDK and how they can be used to abstract away the complications of provisioning resources in AWS. Although working with AWS and scouring through their documentation can be a real pain, thankfully they are still developing tools like this that make using AWS so much easier.
