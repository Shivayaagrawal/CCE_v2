# CCE Decision Assurance Dashboard

CCE Decision Assurance Dashboard for ChargeUp's battery fleet decision governance and verification.

For complete project requirements, architectural guidelines, data contracts, and design tokens, refer to the single source of truth:
- [SPEC.md](./SPEC.md)

## Prerequisites

- Node.js 18.18+ or 20+
- npm 10+

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file if connecting to an external API:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

The development server runs on **port 3002**:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### 4. Build for Production

```bash
npm run build
```

### 5. Run Tests

```bash
npm test
```
