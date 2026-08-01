import React, { useState } from 'react';
import { FileCode, Database, Server, Layers, Cpu, Box, Terminal, BookOpen, Shield, Code2 } from 'lucide-react';

export const TechnicalArchitectureDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'sqlite' | 'api' | 'docker' | 'electron'>('architecture');

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <FileCode className="w-7 h-7 text-amber-400" />
          <div>
            <h2 className="text-xl font-black text-white">Manual Técnico & Documentación de Arquitectura Enterprise</h2>
            <p className="text-xs text-slate-400">Laravel 12 API, PostgreSQL 16 (Master), SQLite 3 (Offline Sync Engine), OpenAPI 3.0, Docker y Electron (Sin Firebase)</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {[
            { id: 'architecture', label: 'Arquitectura DDD' },
            { id: 'database', label: 'Master PostgreSQL 16' },
            { id: 'sqlite', label: 'SQLite 3 (Modo Offline)' },
            { id: 'api', label: 'API REST / Swagger' },
            { id: 'docker', label: 'Docker & Reverb' },
            { id: 'electron', label: 'Electron Cross-Platform' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Content */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-6">
        {activeTab === 'architecture' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>Arquitectura Modular & Domain-Driven Design (DDD)</span>
            </h3>

            <p className="text-sm leading-relaxed text-slate-300">
              Sotium POS implementa una arquitectura desacoplada basada en Clean Architecture y Domain-Driven Design (DDD) sobre PHP 8.4 y Laravel 12 en el backend, y Vue 3 / React + TypeScript en el frontend.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
              <div>app/</div>
              <div>├── Domain/               # Reglas de negocio puras, Entidades y Objetos Valor</div>
              <div>│   ├── POS/Domain/Entities/Order.php</div>
              <div>│   ├── POS/Domain/ValueObjects/VerifactuHash.php</div>
              <div>│   └── Escandallo/Domain/Services/RecipeCostCalculator.php</div>
              <div>├── Infrastructure/       # Persistencia PostgreSQL, Redis Cache, WebSockets</div>
              <div>│   ├── Repositories/EloquentOrderRepository.php</div>
              <div>│   └── Verifactu/AeatCryptoSigner.php</div>
              <div>├── Application/          # Casos de uso e Interfaces CQRS</div>
              <div>│   ├── Commands/ProcessPaymentCommand.php</div>
              <div>│   └── Queries/GetDailySalesSummaryQuery.php</div>
              <div>└── Http/                 # Controladores API REST y WebSockets (Laravel Reverb)</div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Esquema Entidad-Relación PostgreSQL & Migraciones Laravel</span>
            </h3>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`-- Tablas Principales de Base de Datos PostgreSQL 16
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    seats INT NOT NULL DEFAULT 4,
    pos_x INT NOT NULL DEFAULT 0,
    pos_y INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    occupied_since TIMESTAMP WITH TIME ZONE
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    price_pvp DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    printer_target VARCHAR(50) NOT NULL DEFAULT 'BARRA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE escandallo_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10, 4) NOT NULL
);

CREATE TABLE verifactu_audit_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) UNIQUE NOT NULL,
    aeat_status VARCHAR(50) NOT NULL DEFAULT 'SENT_OK_200'
);`}
            </pre>
          </div>
        )}

        {activeTab === 'sqlite' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Engine de Sincronización SQLite 3 Local para Modo Offline</span>
            </h3>

            <p className="text-sm leading-relaxed text-slate-300">
              Sotium POS incluye un motor de persistencia local relacional en SQLite 3 (vía WebAssembly sql.js / IndexedDB) que permite trabajar al 100% de rendimiento sin conexión a internet. Todas las transacciones se almacenan en la tabla <code className="text-amber-400 font-mono">sync_queue</code> y se sincronizan atómicamente con el servidor PostgreSQL master al recuperar la conexión.
            </p>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-400 overflow-x-auto">
{`-- Esquema de Tabla SQLite 3 Local para Transacciones en Cola (Offline)
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,         -- 'CREATE_ORDER', 'PAYMENT_PROCESSED', 'ARQUEO_Z'
    payload TEXT NOT NULL,        -- JSON cifrado de la transacción
    status TEXT DEFAULT 'PENDING',-- 'PENDING', 'SYNCED', 'FAILED'
    timestamp TEXT NOT NULL
);

-- Endpoint de Sincronización Servidor Laravel 12 / Express API
POST /api/v1/sync/push
Payload: { "action": "CREATE_ORDER", "payload": { "id": "ord-1002", "total": 48.50, ... } }
Respuesta: 200 OK -> { "syncedAt": "2026-07-30T08:12:00Z", "backendStorage": "PostgreSQL_16_Master_DB" }`}
            </pre>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Code2 className="w-5 h-5" />
              <span>Especificación OpenAPI 3.0 / Swagger REST Endpoints</span>
            </h3>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`openapi: 3.0.3
info:
  title: Sotium POS Enterprise API
  version: 12.4.0
paths:
  /api/v1/tpv/orders:
    post:
      summary: Crear nueva comanda o ticket de venta
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderPayload'
      responses:
        '201':
          description: Ticket procesado y firmado por VeriFactu
  /api/v1/verifactu/sign:
    post:
      summary: Generar firma criptográfica encadenada AEAT
  /api/v1/ai/query:
    post:
      summary: Consulta conversacional al Asistente IA Gemini`}
            </pre>
          </div>
        )}

        {activeTab === 'docker' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Box className="w-5 h-5" />
              <span>Despliegue Multi-Contenedor Docker Compose</span>
            </h3>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-yellow-300 overflow-x-auto">
{`version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - REDIS_HOST=redis
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hostelerp_db
      POSTGRES_USER: root
      POSTGRES_PASSWORD: secret_password
  redis:
    image: redis:7-alpine`}
            </pre>
          </div>
        )}

        {activeTab === 'electron' && (
          <div className="space-y-4 font-sans">
            <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Configuración Electron Builder (Windows .exe & Linux .AppImage / .deb)</span>
            </h3>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
{`// electron-builder.yml
appId: com.hostelerp.app
productName: Sotium POS Enterprise
directories:
  output: build_dist
win:
  target: nsis
  icon: assets/icon.ico
linux:
  target:
    - AppImage
    - deb
  category: Office`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
