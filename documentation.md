# High-Resolution Wall Interface — Documentation

## 1. Overview
This project reimagines the traditional monitor by introducing a **high-resolution wall interface** where users can add, move, and remove widgets, as well as create sticky notes for quick reference.  
The system supports saving and loading layouts for individual users.

---

## 2. Key Features
- **User Login & Persistence**
  - Individual layouts and notes are saved per user in `localStorage`.
  - Layouts reload automatically upon login.
- **Dynamic Widgets**
  - Weather
  - Calendar
  - Clock
  - News
  - Stocks
  - Quote of the Day  
  *(Mock API calls simulate real-world data fetching.)*
- **Sticky Notes**
  - Draggable but not resizable.
  - Content is saved automatically in the user layout.
- **Sidebar Navigation**
  - Collapsible sidebar appears on hover.
- **Layout Management**
  - Save button confirms with a toast notification.
  - Load layouts automatically on login.
- **Widget Controls**
  - Pin (lock position & size)
  - Delete with confirmation dialog

---

## 3. UI Flow — Login, Save, and Load
```mermaid
flowchart TD
    A[User visits Home Page] -->|Not Logged In| B[Redirect to Login]
    A -->|Logged In| C[Load User Data]
    C --> D[Load Layout from localStorage]
    C --> E[Load Notes from localStorage]
    D & E --> F[Display Interface]
    F --> G[User Adds/Removes Widgets or Notes]
    G --> H[Click Save Layout]
    H --> I[Update localStorage with New Layout]
    I --> J[Show Toast: "Layout Saved ✔️"]
    J --> C
