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

## Autentikasi & Otorisasi

Proyek ini menggunakan **Better-Auth** - library autentikasi modern yang mengimplementasikan **cookie-based session management** dengan Google OAuth sebagai provider. Berikut dokumentasi komprehensif tentang arsitektur keamanan, OAuth2, session management, dan best practices.

---

### Daftar Isi

1. [Ringkasan Arsitektur](#1-ringkasan-arsitektur)
2. [OAuth2 dengan PKCE](#2-oauth2-dengan-pkce)
3. [Manajemen Session](#3-manajemen-session)
4. [Otorisasi & Access Control](#4-otorisasi--access-control)
5. [Keamanan & Best Practices](#5-keamanan--best-practices)
6. [Serangan & Mitigasi](#6-serangan--mitigasi)
7. [Schema Database](#7-schema-database)
8. [Integrasi tRPC](#8-integrasi-trpc)

---

### 1. Ringkasan Arsitektur

#### 1.1 Diagram Arsitektur High-Level

```mermaid
flowchart TB
    subgraph External
        Google[(Google OAuth Provider)]
    end
    
    subgraph Application
        subgraph Frontend
            Browser[Browser User]
            LoginPage[Login Page /login]
            DashboardPage[Dashboard Page /dashboard]
        end
        
        subgraph Backend
            AuthHandler[Auth Handler /api/auth/*]
            SessionCookie[Session Cookie httpOnly, secure, signed]
            ContextAPI[Context API createContext]
        end
        
        subgraph API
            TRPC[tRPC Router]
            PublicProc[publicProcedure]
            ProtectedProc[protectedProcedure]
        end
        
        subgraph Data
            PostgreSQL[(PostgreSQL Database)]
            UserTable[user]
            SessionTable[session]
            AccountTable[account]
        end
    end
    
    Browser -->|1. signIn.social| LoginPage
    LoginPage -->|2. Redirect| Google
    Google -->|3. Callback /api/auth/callback/google| AuthHandler
    AuthHandler -->|4. Create Session| PostgreSQL
    AuthHandler -->|5. Set Cookie| SessionCookie
    SessionCookie -->|6. Request with Cookie| ContextAPI
    ContextAPI -->|7. getSession| TRPC
    TRPC -->|8. Route| PublicProc
    TRPC -->|9. Route| ProtectedProc
    ProtectedProc -->|10. Access| PostgreSQL
```

#### 1.2 Stack Teknologi Keamanan

| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| Auth Library | Better-Auth v1.5.2 | Cookie-based session management |
| OAuth Provider | Google OAuth 2.0 | Identity provider dengan PKCE |
| Database | PostgreSQL + Drizzle ORM | Persistent session storage |
| API Layer | tRPC | Type-safe API dengan middleware auth |
| Session Storage | Cryptographically signed cookies | Stateless verification |

#### 1.3 Alur Autentikasi Overview

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js App
    participant G as Google OAuth
    participant A as Better-Auth
    participant DB as PostgreSQL

    rect rgb(70, 100, 150)
        Note over U,B: Phase 1: Initiation
        U->>B: Klik Login dengan Google
        B->>N: Akses /login
        N-->>B: Tampilkan login page
    end

    rect rgb(180, 150, 120)
        Note over G,N: Phase 2: OAuth Redirect
        B->>G: Redirect ke Google OAuth client_id, redirect_uri, scope, state, code_challenge
        Note over G: User login & consent
        G-->>B: Authorization Code + state
    end

    rect rgb(80, 140, 100)
        Note over A,DB: Phase 3: Token Exchange & Session Creation
        B->>N: Callback /api/auth/callback/google
        N->>A: Verifikasi code + code_verifier
        A->>G: exchangeCodeForTokens(code, code_verifier)
        G-->>A: access_token, refresh_token, id_token
        A->>DB: Upsert user record
        A->>DB: Create session record
    end

    rect rgb(180, 100, 130)
        Note over A,B: Phase 4: Session Established
        A-->>B: Set-Cookie: session_token (httpOnly, Secure, SameSite)
        B->>N: Request ke /dashboard Cookie: session_token
        N->>A: getSession(headers)
        A-->>N: { user, session }
        N-->>B: Render dashboard
    end
```

---

### 2. OAuth2 dengan PKCE

#### 2.1 Apa itu OAuth 2.0?

OAuth 2.0 adalah **authorization framework** yang memungkinkan aplikasi pihak ketiga mendapatkan akses terbatas ke resource user tanpa harus menyimpan password user. Versi yang digunakan proyek ini adalah **Authorization Code Grant** dengan **PKCE (Proof Key for Code Exchange)**.

#### 2.2 Mengapa Google OAuth?

| Pertimbangan | Penjelasan |
|--------------|------------|
| **Keamanan** | Google menangani keamanan kredensial, 2FA, suspicious activity detection |
| **Trust** | User lebih percaya login dengan Google yang sudah mereka percaya |
| **Kompleksitas** | Tidak perlu implementasi password reset, email verification, dll |
| **Compliance** | Mudah comply dengan GDPR, karena Google sudah compliant |

#### 2.3 OAuth 2.0 Authorization Code Flow dengan PKCE

PKCE adalah mekanisme keamanan yang **wajib** untuk client aplikasi publik (SPAs, mobile apps) untuk mencegah **authorization code interception attack**.

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js App
    participant G as Google OAuth Server

    rect rgb(70, 100, 150)
        Note over B,N: Step 1-2: Generate PKCE Code Verifier & Challenge
        N->>N: Generate random code_verifier 43-128 characters
        N->>N: SHA256 hash of code_verifier
        N->>N: Base64URL encode to get code_challenge
    end

    rect rgb(180, 150, 120)
        Note over B,G: Step 3: Authorization Request
        B->>G: GET /authorize? client_id response_type=code redirect_uri scope=openid profile email state={csrf_token} code_challenge={challenge} code_challenge_method=S256
    end

    rect rgb(100, 140, 80)
        Note over G,B: Step 4-5: User Authentication
        G->>G: Display consent screen App wants access to: Email Profile
        U->>G: User clicks Allow
    end

    rect rgb(160, 80, 140)
        Note over G,N: Step 6: Authorization Code Issued
        G-->>B: 302 Redirect to redirect_uri? code={auth_code}&state={csrf_token}
    end

    rect rgb(100, 80, 160)
        Note over B,N: Step 7-8: Exchange Code for Tokens
        B->>N: POST /token grant_type=authorization_code code={auth_code} code_verifier={original_verifier} client_id redirect_uri
        N->>G: Verify code_verifier matches
        G-->>N: access_token refresh_token id_token expires_in
    end

    Note over N: Store tokens securely
```

#### 2.4 Detail Parameter OAuth

**Authorization Request Parameters:**

| Parameter | Nilai | Deskripsi |
|-----------|-------|-----------|
| `client_id` | `GOOGLE_CLIENT_ID` | Identitas aplikasi di Google |
| `response_type` | `code` | Request authorization code |
| `redirect_uri` | `/api/auth/callback/google` | Endpoint callback |
| `scope` | `openid profile email` | Permissions yang diminta |
| `state` | Random CSRF token | Protection against CSRF |
| `code_challenge` | Base64URL(SHA256(verifier)) | PKCE challenge |
| `code_challenge_method` | `S256` | SHA256 hash method |

**Token Response:**

```json
{
  "access_token": "ya29.a0AfH6...",
  "expires_in": 3599,
  "refresh_token": "1//0gCy...",
  "scope": "openid profile email",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### 2.5 Mengapa PKCE Penting?

Tanpa PKCE, attacker bisa mencuri authorization code melalui:

```mermaid
flowchart LR
    A[Attacker] -->|1. Setup malicious site| M[Malicious Site]
    M -->|2. Victim visits| M
    M -->|3. Redirect to legitimate OAuth with attacker's callback| G[Google]
    G -->|4. Victim authenticates & consents| G
    G -->|5. Redirect with code to attacker's server| M
    M -->|6. Steal authorization code| A
    A -->|7. Exchange code for tokens| G
    G -->|8. Attacker gets tokens| A
```

**PKCE prevents this by requiring the original code_verifier that only the legitimate client knows.**

#### 2.6 Scope dan Izin Akses

Google OAuth scopes yang digunakan:

| Scope | Akses yang Diberikan |
|-------|---------------------|
| `openid` | OpenID Connect authentication |
| `profile` | Nama, foto profil, URL profile |
| `email` | Alamat email yang terverifikasi |

**Catatan:** Scope `https://www.googleapis.com/auth/calendar` atau scope lain **tidak di-request** karena tidak diperlukan aplikasi ini.

---

### 3. Manajemen Session

#### 3.1 Arsitektur Session

Proyek ini menggunakan **signed cookie session** dengan PostgreSQL sebagai backing store. Ini berbeda dari pure stateless JWT karena:

| Aspek | Signed Cookie Session | Pure JWT |
|-------|----------------------|----------|
| **Storage** | Cookie + DB | Cookie only |
| **Revocation** | Immediate (DB delete) | Must use blocklist |
| **Server Check** | Optional per-request | No |
| **Cookie Size** | Small (session ID only) | Larger (full claims) |

#### 3.2 Cookie Security Attributes

```mermaid
flowchart TB
    A[Session Cookie] --> B[secure]
    A --> C[httpOnly]
    A --> D[sameSite]
    A --> E[path]
    A --> F[domain]
    A --> G[expires]

    B --> B1[✅ HTTPS only - Tidak dikirim via HTTP]
    C --> C1[✅ No JS Access - Prevent XSS theft]
    D --> D2[✅ CSRF Protection - strict atau lax]
    E --> E1[✅ Path restriction - /api/*]
    F --> F1[✅ Origin only - Tidak ada subdomain leak]
    G --> G1[✅ Expiration - 7 days default]
```

**Implementasi di Better-Auth:**

Better-Auth secara otomatis mengset cookie dengan atribut yang aman melalui plugin `nextCookies()`:

```typescript
//packages/auth/src/index.ts
export const auth = betterAuth({
  // ... config
  plugins: [nextCookies()], // Auto handles cookie security
});
```

**Hasil cookie yang di-set:**

```
Set-Cookie: better-auth.session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
  Path=/; 
  HttpOnly; 
  Secure; 
  SameSite=Lax; 
  Max-Age=604800
```

#### 3.3 Session Lifecycle State Machine

```mermaid
stateDiagram
    [*] --> Created: User signs in
    Created --> Active: Cookie set in browser
    Active --> Active: Client requests with valid cookie
    Active --> Validating: Server receives request
    Validating --> Active: Session valid, Token not expired
    Validating --> Expired: Token expired
    Validating --> Invalid: Signature mismatch
    Expired --> [*]: Session deleted
    Invalid --> [*]: Session deleted
    Active --> Refreshed: Token refreshed
    Refreshed --> Active: New cookie issued
    Active --> Revoked: User logs out
    Revoked --> [*]: Session deleted
```

#### 3.4 Session Validation Flow (Stateless dengan DB Check)

```mermaid
flowchart TD
    A[Incoming Request] --> B{Parse Cookie}
    B -->|Invalid Format| E[Return 401]
    B -->|Valid Format| C{Cryptographic Signature Valid?}
    C -->|No| E
    C -->|Yes| D{Session Expired?}
    D -->|Yes| F[Return 401 Session Expired]
    D -->|No| G{User Still Exists in DB?}
    G -->|No| H[Return 401 User Deleted]
    G -->|Yes| I{IP Address Changed?}
    I -->|Yes| J[Optional: Log Suspicious Activity]
    I -->|No| K[Allow Access Return Session Data]
    
    style E fill:#ff6b6b,color:#fff
    style F fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style K fill:#51cf66,color:#fff
```

**Keuntungan pendekatan ini:**

1. **Tidak perlu query DB untuk setiap request** - Signature validation cukup untuk kebanyakan kasus
2. **DB check hanya untuk data real-time** - Cek apakah user masih ada, session belum di-revoke
3. **Bisa discale horizontally** - Karena signature bisa di-verify tanpa shared state

#### 3.5 Session Data Structure

Cookie payload berisi data session yang di-sign:

```typescript
// Simplified session payload structure
interface SessionPayload {
  sub: string;           // User ID
  iat: number;          // Issued at (timestamp)
  exp: number;          // Expires at (timestamp)
  jti: string;          // Unique session ID
  ip?: string;          // IP address (optional)
  ua?: string;          // User agent (optional)
}

// Signed with HMAC-SHA256 using BETTER_AUTH_SECRET
// Never contains: password, access tokens, refresh tokens
```

#### 3.6 Referensi Session Table

```mermaid
erDiagram
    SESSION ||--o{ USER : references
    SESSION {
        string id PK
        string token UK
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
        string ipAddress
        string userAgent
        string userId FK
    }
```

#### 3.7 Logout Implementation

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js App
    participant A as Better-Auth
    participant DB as PostgreSQL

    U->>B: Klik Logout
    B->>N: POST /api/auth/signout
    N->>A: auth.api.signOut()
    A->>DB: Delete session record
    DB-->>A: Session deleted
    A-->>B: Clear-Cookie: better-auth.session_token
    N-->>B: Redirect to /login
    B->>N: GET /login
    N-->>B: Show login page
```

**Keamanan logout:**

- Session di-DB dihapus (tidak bisa di-reuse)
- Cookie di-clear dari browser
- Tidak perlu menunggu expire

---

### 4. Otorisasi & Access Control

#### 4.1 Model Otorisasi

Proyek ini mengimplementasikan **resource-based authorization** dengan **ownership model** dan **role-based access control (RBAC)**:

```mermaid
flowchart TB
    A[Resource] -->|belongs to| U[User]
    A -->|has| P[Permissions]
    
    subgraph Ownership Check
        R[Resource Request] --> C{creatorId === session.user.id?}
        C -->|Yes| AL[Allow Access]
        C -->|No| D{Is Admin?}
        D -->|Yes| AL
        D -->|No| DENY[DENY Access - 403 FORBIDDEN]
    end
    
    U --> C
    P -->|read| AL
    P -->|write| AL
    P -->|delete| AL
```

#### 4.2 Procedure Types

| Procedure | Auth Required | Use Case |
|-----------|--------------|----------|
| `publicProcedure` | ❌ Tidak | Health check, public data |
| `protectedProcedure` | ✅ Ya | User-specific operations |
| `adminProcedure` | ✅ Ya + Role Admin | Admin operations |

**Implementasi middleware (`packages/api/src/index.ts`):**

```typescript
// publicProcedure - tidak ada validasi session
export const publicProcedure = t.procedure;

// protectedProcedure - wajib ada session
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No valid session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

// adminProcedure - wajib session + role admin
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as { role?: string };
  if (user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});
```

#### 4.3 User Roles

Sistem menggunakan enum role dengan dua nilai:

| Role | Deskripsi | Akses |
|------|-----------|-------|
| `user` | User biasa | Membuat, mengedit, menghapus card miliknya sendiri |
| `admin` | Administrator | Mengelola theme website, melihat semua user, mengubah role user |

**Schema role di database (`packages/db/src/schema/auth.ts`):**

```typescript
export const roleEnum = pgEnum("role", ["user", "admin"]);

// Dalam user table:
role: roleEnum("role").default("user").notNull(),
```

#### 4.4 Authorization Decision Tree

```mermaid
flowchart TD
    A[API Request Received] --> B{Session Valid?}
    B -->|No| E[Return 401 UNAUTHORIZED]
    B -->|Yes| C{User Exists?}
    C -->|No| E
    C -->|Yes| D{Resource Requested?}
    
    D -->|No Resource| F{Is Admin Procedure?}
    F -->|Yes| G{Has Admin Role?}
    F -->|No| K[Allow Non-resource operation]
    G -->|Yes| H[Allow Admin operation]
    G -->|No| J[Return 403 FORBIDDEN]
    
    D -->|Yes Resource| L{Is Owner?}
    L -->|Yes| M[Allow CRUD operation]
    L -->|No| N{Is Admin?}
    N -->|Yes| M
    N -->|No| J
    
    style E fill:#ff6b6b,color:#fff
    style J fill:#ffa94d,color:#fff
    style K fill:#51cf66,color:#fff
    style H fill:#51cf66,color:#fff
    style M fill:#51cf66,color:#fff
```

#### 4.5 Contoh: Card Ownership Authorization

Berikut contoh authorization di `packages/api/src/routers/card.ts`:

```typescript
// Mutation: Update Card
update: protectedProcedure
  .input(z.object({ id: z.number(), title: z.string().optional() }))
  .mutation(async ({ ctx, input }) => {
    // 1. Cek card exists
    const existing = await db.query.card.findFirst({
      where: eq(card.id, input.id),
    });
    
    if (!existing) {
      throw new Error("Card not found"); // 404-like
    }
    
    // 2. CEK OWNERSHIP - Resource-level authorization
    if (existing.creatorId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to update this card",
      });
    }
    
    // 3. Perform update
    return await db.update(card).set(input).where(eq(card.id, input.id));
  }),

// Mutation: Delete Card (sama pattern-nya)
delete: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const existing = await db.query.card.findFirst({
      where: eq(card.id, input.id),
    });
    
    if (!existing) throw new Error("Card not found");
    
    // Ownership check
    if (existing.creatorId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN", 
        message: "Not authorized to delete this card",
      });
    }
    
    return await db.delete(card).where(eq(card.id, input.id));
  }),
```

#### 4.6 Pattern Otorisasi yang Digunakan

| Pattern | Deskripsi | Contoh |
|---------|-----------|--------|
| **Ownership Check** | Pemilik resource boleh modify | `if (resource.creatorId !== user.id)` |
| **Role Check** | Role tertentu boleh akses | `if (user.role !== 'admin')` |

---

### 4.7 Admin Theme Management

#### 4.7.1 Arsitektur Theme Management

Admin memiliki kemampuan khusus untuk mengelola tema website secara global. Theme yang dipilih berlaku untuk semua user.

```mermaid
flowchart LR
    A[Admin User] -->|1. Pilih Theme| B[Theme Settings Panel]
    B -->|2. setTheme mutation| C[tRPC Admin Router]
    C -->|3. Update DB| D[(PostgreSQL)]
    D -->|4. Theme Updated| E[Semua User]
    
    subgraph Theme Info
        F[themeChangedBy: Admin Name]
        G[themeUpdatedAt: Timestamp]
    end
    
    B --> F
    C --> G
```

#### 4.7.2 Tema yang Tersedia

Proyek menyediakan 5 tema preset dari [tweakcn.com](https://tweakcn.com):

| Tema | Deskripsi | Font Sans | Font Serif | Font Mono |
|------|-----------|-----------|------------|-----------|
| **bold-tech** | Tema modern dengan aksen ungu | Roboto | Playfair Display | Fira Code |
| **amber-minimal** | Tema minimal dengan nuansa amber | Inter | Source Serif 4 | JetBrains Mono |
| **bubblegum** | Tema playful dengan warna-warni | Poppins | Lora | Fira Code |
| **darkmatter** | Tema monokromatik gelap | Geist Mono | serif | JetBrains Mono |
| **notebook** | Tema klasik seperti buku catatan | Architects Daughter | Merriweather | Courier Prime |

#### 4.7.3 Theme Schema

Theme disimpan di tabel `site_settings` (`packages/db/src/schema/site-settings.ts`):

```typescript
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global"),
  theme: text("theme").default("bold-tech").notNull(),
  mode: text("mode").default("light").notNull(),
  themeUpdatedAt: timestamp("theme_updated_at").defaultNow().notNull(),
  themeChangedBy: text("theme_changed_by").default("System"),
});
```

#### 4.7.4 Admin Router API

File: `packages/api/src/routers/admin.ts`

**Endpoints tema:**

| Endpoint | Procedure | Deskripsi |
|----------|-----------|-----------|
| `getTheme` | `publicProcedure` | Ambil tema aktif (public) |
| `setTheme` | `adminProcedure` | Ubah tema website (admin only) |

**getTheme Response:**

```typescript
{
  theme: "bold-tech" | "amber-minimal" | "bubblegum" | "darkmatter" | "notebook",
  mode: "light" | "dark",
  themeUpdatedAt: Date,
  themeChangedBy: string // Nama admin yang mengubah
}
```

**setTheme Mutation:**

```typescript
// Input
{
  theme: "bold-tech" | "amber-minimal" | "bubblegum" | "darkmatter" | "notebook",
  mode: "light" | "dark"
}

// Effect
// - Update theme di database
// - Set themeChangedBy = nama admin
// - Set themeUpdatedAt = waktu sekarang
```

#### 4.7.5 Alur Theme Switching

```mermaid
sequenceDiagram
    participant A as Admin
    participant B as Theme Settings UI
    participant C as tRPC API
    participant D as PostgreSQL
    participant E as Regular User

    A->>B: Pilih tema baru
    B->>C: setTheme({ theme: "bubblegum", mode: "dark" })
    C->>C: Verify admin role
    C->>D: UPDATE site_settings SET theme="bubblegum", mode="dark"
    D-->>C: Success
    C-->>B: { success: true, themeChangedBy: "Admin Name" }
    B->>B: Update UI & Query Cache
    Note over E: Theme berubah instantly<br/>tanpa refresh
```

#### 4.7.6 Menambah Admin

Untuk menjadikan user sebagai admin, bisa dilakukan melalui API:

```typescript
// Di admin router (packages/api/src/routers/admin.ts)
setUserRole: adminProcedure
  .input(z.object({
    userId: z.string(),
    role: z.enum(["user", "admin"]),
  }))
  .mutation(async ({ input }) => {
    await db
      .update(user)
      .set({ role: input.role })
      .where(eq(user.id, input.userId));
    return { success: true };
  }),
```

---

### 5. Keamanan & Best Practices

#### 5.1 Cookie Security Checklist

| Attribut | Nilai | Mengapa Penting |
|----------|-------|----------------|
| `HttpOnly` | `true` | Mencegah JavaScript membaca cookie (XSS protection) |
| `Secure` | `true` | Cookie hanya dikirim via HTTPS |
| `SameSite` | `Lax` atau `Strict` | Mencegah CSRF attack |
| `Path` | `/` | Batasi scope cookie |
| `Max-Age` | `604800` (7 days) | Expiration untuk membatasi exposure |

**Implementasi di Better-Auth:**

```typescript
//better-auth otomatis meng-set atribut yang aman
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET, // Min 32 characters
  plugins: [nextCookies()],
});
```

#### 5.2 CSRF (Cross-Site Request Forgery) Protection

**Apa itu CSRF?**

```mermaid
sequenceDiagram
    participant U as User
    participant M as Malicious Site
    participant B as Browser
    participant A as App

    U->>M: Visit malicious page
    M->>B: Hidden form auto-submit
    B->>A: POST /api/cards/create Cookie: user's session
    A->>A: Execute action as authenticated user
```

**Mitigasi yang digunakan proyek ini:**

1. **SameSite Cookie** - Browser memblokir cross-site request
2. **State Parameter di OAuth** - CSRF token saat login
3. **GET vs POST distinction** - State-changing operations harus POST

#### 5.3 XSS (Cross-Site Scripting) Prevention

**Mitigasi yang digunakan:**

| Technique | Implementasi |
|-----------|--------------|
| **Content Security Policy** | Browser policy untuk block inline scripts |
| **HttpOnly Cookies** | Token tidak bisa di akses via JavaScript |
| **Output Encoding** | React secara default meng-encode output |
| **Input Validation** | Zod schema validation di tRPC |

#### 5.4 Session Fixation Prevention

Session fixation attack: attacker menetapkan session ID korban ke nilai yang diketahui.

**Mitigasi:**

```mermaid
flowchart LR
    A[Login Flow] --> B[Generate New Session ID]
    B --> C[Set New Cookie with New ID]
    C --> D[Invalidate Old Session ID]

    style B fill:#51cf66,color:#fff
    style C fill:#51cf66,color:#fff
```

Better-Auth secara otomatis membuat session ID baru saat login.

#### 5.5 Rate Limiting

Implementasi rate limiting menggunakan sliding window algorithm dengan in-memory storage:

| Endpoint | Batas | Waktu Window |
|----------|-------|--------------|
| `/api/auth/*` | 100 attempts | 5 minutes |

**Implementasi:**

- File: `apps/web/src/proxy.ts`
- Menggunakan Map in-memory dengan timestamps
- Cleanup otomatis setiap 1000 entries
- Headers response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Mengembalikan 429 Too Many Requests ketika limit exceeded

#### 5.6 Security Headers

Headers keamanan yang dikonfigurasi di `apps/web/next.config.ts`:

```typescript
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'" },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ],
  },
]
```

#### 5.7 Environment Variables Security

| Variable | Keterangan | Storage |
|----------|-----------|---------|
| `BETTER_AUTH_SECRET` | Min 32 chars, random | .env (dev), Secret Manager (prod) |
| `GOOGLE_CLIENT_SECRET` | High entropy | .env (dev), Secret Manager (prod) |
| `DATABASE_URL` | With SSL mode | .env (dev), Secret Manager (prod) |



---

### 6. Serangan & Mitigasi

#### 6.1 Attack Vectors Overview

```mermaid
flowchart TB
    A[Attack Vectors] --> B[XSS]
    A --> C[CSRF]
    A --> D[Session Hijacking]
    A --> E[OAuth Code Theft]
    A --> F[Brute Force]
    A --> G[Credential Stuffing]

    B --> B1[Steal cookies via injected scripts]
    B1 --> B2[HttpOnly cookies block access]
    
    C --> C1[Trigger actions via cross-site forms]
    C1 --> C2[SameSite cookies block cross-site]
    
    D --> D1[Intercept session via network]
    D1 --> D2[Secure + HTTPS prevents eavesdropping]
    
    E --> E1[Steal auth code via man-in-middle]
    E1 --> E2[PKCE prevents code reuse]
    
    F --> F1[Try many passwords rapidly]
    F1 --> F2[Rate limiting blocks rapid attempts]
    
    G --> G1[Use leaked credentials from other sites]
    G1 --> G2[OAuth prevents password reuse]
```

#### 6.2 Detail Serangan dan Mitigasi

| Serangan | Deskripsi | Mitigasi di Proyek Ini |
|----------|-----------|----------------------|
| **XSS** | Inject malicious scripts | HttpOnly cookies, CSP headers |
| **CSRF** | Forge requests from other sites | SameSite cookies, state parameter |
| **Session Hijacking** | Steal session token | Secure cookies, HTTPS only |
| **OAuth Code Interception** | Steal auth code | PKCE required |
| **Man-in-the-Middle** | Eavesdrop on traffic | HTTPS enforced, Secure cookies |
| **Brute Force** | Guess credentials rapidly | Rate limiting (implemented), OAuth (no passwords) |

#### 6.3 Security yang Telah Diimplementasi

**Fitur keamanan yang sudah terimplementasi:**

- ✅ Cookie dengan HttpOnly, Secure, SameSite attributes
- ✅ OAuth2 dengan PKCE
- ✅ Session signed cryptographically
- ✅ HTTPS enforced untuk database connection
- ✅ Ownership-based authorization
- ✅ Rate Limiting (10 requests/15 menit untuk `/api/auth/*`)
- ✅ Security Headers (X-Frame-Options, CSP, HSTS, dll)
- ✅ Audit Logging untuk auth events

---

### 7. Schema Database

#### 7.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : has
    USER ||--o{ VERIFICATION : has
    USER ||--o{ AUDIT_LOG : has

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
        string token UK
        timestamp expiresAt
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

    AUDIT_LOG {
        string id PK
        string action
        string userId FK
        string ipAddress
        string userAgent
        json metadata
        timestamp createdAt
    }
```

#### 7.2 Schema Reference

File: `packages/db/src/schema/auth.ts`

| Tabel | Primary Key | Unique Keys | Indexes | Foreign Keys |
|-------|------------|-------------|---------|--------------|
| `user` | `id` | `email` | - | - |
| `session` | `id` | `token` | `session_userId_idx` | `userId → user.id` |
| `account` | `id` | - | `account_userId_idx` | `userId → user.id` |
| `verification` | `id` | - | `verification_identifier_idx` | - |
| `audit_log` | `id` | - | - | - |

#### 7.3 Security Considerations Schema

| Field | Security Note |
|-------|--------------|
| `session.token` | Tidak berisi data sensitif, hanya reference |
| `account.accessToken` | Di-encrypt oleh Better-Auth sebelum storage |
| `account.refreshToken` | Di-encrypt oleh Better-Auth sebelum storage |
| `account.password` | NULL untuk OAuth accounts (reserved untuk future use) |
| `verification.value` | Token random, expirable |

---

### 8. Integrasi tRPC

#### 8.1 Context Creation Flow

```mermaid
flowchart TB
    A[Incoming Request] --> B[Next.js App Router]
    B --> C[createContext]
    C --> D[Extract headers cookie, authorization]
    D --> E[auth.api.getSession]
    E --> F{Session Valid?}
    F -->|Yes| G[Return ctx with session]
    F -->|No| H[Return ctx with session=null]
    G --> I[tRPC Procedures]
    H --> I
```

**Implementasi (`packages/api/src/context.ts`):**

```typescript
export async function createContext(req: NextRequest) {
  // Extract session from request headers (cookies)
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    auth: null,
    session, // Contains { user, session } if valid, null if not
  };
}
```

#### 8.2 Procedure Types

```mermaid
flowchart LR
    subgraph Procedures
        P1[publicProcedure]
        P2[protectedProcedure]
    end
    
    subgraph Access
        A1[Anyone can access No auth required]
        A2[Must be logged in Session required]
    end
    
    P1 --> A1
    P2 --> A2
```

| Procedure | Context | Use Case |
|-----------|---------|----------|
| `publicProcedure` | `ctx.session = null` | Public data, health checks |
| `protectedProcedure` | `ctx.session = { user, session }` | User-specific operations |

#### 8.3 Error Handling

```mermaid
flowchart TD
    A[API Request] --> B{Session exists?}
    B -->|No| E[Throw TRPCError UNAUTHORIZED]
    B -->|Yes| C{User authorized for resource?}
    C -->|No| F[Throw TRPCError FORBIDDEN]
    C -->|Yes| D[Execute mutation/query]
    D --> G[Return result]
    E --> H[Return 401 to client]
    F --> I[Return 403 to client]
    
    style E fill:#ff6b6b,color:#fff
    style F fill:#ffa94d,color:#fff
    style G fill:#51cf66,color:#fff
```

**Contoh Error Response:**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "cause": "No valid session"
  }
}
```

---

### Referensi & Resources

- [RFC 6749 - OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Google OAuth2 Best Practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices)
- [Better-Auth Documentation](https://www.better-auth.com/)

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
