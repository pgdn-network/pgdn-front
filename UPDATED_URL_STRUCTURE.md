# Updated URL Structure

## Route Changes Made

The organization node routes have been simplified from:
- ~~`/organization/{uuid}/nodes`~~ 
- To: `/organization/{uuid}/` 

## Current Working URLs:

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
- `/` - Dashboard (overview of all organizations and nodes)
- `/organizations` - List all organizations
- `/nodes` - List ALL nodes across all organizations

### Organization Routes
- `/organization/{uuid}/` - Organization detail page (shows nodes for that org)
- `/organization/{uuid}/nodes/{nodeId}` - Specific node detail within organization

### Other Routes
- `/scans` - Scan management
- `/orchestrations` - Automated scan configurations
- `/reports` - Generated reports
- `/settings` - User preferences

## Examples:

### Working Organization URLs:
- `http://localhost:5173/organization/550e8400-e29b-41d4-a716-446655440000/` - TechCorp Inc.
- `http://localhost:5173/organization/6ba7b810-9dad-11d1-80b4-00c04fd430c8/` - DataFlow Systems  
- `http://localhost:5173/organization/6ba7b811-9dad-11d1-80b4-00c04fd430c8/` - CloudNet Solutions

### Working Node Detail URLs:
- `http://localhost:5173/organization/550e8400-e29b-41d4-a716-446655440000/nodes/node-001`
- `http://localhost:5173/organization/550e8400-e29b-41d4-a716-446655440000/nodes/node-002`

## Navigation Flow:
1. **Dashboard** → **Organizations** → **[Specific Organization]** → **[Specific Node]**
2. **Dashboard** → **Nodes** (global view) → **[Specific Node]** (legacy view)

The URL structure is now cleaner and more intuitive, with organization pages serving as the main hub for that organization's nodes and information.
