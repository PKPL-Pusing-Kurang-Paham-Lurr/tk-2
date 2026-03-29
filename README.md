# tk2-pkpl

Proyek ini dibuat dengan [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), sebuah stack TypeScript modern yang menggabungkan Next.js, tRPC, dan lainnya.

## Anggota Tim

| Nama | NPM |
|------|-----|
| Heraldo Arman | 2406420702 |
| Valerian Hizkia Emmanuel | 2406495382 |
| Muhammad Rifqi Ilham | 2406495483 |
| Ryan Gibran Purwacakra Sihaloho | 2406419833 |
| Cyrillo Praditya Soeharto | 2406495413 |

## Fitur

- **TypeScript** - Type safety dan pengalaman pengembangan yang lebih baik
- **Next.js** - Framework React full-stack
- **TailwindCSS** - CSS utility-first untuk pengembangan UI yang cepat
- **Shared UI package** - Komponen shadcn/ui primitif ada di `packages/ui`
- **tRPC** - API end-to-end type-safe
- **Drizzle** - ORM TypeScript-first
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth dengan Google OAuth
- **Turborepo** - Sistem build monorepo yang dioptimasi

## Struktur Proyek

```
tk2-pkpl/
├── apps/
│   └── web/         # Aplikasi fullstack (Next.js)
├── packages/
│   ├── ui/          # Shared shadcn/ui components dan styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Konfigurasi & logic authentication
│   └── db/          # Database schema & queries
```

## Arsitektur Autentikasi (dengan Better-Auth)

Better-Auth adalah library autentikasi yang menggunakan pendekatan **cookie-based session management**. Berikut cara kerja internal Better-Auth:

### Model Data Session

Better-Auth menggunakan 4 tabel utama di database:

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email UK
        boolean emailVerified
        string image
        timestamp createdAt
        timestamp updatedAt
    }
    
    SESSION {
        string id PK
        timestamp expiresAt
        string token UK
        timestamp createdAt
        timestamp updatedAt
        string ipAddress
        string userAgent
        string userId FK
    }
    
    ACCOUNT {
        string id PK
        string accountId
        string providerId
        string userId FK
        string accessToken
        string refreshToken
        string idToken
        timestamp accessTokenExpiresAt
        timestamp refreshTokenExpiresAt
        string scope
        string password
        timestamp createdAt
        timestamp updatedAt
    }
    
    VERIFICATION {
        string id PK
        string identifier
        string value
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER ||--o{ SESSION : "has"
    USER ||--o{ ACCOUNT : "has"
    USER ||--o{ VERIFICATION : "has"
```

### Alur Autentikasi Lengkap

#### 1. Login dengan Google OAuth

```mermaid
sequenceDiagram
    participant User as Browser
    participant Next as Next.js App
    participant Google as Google OAuth
    participant Auth as Better-Auth
    participant DB as PostgreSQL

    User->>Next: Klik "Login dengan Google"
    Next->>Google: Redirect ke Google OAuth Consent
    Note over Google: User memberikan izin akses<br/>email, profile, dll
    
    Google->>Next: Callback dengan authorization code<br/>/api/auth/callback/google
    Next->>Auth: Verifikasi token & buat session
    Auth->>DB: Simpan/update user & account
    Auth->>DB: Buat session record
    Auth-->>User: Set session cookie<br/>(httpOnly, secure, signed)
    User->>Next: Akses /dashboard dengan cookie
    Next->>Auth: Validasi cookie + fetch session
    Auth->>DB: Cek session masih valid?
    DB-->>Auth: Session data
    Auth-->>Next: User ter-autentikasi
    Next-->>User: Tampilkan halaman dashboard
```

#### 2. Session Management (Stateless Verification)

Better-Auth menggunakan pendekatan **stateless session** - cookie ditandatangani secara kriptografis sehingga validasi session tidak memerlukan query database setiap saat:

```mermaid
flowchart LR
    A[Request dengan<br/>Session Cookie] --> B{Cookie Signature<br/>Valid?}
    B -->|Ya| C{Session<br/>Expired?}
    B -->|Tidak| D[UNAUTHORIZED<br/>Redirect /login]
    C -->|Tidak| E[Ambil user data<br/>dari cookie payload]
    E --> F[Optional: Cek ke DB<br/>untuk data real-time]
    F --> G[Allow Access<br/>Lakukan operasi]
    C -->|Ya| D
```

**Keuntungan Statless Session:**
- Tidak perlu query database untuk setiap request
- Lebih cepat karena payload session sudah ada di cookie
- Bisa discale tanpa shared session store

#### 3. Proteksi Route

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js<br/>Middleware
    participant Auth as Better-Auth<br/>getSessionCookie
    participant Page as Dashboard<br/>Page Component

    Browser->>Next: GET /dashboard
    Next->>Auth: Cek session cookie
    Auth-->>Next: Session valid?
    
    alt Session Tidak Ada / Invalid
        Next-->>Browser: 302 Redirect ke /login
    end
    
    alt Session Valid
        Next->>Page: Render dengan session data
        Page->>Auth: auth.api.getSession<br/>(headers)
        Auth->>Auth: Decode & verify cookie
        Auth->>Auth: Return user data
        Page-->>Browser: Render dashboard<br/>dengan user info
    end
```

### Konfigurasi Better-Auth

File: `packages/auth/src/index.ts`

```typescript
export const auth = betterAuth({
  // Adapter database (Drizzle ORM + PostgreSQL)
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  
  // Origin yang dipercaya untuk CORS
  trustedOrigins: [env.CORS_ORIGIN],
  
  // Social providers (Google OAuth)
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  // Secret untuk signing cookie (min 32 chars)
  secret: env.BETTER_AUTH_SECRET,
  
  // Base URL aplikasi
  baseURL: env.BETTER_AUTH_URL,
  
  // Plugin untuk Next.js (auto cookie handling)
  plugins: [nextCookies()],
});
```

### Schema Database (PostgreSQL)

File: `packages/db/src/schema/auth.ts`

| Tabel | Fungsi |
|-------|--------|
| `user` | Profil user (id, name, email, image, emailVerified) |
| `session` | Session aktif (token, expiresAt, userId, ipAddress, userAgent) |
| `account` | Akun OAuth yang terhubung ke user (providerId, accessToken, refreshToken) |
| `verification` | Token verifikasi email, reset password |

### tRPC Integration dengan Auth

Better-Auth terintegrasi dengan tRPC melalui middleware:

```mermaid
flowchart TB
    subgraph Context
        A[createContext] --> B[auth.api.getSession<br/>headers: req.headers]
        B --> C[Session Object<br/>atau null]
    end
    
    subgraph Procedures
        D[publicProcedure] --> E[Tanpa cek session<br/>Bebas diakses]
        F[protectedProcedure] --> G{Cek session<br/>ada?}
        G -->|Ya| H[Lanjut dengan<br/>ctx.session.user]
        G -->|Tidak| I[throw TRPCError<br/>UNAUTHORIZED]
    end
    
    C --> D
    C --> F
```

## Konfigurasi Environment

Buat file `apps/web/.env` dengan variabel berikut:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=<secret-key-min-32-char>
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Google OAuth (dari Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Google OAuth Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Buat OAuth 2.0 Client ID
3. Tambahkan authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
4. Copy Client ID dan Client Secret ke `.env`

## Memulai Pengembangan

1. Install dependencies:

```bash
bun install
```

2. Setup database:

```bash
bun run db:push
```

3. Jalankan development server:

```bash
bun run dev
```

Buka [http://localhost:3001](http://localhost:3001) untuk melihat aplikasi.

## Available Scripts

- `bun run dev` - Start semua aplikasi dalam development mode
- `bun run build` - Build semua aplikasi
- `bun run dev:web` - Start hanya web application
- `bun run check-types` - Check TypeScript types across all apps
- `bun run db:push` - Push schema changes ke database
- `bun run db:generate` - Generate database client/types
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open database studio UI

## Kustomisasi UI

React web apps dalam stack ini berbagi komponen shadcn/ui melalui `packages/ui`.

- Ubah design tokens dan global styles di `packages/ui/src/styles/globals.css`
- Update komponen primitif di `packages/ui/src/components/*`
- Atur shadcn aliases atau style config di `packages/ui/components.json` dan `apps/web/components.json`

### Menambah Komponen Shared

Jalankan dari root project untuk menambahkan primitif ke shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import komponen shared seperti ini:

```tsx
import { Button } from "@tk2-pkpl/ui/components/button";
```
