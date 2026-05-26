# Dashboard Batch Job Print Functionality

## Overview

The Dashboard Batch Job Print feature allows users to print signs for batch jobs directly from the Sign Management Dashboard. Clicking the **Print** button on any batch row opens a **Print Configuration Modal** that handles the complete ECS print server flow — session creation, printer/tray selection, optional preview, and print execution.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Browser (React)                                                        │
│                                                                        │
│  Dashboard → Print Button → PrintConfigModal → usePrintFlow hook       │
│                                          │                             │
│                              fetch("/api/print/ecs-step", {...})        │
└──────────────────────────────────────────┼─────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Next.js API Route (Server-side Proxy)                                   │
│  /api/print/ecs-step.ts                                                  │
│                                                                          │
│  • Bypasses CORS (server-to-server)                                      │
│  • Bypasses TLS cert validation (self-signed cert)                       │
│  • Routes to correct ECS endpoint per step                               │
└──────────────────────────────────────────┼───────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  ECS Print Server                                                        │
│  https://localhost.ecsglobalinc.com:8083/                                 │
│                                                                          │
│  • create-session     • get-printers      • preview-first/next/last      │
│  • batchSign-preview  • get-trays         • get-layouts-from-sink        │
│  • print-signs-for-layout                 • get-layouts-by-id            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

| File | Purpose |
|------|---------|
| `src/components/dashboard/dashboard.tsx` | Dashboard page with Print button per batch row |
| `src/components/printConfigModal/printConfigModal.tsx` | Print Configuration Modal UI |
| `src/components/printConfigModal/printConfigModal.module.scss` | Modal styles |
| `src/hooks/usePrintFlow.ts` | Hook managing complete ECS print flow state |
| `src/pages/api/print/ecs-step.ts` | Server-side proxy for ECS API calls |
| `src/services/dashboardService.ts` | Dashboard data service (with static fallback) |
| `src/types/batch.ts` | Batch data types |
| `src/types/dashboard.ts` | Dashboard activity types |
| `.env.local` | Environment variables for ECS server URLs & credentials |

---

## API Flow (Step-by-Step)

### Step 1: User Clicks Print Button

**Location:** `src/components/dashboard/dashboard.tsx`

```tsx
<button onClick={() => handleDashboardPrint(activity)}>
  Print ({activity.printCount})
</button>
```

This opens the `PrintConfigModal` with the following dynamic parameters:

| Parameter | Source | Example Value |
|-----------|--------|---------------|
| `jobID` | `activity.batchConfigId` | `237022` |
| `batchID` | `activity.id` | `17254` |
| `sellUnitId` | Static | `"100"` |
| `batchName` | `activity.activityName` | `"Emergency Batch"` |

---

### Step 2: Modal Opens → Session Created (MANDATORY)

**API Call:** `create-session`  
**Endpoint:** `POST https://localhost.ecsglobalinc.com:8083/`

**Payload:**
```json
{
  "method": "create-session",
  "userName": "CostcoWS",
  "password": "dlm429t",
  "apiToken": "57e1bc49ff598e7495f8b35739848ad2",
  "serverURL": "https://costcotest.ecsglobalinc.com/ecs/"
}
```

**Expected Response:**
```json
{
  "sessionID": "abc123-def456-..."
}
```

The `sessionID` is stored and passed in all subsequent calls.

---

### Step 3: Load Batch Data

**API Call:** `batchSign-preview`  
**Endpoint:** `POST https://localhost.ecsglobalinc.com:8083/`

**Payload:**
```json
{
  "method": "batchSign-preview",
  "sessionID": "<from step 2>",
  "args": [{
    "drillDownLevel": 0,
    "printStatus": "0",
    "batchHeader": {
      "jobID": 237022,
      "batchID": 17254,
      "sellUintId": "100",
      "hasPrintPermission": true,
      "doNotReprint": false,
      "printedQty": 0,
      "qty": 1
    }
  }]
}
```

**Dynamic Values:**
- `jobID` → from `activity.batchConfigId`
- `batchID` → from `activity.id`
- `sellUintId` → static `"100"`

---

### Step 4: Get Printers

**API Call:** `get-printers`  
**Endpoint:** `POST https://localhost.ecsglobalinc.com:8083/`

**Payload:**
```json
{
  "method": "get-printers",
  "sessionID": "<from step 2>"
}
```

**Expected Response:**
```json
{
  "printers": ["OKI_C9600_F4EEEF", "HP_LaserJet_4250"]
}
```

**UI Logic:**
- If **1 printer** → auto-select it, hide dropdown
- If **multiple printers** → show dropdown for user selection

---

### Step 5: Get Trays (MANDATORY)

**API Call:** `get-trays`  
**Endpoint:** `POST https://localhost.ecsglobalinc.com:8083/`

**Payload:**
```json
{
  "method": "get-trays",
  "args": "OKI_C9600_F4EEEF",
  "sessionID": "<from step 2>"
}
```

**Expected Response:**
```json
{
  "trays": ["Tray1", "Tray2", "Manual"]
}
```

**UI:** Always shows Tray dropdown. Print button disabled until tray is selected.

---

### Step 6: Preview (OPTIONAL)

User can click **First**, **Next**, or **Last** buttons.

**API Calls:** `preview-first` / `preview-next` / `preview-last`  
**Endpoint:** `POST https://localhost.ecsglobalinc.com:8083/`

**Payload:**
```json
{
  "method": "preview-first",
  "sessionID": "<from step 2>"
}
```

**Expected Response:**
```json
{
  "data": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Rendering Base64 → Image:**
```tsx
<img src={`data:image/png;base64,${response.data}`} alt="Preview" />
```

---

### Step 7: Print Execution

**Two-step process:**

#### 7a. Get Layouts
**API Call:** `get-layouts-from-sink`

```json
{
  "method": "get-layouts-from-sink",
  "sessionID": "<from step 2>"
}
```

**Response:**
```json
{
  "layouts": [
    { "layoutID_1": "LAYOUT_001", "layoutID_Count": 5 },
    { "layoutID_1": "LAYOUT_002", "layoutID_Count": 3 }
  ]
}
```

#### 7b. Print Each Layout
**API Call:** `print-signs-for-layout` (called per layout)

```json
{
  "method": "print-signs-for-layout",
  "args": {
    "ID": "LAYOUT_001",
    "PRINTER": "OKI_C9600_F4EEEF",
    "daily": "Tray1",
    "PAGE_FROM": "1",
    "PAGE_TO": "9999"
  },
  "sessionID": "<from step 2>"
}
```

---

## UI States

| State | What User Sees |
|-------|----------------|
| Modal opens | "Creating session & loading batch…" spinner |
| Session created | Green session badge + printer/tray config |
| Single printer | Auto-selected label (no dropdown) |
| Multiple printers | Printer dropdown |
| Trays loading | "Loading trays…" placeholder |
| Tray selected | Print button enabled |
| Preview clicked | Image rendered from base64 |
| Print clicked | "Printing…" disabled button |
| Print success | Green success message |
| Any error | Red error message |

---

## Static Fallback Data

When the batch API (`/api/batch/get-all-batches`) is unavailable, the dashboard shows two hardcoded batch entries:

| Batch Name | Batch ID | Config ID (Job ID) | Sign Qty |
|---|---|---|---|
| Emergency Batch | 17254 | 237022 | 34 |
| Daily Batch | 17255 | 213020 | 34 |

**Source:** `src/services/dashboardService.ts` → `FALLBACK_ACTIVITIES`

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `ECS_PRINT_GATEWAY_URL` | `https://localhost.ecsglobalinc.com:8083` | Print server endpoint (POST target) |
| `ECS_PRINT_SERVER_URL` | `https://costcotest.ecsglobalinc.com/ecs/` | serverURL passed in create-session payload |
| `ECS_PRINT_USERNAME` | `CostcoWS` | Print server credentials |
| `ECS_PRINT_PASSWORD` | `dlm429t` | Print server credentials |
| `ECS_PRINT_API_TOKEN` | `57e1bc49ff598e7495f8b35739848ad2` | API authentication token |

---

## Component Props

### PrintConfigModal

```typescript
interface PrintConfigModalProps {
  open: boolean;        // Controls modal visibility
  onClose: () => void;  // Called when modal is closed
  jobID: number;        // Batch config ID (maps to ECS jobID)
  batchID: number;      // Batch ID
  sellUnitId: string;   // Store/sell unit ID (static "100")
  batchName?: string;   // Display name for the batch
}
```

### usePrintFlow Hook

**Returns:**
```typescript
{
  sessionID: string | null;
  sessionLoading: boolean;
  sessionError: string | null;
  printerInfo: { printers: string[]; selectedPrinter: string };
  printersLoading: boolean;
  trays: string[];
  selectedTray: string;
  traysLoading: boolean;
  traysError: string | null;
  preview: { imageData: string | null; label: string; loading: boolean };
  previewError: string | null;
  printing: boolean;
  printError: string | null;
  printSuccess: boolean;
  initSession: (params: PrintFlowParams) => Promise<void>;
  selectPrinter: (printer: string) => Promise<void>;
  selectTray: (tray: string) => void;
  loadPreview: (direction: "preview-first" | "preview-next" | "preview-last") => Promise<void>;
  printSigns: () => Promise<void>;
  reset: () => void;
}
```

---

## Data Flow Mapping

```
Dashboard Activity Row
├── activity.id             → batchID (17254)
├── activity.batchConfigId  → jobID   (237022)
├── activity.activityName   → batchName ("Emergency Batch")
├── activity.printCount     → signQuantity (34)
└── sellUnitId              → static "100"
```

These values flow into the `batchSign-preview` payload as:
- `batchHeader.jobID` ← `activity.batchConfigId`
- `batchHeader.batchID` ← `activity.id`  
- `batchHeader.sellUintId` ← `"100"`

---

## Security Notes

- **No CORS issues:** Browser never calls ECS directly; all calls go through `/api/print/ecs-step` (same-origin proxy)
- **TLS:** Self-signed cert handled with `rejectUnauthorized: false` on server side only
- **Credentials:** Never exposed to browser; only used in server-side env vars
- **Password masking:** `create-session` response masks password as `"***"` in the returned `sentPayload`

---

## Testing

1. Navigate to Dashboard
2. Verify batch table shows "Emergency Batch" and "Daily Batch" (fallback or from API)
3. Click **Print (34)** on any row
4. Modal opens → session badge appears → printer/tray config loads
5. Select tray (if not auto-selected)
6. Optionally click First/Next/Last to preview signs as images
7. Click **Print** → success message appears
8. Close modal
