import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePOS } from '../context/POSContext';
import { Table, Salon, TableStatus } from '../types/pos';
import { TableCard, getStatusConfig } from './floorplan/TableCard';
import { SalonEditorModal } from './floorplan/SalonEditorModal';
import { TableEditorModal } from './floorplan/TableEditorModal';
import { TableActionsModal } from './floorplan/TableActionsModal';
import {
  Layers,
  Settings2,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Search,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Sparkles,
  Edit,
  Trash2,
  Lock,
  RotateCw,
  Copy,
  Link2,
} from 'lucide-react';
import { io } from 'socket.io-client';

export const FloorPlanModule: React.FC = () => {
  const {
    salons,
    selectedSalonId,
    setSelectedSalonId,
    updateTablePosition,
    updateTableStatus,
    selectTableForPOS,
    addSalon,
    updateSalon,
    deleteSalon,
    addTable,
    updateTable,
    duplicateTable,
    deleteTable,
    employees,
  } = usePOS();

  // Mode & Navigation State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isGridSnap, setIsGridSnap] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'ALL'>('ALL');

  // Drag & Drop canvas state
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<Table | null>(null);

  // Modals state
  const [isSalonModalOpen, setIsSalonModalOpen] = useState<boolean>(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [tableToEditInModal, setTableToEditInModal] = useState<Table | null>(null);
  const [actionModalTable, setActionModalTable] = useState<Table | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Socket.io WebSocket connection for realtime synchronization
  useEffect(() => {
    const socket = io();

    socket.on('table:position-changed', (data: { tableId: string; x: number; y: number }) => {
      updateTablePosition(data.tableId, data.x, data.y);
    });

    socket.on('table:status-changed', (data: { tableId: string; status: TableStatus; pax?: number }) => {
      updateTableStatus(data.tableId, data.status, data.pax);
    });

    return () => {
      socket.disconnect();
    };
  }, [updateTablePosition, updateTableStatus]);

  // Active Salon
  const activeSalon = useMemo(() => {
    return salons.find((s) => s.id === selectedSalonId) || salons[0];
  }, [salons, selectedSalonId]);

  // Filtered Tables
  const filteredTables = useMemo(() => {
    if (!activeSalon) return [];
    return activeSalon.tables.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.serverName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeSalon, searchTerm, statusFilter]);

  // Real-time Status Counts for Active Salon
  const statusCounts = useMemo(() => {
    if (!activeSalon) return { total: 0, free: 0, occupied: 0, reserved: 0, bill: 0, cleaning: 0 };
    return {
      total: activeSalon.tables.length,
      free: activeSalon.tables.filter((t) => t.status === 'FREE').length,
      occupied: activeSalon.tables.filter((t) =>
        ['OCCUPIED', 'PENDING_ORDER', 'IN_KITCHEN', 'SERVING', 'WAITING_DESSERT', 'PAYING'].includes(t.status)
      ).length,
      reserved: activeSalon.tables.filter((t) => t.status === 'RESERVED').length,
      bill: activeSalon.tables.filter((t) => t.status === 'BILL_REQUESTED').length,
      cleaning: activeSalon.tables.filter((t) => t.status === 'CLEANING').length,
    };
  }, [activeSalon]);

  // Drag & Drop Mouse Handlers
  const handleMouseDownDrag = useCallback(
    (e: React.MouseEvent, table: Table) => {
      if (!isEditMode || table.isLocked) return;
      e.stopPropagation();
      setDraggingTableId(table.id);
      setSelectedTableForEdit(table);

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoomLevel / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;
        setDragStartOffset({
          x: mouseX - table.x,
          y: mouseY - table.y,
        });
      }
    },
    [isEditMode, zoomLevel]
  );

  const handleMouseMoveCanvas = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!draggingTableId || !canvasRef.current || !activeSalon) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoomLevel / 100;
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      let newX = mouseX - dragStartOffset.x;
      let newY = mouseY - dragStartOffset.y;

      // Snap to Grid (20px)
      if (isGridSnap) {
        const grid = activeSalon.gridSize || 20;
        newX = Math.round(newX / grid) * grid;
        newY = Math.round(newY / grid) * grid;
      }

      // Constrain inside bounds
      const targetTable = activeSalon.tables.find((t) => t.id === draggingTableId);
      const tableW = targetTable?.width || 110;
      const tableH = targetTable?.height || 90;

      newX = Math.max(0, Math.min(activeSalon.width - tableW, newX));
      newY = Math.max(0, Math.min(activeSalon.height - tableH, newY));

      updateTablePosition(draggingTableId, newX, newY);
    },
    [draggingTableId, canvasRef, zoomLevel, dragStartOffset, isGridSnap, activeSalon, updateTablePosition]
  );

  const handleMouseUpCanvas = useCallback(() => {
    if (draggingTableId) {
      setDraggingTableId(null);
    }
  }, [draggingTableId]);

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden select-none">
      {/* TOP CONTROL HEADER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 bg-slate-900 border-b border-slate-800 gap-3 z-20">
        {/* Salon Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
          {salons.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSalonId(s.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                selectedSalonId === s.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{s.name}</span>
              <span className="text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded font-mono">
                {s.tables.length}
              </span>
            </button>
          ))}

          {/* Add Salon Button */}
          <button
            onClick={() => {
              setEditingSalon(null);
              setIsSalonModalOpen(true);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold border border-slate-700/60 transition-all flex items-center space-x-1 whitespace-nowrap"
            title="Añadir Nuevo Salón"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Salón</span>
          </button>
        </div>

        {/* Status Counters Bar */}
        <div className="flex items-center space-x-2 text-[11px] overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold border ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 border-amber-400 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Todas ({statusCounts.total})
          </button>
          <button
            onClick={() => setStatusFilter('FREE')}
            className={`px-2 py-1 rounded-lg font-bold border flex items-center space-x-1 ${
              statusFilter === 'FREE'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Libres ({statusCounts.free})</span>
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-2 py-1 rounded-lg font-bold border flex items-center space-x-1 ${
              statusFilter === 'OCCUPIED'
                ? 'bg-red-500/20 border-red-400 text-red-300'
                : 'bg-red-950/40 border-red-900/60 text-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Ocupadas ({statusCounts.occupied})</span>
          </button>
          <button
            onClick={() => setStatusFilter('RESERVED')}
            className={`px-2 py-1 rounded-lg font-bold border flex items-center space-x-1 ${
              statusFilter === 'RESERVED'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-amber-950/40 border-amber-900/60 text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Reservadas ({statusCounts.reserved})</span>
          </button>
          <button
            onClick={() => setStatusFilter('BILL_REQUESTED')}
            className={`px-2 py-1 rounded-lg font-bold border flex items-center space-x-1 ${
              statusFilter === 'BILL_REQUESTED'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                : 'bg-blue-950/40 border-blue-900/60 text-blue-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Cuenta ({statusCounts.bill})</span>
          </button>
        </div>

        {/* Toolbar & View Mode Toggles */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar mesa / camarero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white w-36 sm:w-48 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Alejar Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-amber-400 font-bold text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Acercar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Snap Grid Toggle */}
          <button
            onClick={() => setIsGridSnap(!isGridSnap)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              isGridSnap
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Ajuste Magnético a Rejilla (20px)"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Edit Salon Button */}
          {isEditMode && (
            <button
              onClick={() => {
                setEditingSalon(activeSalon);
                setIsSalonModalOpen(true);
              }}
              className="p-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-700"
              title="Configurar Salón Actual"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Design Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border ${
              isEditMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>{isEditMode ? 'Guardar Distribución' : 'Diseñar Plano'}</span>
          </button>
        </div>
      </div>

      {/* DESIGN MODE ACTION BAR (Shown when in Edit Mode) */}
      {isEditMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold flex items-center space-x-1 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Modo Editor Visual (Drag & Drop)</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Arrastra mesas para colocarlas • Ajuste magnético 20px
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTableToEditInModal(null);
                setIsTableModalOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs hover:bg-amber-400 flex items-center space-x-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Mesa</span>
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE FLOOR PLAN CANVAS */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        style={{
          width: `${(activeSalon?.width || 1400) * (zoomLevel / 100)}px`,
          height: `${(activeSalon?.height || 900) * (zoomLevel / 100)}px`,
        }}
        className="flex-1 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] overflow-auto p-8 transform-origin-top-left transition-transform duration-75"
      >
        {filteredTables.map((tbl) => (
          <TableCard
            key={tbl.id}
            table={tbl}
            isEditMode={isEditMode}
            isSelectedInEdit={selectedTableForEdit?.id === tbl.id}
            zoomLevel={zoomLevel}
            onSelectTable={(table) => {
              if (isEditMode) {
                setSelectedTableForEdit(table);
                setTableToEditInModal(table);
                setIsTableModalOpen(true);
              } else {
                setActionModalTable(table);
              }
            }}
            onMouseDownDrag={handleMouseDownDrag}
          />
        ))}

        {filteredTables.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3 pointer-events-none">
            <Layers className="w-12 h-12 text-slate-600" />
            <p className="font-bold text-sm">No hay mesas en este salón o filtro.</p>
            {isEditMode && (
              <p className="text-xs text-amber-400/80">Haz clic en &quot;Añadir Mesa&quot; para comenzar el diseño.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: SALON EDITOR */}
      {isSalonModalOpen && (
        <SalonEditorModal
          salon={editingSalon}
          onClose={() => setIsSalonModalOpen(false)}
          onSave={(data) => {
            if (editingSalon) {
              updateSalon(editingSalon.id, data);
            } else {
              addSalon(data);
            }
            setIsSalonModalOpen(false);
          }}
          onDelete={(salonId) => deleteSalon(salonId)}
        />
      )}

      {/* MODAL 2: TABLE DESIGN EDITOR */}
      {isTableModalOpen && (
        <TableEditorModal
          table={tableToEditInModal}
          salonId={selectedSalonId}
          onClose={() => setIsTableModalOpen(false)}
          onSave={(data) => {
            if (tableToEditInModal) {
              updateTable(tableToEditInModal.id, data);
            } else {
              addTable(selectedSalonId, data);
            }
            setIsTableModalOpen(false);
          }}
          onDuplicate={(tableId) => duplicateTable(tableId)}
          onDelete={(tableId) => deleteTable(tableId)}
        />
      )}

      {/* MODAL 3: TABLE SERVICE ACTIONS (SERVICE MODE) */}
      {actionModalTable && (
        <TableActionsModal
          table={actionModalTable}
          salons={salons}
          employees={employees}
          onClose={() => setActionModalTable(null)}
          onOpenPOS={(tableId) => selectTableForPOS(tableId)}
        />
      )}
    </div>
  );
};
