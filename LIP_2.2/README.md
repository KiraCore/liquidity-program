# AWSLauncher

Deployment System Based on AWS Lambda, latest release can be found [here](https://github.com/asmodat/PriceOracle/releases).

## Installing Debug Tools

> https://github.com/emgdev/lambda-local-runner

```
dotnet tool install -g Amazon.Lambda.TestTool-2.1
dotnet tool update -g Amazon.Lambda.TestTool-2.1
```

Set env variable `AWS_PROFILE` to your credential profile on local. 


## Setup Lambda Function

> Wizard

```
Function name: PriceOrcaleService
Runtime: .NET Core 2.1 (C#/PowerShell)
Choose or create an existing role -> existing role -> (create role with permissions to secrets and ec2)
```

> Add Trigger

```
CloudWatch Event
Rule -> Create new rule
	Rule name -> PriceOrcaleService-Trigger
	Schedule expression -> rate(1 minute)
	Enable trigger -> yes
```

> PriceOrcaleService

```
Memory: 256 MB
Timeout: 15 min
Network -> depending on your security requirements
```

> Environment variables

```
MAX_PARALLELISM: 10
}
```
