# Azure Pipelines Setup Guide

## Build-and-Deploy.yml

This pipeline automates the build and deployment of the Pets Workshop application across three environments: Dev, QA, and Production.

### Pipeline Overview

The pipeline consists of the following stages:

1. **CI Stage**: Builds container images, runs tests, and publishes Bicep templates
2. **Dev Stage**: Deploys infrastructure and application to the Dev environment
3. **QA Stage**: Deploys infrastructure and application to the QA environment
4. **Production Stage**: Deploys infrastructure and application to the Production environment

### Prerequisites

Before running this pipeline, ensure the following are configured in Azure DevOps:

#### 1. Azure Service Connection

Create an Azure Resource Manager service connection with the following characteristics:

- **Name**: `AzureServiceConnection` (or update the `azureSubscription` variable in the pipeline)
- **Authentication**: Service Principal (recommended) or Managed Identity
- **Scope**: Subscription level
- **Permissions Required**:
  - `Contributor` role at the subscription level (to create resource groups and resources)
  - Or specific permissions to deploy Bicep templates at subscription scope

**Steps to create:**
1. In Azure DevOps, go to Project Settings > Service connections
2. Click "New service connection"
3. Select "Azure Resource Manager"
4. Choose authentication method (Service Principal recommended)
5. Select subscription and grant appropriate permissions
6. Name it `AzureServiceConnection`

#### 2. Environments

Create three environments in Azure DevOps:

- **Dev**: Development environment (can have auto-approval)
- **QA**: Quality Assurance environment (recommended to add approval gates)
- **Production**: Production environment (strongly recommended to add approval gates and checks)

**Steps to create:**
1. In Azure DevOps, go to Pipelines > Environments
2. Create three new environments: `Dev`, `QA`, and `Production`
3. Configure approvals and checks for QA and Production environments

#### 3. Variable Configuration

Update the following variables in the pipeline if needed:

- `azureSubscription`: Name of your Azure service connection (default: `AzureServiceConnection`)
- `location`: Azure region for deployments (default: `eastus`)

You can also create a variable group to manage these centrally:

1. Go to Pipelines > Library
2. Create a new variable group (e.g., `PetsWorkshop-Variables`)
3. Add variables as needed
4. Link the variable group to the pipeline

### Resource Groups

The pipeline will create the following resource groups in your Azure subscription:

- `Tailspin-Shelter-Dev`: Contains Dev environment resources
- `Tailspin-Shelter-QA`: Contains QA environment resources
- `Tailspin-Shelter-Production`: Contains Production environment resources

Each resource group will contain:
- Azure Container Registry (shared within the environment)
- Container Apps Environment
- Container Apps for client and server
- Log Analytics Workspace
- Application Insights
- Managed Identities

### How the Pipeline Works

#### CI Stage
1. Checks out the code
2. Builds Docker images for client and server applications
3. Runs Python tests across multiple Python versions (3.12, 3.13, 3.14)
4. Publishes test results and code coverage
5. Publishes Bicep templates as pipeline artifacts

#### Deployment Stages (Dev, QA, Production)

Each deployment stage follows this pattern:

1. **Deploy Infrastructure**:
   - Deploys Bicep template at subscription scope
   - Creates resource group (if it doesn't exist)
   - Provisions Azure Container Registry, Container Apps Environment, and supporting resources
   - Captures the ACR endpoint for use in subsequent jobs

2. **Push Images**:
   - Authenticates to Azure Container Registry
   - Builds and pushes client and server Docker images
   - Tags images with both build ID and 'latest'

3. **Update Container Apps**:
   - Redeploys Bicep template with `clientExists=true` and `serverExists=true`
   - Updates Container Apps to use the newly pushed images

### First Run Considerations

On the first run:
- Resource groups will be created
- All Azure resources will be provisioned (this may take 5-10 minutes per environment)
- Container images will be built and pushed

On subsequent runs:
- Existing resources will be updated
- Only changed resources will be redeployed
- The process will be faster

### Troubleshooting

#### Common Issues

1. **Service Connection Permissions**: If deployment fails with authorization errors, verify the service connection has `Contributor` access at the subscription level.

2. **ACR Login Failures**: Ensure the managed identities created by the Bicep template have `AcrPull` role on the Container Registry.

3. **Variable Reference Errors**: If the `acrEndpoint` variable is empty, check the output variable syntax matches your Azure DevOps version.

4. **Bicep Deployment Errors**: Review the deployment logs in the Azure Portal under Subscriptions > Deployments to see detailed error messages.

### Security Considerations

- The pipeline uses managed identities for secure authentication between Container Apps and Container Registry
- No secrets are stored in the pipeline YAML
- Service principal credentials (if used) are stored securely in the service connection
- Consider enabling environment approvals for QA and Production

### Cost Optimization

To optimize costs for non-production environments:
- Consider using smaller Container App instance sizes for Dev/QA
- Implement auto-scaling with lower max replicas for Dev/QA
- Consider using consumption-based tiers where available

### Next Steps

After the pipeline is configured:
1. Run the pipeline to verify it works correctly
2. Add approval gates to QA and Production environments
3. Consider adding additional stages for:
   - Security scanning
   - Performance testing
   - Database migrations
4. Set up monitoring and alerting for deployed applications
