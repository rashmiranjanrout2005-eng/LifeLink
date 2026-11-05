```mermaid
flowchart TD
A[Frontend] --> B[Auth API]
A --> C[Inventory API]
A --> D[Request API]
B --> E[Firebase Authentication and Cloud Firestore]
C --> E
D --> E
``` 
