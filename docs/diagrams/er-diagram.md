```mermaid
erDiagram
PROFILES ||--o{ DONORS : has
PROFILES ||--o{ HOSPITALS : manages
PROFILES ||--o{ BLOOD_REQUESTS : creates
BLOOD_UNITS ||--o{ INVENTORY_TRANSACTIONS : logs
``` 
