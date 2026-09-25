# Azure Cosmos DB Setup for VQA Vector Search

This guide walks through setting up Azure Cosmos DB for MongoDB vCore with vector search for the VQA multimodal embedding system.

## Prerequisites

- Azure subscription with Cosmos DB access
- Azure CLI installed (`az --version`)
- Python 3.8+ installed

## Step 1: Login to Azure

```powershell
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your Subscription Name"

# Verify
az account show
```

## Step 2: Create Resource Group

```powershell
# Variables - customize these
$RESOURCE_GROUP = "vqa-vectordb-rg"
$LOCATION = "eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

## Step 3: Create Cosmos DB for MongoDB vCore

> **Important**: Use vCore-based (not RU-based) for vector search support!

### Option A: Azure Portal (Recommended for first time)

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Azure Cosmos DB for MongoDB"**
3. Click **+ Create**
4. Select **"vCore cluster"** (NOT "Request unit (RU) based")
5. Configure:
   - **Subscription**: Your subscription
   - **Resource group**: `vqa-vectordb-rg`
   - **Cluster name**: `vqa-vectors`
   - **Location**: East US (or your preferred region)
   - **MongoDB version**: 6.0
   - **Cluster tier**: 
     - **M25** (2 vCores, 8GB RAM) - ~$100/month - Good for development
     - **M40** (4 vCores, 16GB RAM) - ~$200/month - Good for production
   - **Storage**: 32 GB (expandable later)
   - **High availability**: Disabled (for dev, enable for prod)
6. **Networking**:
   - Allow Azure services
   - Add your IP address for local development
7. **Admin credentials**:
   - Username: `vqaadmin`
   - Password: Create a strong password (save it!)
8. Click **Review + Create** → **Create**

### Option B: Azure CLI

```powershell
# Note: As of 2024, vCore clusters are best created via Portal
# CLI support is limited. Use Portal for initial setup.

# After creation, get connection string from Portal:
# Cosmos DB account → Settings → Connection strings
```

## Step 4: Get Connection String

1. Go to your Cosmos DB account in Azure Portal
2. Click **Settings** → **Connection strings**
3. Copy the **PRIMARY CONNECTION STRING**

Format:
```
mongodb+srv://vqaadmin:<password>@vqa-vectors.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
```

## Step 5: Configure Firewall (Important!)

1. Go to Cosmos DB account → **Networking**
2. Add your current IP address
3. Enable **"Allow Azure services and resources to access this cluster"**
4. Save changes

## Step 6: Set Environment Variables

```powershell
# Windows PowerShell - Session only
$env:COSMOS_CONNECTION_STRING = "mongodb+srv://vqaadmin:YourPassword@vqa-vectors.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"

# Windows - Permanent (User level)
[Environment]::SetEnvironmentVariable("COSMOS_CONNECTION_STRING", "mongodb+srv://...", "User")

# Verify
echo $env:COSMOS_CONNECTION_STRING
```

## Step 7: Test Connection

```python
# test_cosmos_connection.py
from pymongo import MongoClient
import os

connection_string = os.getenv("COSMOS_CONNECTION_STRING")
client = MongoClient(connection_string)

# Test connection
try:
    client.admin.command('ping')
    print("✓ Successfully connected to Cosmos DB!")
    
    # List databases
    print("Databases:", client.list_database_names())
except Exception as e:
    print(f"✗ Connection failed: {e}")
finally:
    client.close()
```

## Step 8: Create Vector Index

Once your notebook uploads embeddings, create the vector index:

> **Note**: The notebook (Cell 13) automatically creates this index. This section is for reference or manual creation.

```python
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

client = MongoClient(os.getenv("COSMOS_CONNECTION_STRING"))
db = client["vqa_vectors"]
collection = db["embeddings"]

# Create HNSW vector search index (faster queries, ~95% recall)
# HNSW = Hierarchical Navigable Small World graph
index_definition = {
    "fields": [
        {
            "type": "vector",
            "path": "embedding",
            "numDimensions": 768,      # ViLT embedding size
            "similarity": "COS",        # Cosine similarity
            "m": 16,                    # Max connections per node (higher = better recall, more memory)
            "efConstruction": 64        # Build-time search width (higher = better index, slower build)
        }
    ]
}

# Create the index (run once)
search_index = SearchIndexModel(
    definition=index_definition,
    name="vqa_vector_index"
)
collection.create_search_index(search_index)
print("✓ HNSW vector index created!")
```

### HNSW vs IVF Index

| Algorithm | Build Time | Query Time | Recall | Best For |
|-----------|------------|------------|--------|----------|
| **HNSW** (recommended) | Slower | **Fast** (~ms) | ~95%+ | Production inference |
| IVF | Fast | Slower | ~80-90% | Large datasets, less frequent queries |

We use **HNSW** because it provides faster queries during inference.
```

## Cost Summary

| Tier | vCores | RAM | Storage | Monthly Cost |
|------|--------|-----|---------|--------------|
| M25 (Dev) | 2 | 8 GB | 32 GB | ~$100 |
| M40 (Prod) | 4 | 16 GB | 128 GB | ~$200 |
| M50 | 8 | 32 GB | 256 GB | ~$400 |

**Tips to reduce costs:**
- Use M25 for development/testing
- Delete cluster when not in use
- Use serverless if available in your region

## Troubleshooting

### "Authentication failed"
- Check password doesn't have special chars that need URL encoding
- Verify username matches what you created
- Ensure IP is whitelisted in firewall

### "Connection timed out"
- Check firewall rules allow your IP
- Verify "Allow Azure services" is enabled
- Check cluster is running (not paused)

### "Vector search not supported"
- Ensure you created vCore cluster, NOT RU-based
- Vector search requires MongoDB 6.0+
- Check your region supports vector search

## Next Steps

1. ✅ Cosmos DB cluster created
2. ✅ Connection string saved
3. ✅ Firewall configured
4. → Open Azure ML notebook to generate and upload embeddings
5. → Create vector index after first upload
6. → Query your VQA system!
