```mermaid
flowchart TD
A[Frontend] --> B[Auth API]
A --> C[Inventory API]
A --> D[Request API]
B --> E[Supabase]
C --> E
D --> E
``` 
