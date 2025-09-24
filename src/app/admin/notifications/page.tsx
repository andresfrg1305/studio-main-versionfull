"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { NotificationForm } from "./_components/form";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, getDoc, doc, onSnapshot } from "firebase/firestore";
import { markNotificationAsRead, deleteNotification } from "./_actions/manage-notifications";
import { Check, Trash2, Users, User, Search, Filter } from "lucide-react";

type Row = {
  id: string;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt?: any;
  userName?: string;
  audience?: string;
  targetType?: string;
  totalRecipients?: number;
};

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [residents, setResidents] = useState<{ id: string; fullName: string; email: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [filterAudience, setFilterAudience] = useState<"all" | "specific" | "broadcast">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadResidents = async () => {
    const profSnap = await getDocs(query(collection(db!, "profiles"), where("role", "==", "resident")));
    setResidents(profSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  };

  const loadNotifications = async () => {
    const notifSnap = await getDocs(query(collection(db!, "notifications"), orderBy("createdAt", "desc")));
    const items: Row[] = [];
    for (const d of notifSnap.docs) {
      const n = d.data() as any;
      let userName = "";
      if (n.userId) {
        const u = await getDoc(doc(db!, "profiles", n.userId));
        userName = u.exists() ? ((u.data() as any).fullName || (u.data() as any).email) : "";
      }
      items.push({ id: d.id, ...n, userName });
    }
    setRows(items);
  };

  useEffect(() => {
    loadResidents();
    
    // Listener en tiempo real para notificaciones
    const unsubscribe = onSnapshot(
      query(collection(db!, "notifications"), orderBy("createdAt", "desc")),
      async (snapshot) => {
        const items: Row[] = [];
        for (const d of snapshot.docs) {
          const n = d.data() as any;
          let userName = "";
          if (n.userId) {
            const u = await getDoc(doc(db!, "profiles", n.userId));
            userName = u.exists() ? ((u.data() as any).fullName || (u.data() as any).email) : "";
          }
          items.push({ id: d.id, ...n, userName });
        }
        setRows(items);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtrar notificaciones
  useEffect(() => {
    let filtered = rows;

    // Filtro por estado de lectura
    if (filterStatus !== "all") {
      filtered = filtered.filter(row =>
        filterStatus === "read" ? row.read : !row.read
      );
    }

    // Filtro por audiencia
    if (filterAudience !== "all") {
      filtered = filtered.filter(row => {
        if (filterAudience === "specific") {
          return row.targetType === "specific";
        } else if (filterAudience === "broadcast") {
          return row.targetType === "all" || row.audience === "resident";
        }
        return true;
      });
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.userName && row.userName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRows(filtered);
  }, [rows, filterStatus, filterAudience, searchTerm]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    // No necesitamos recargar manualmente, el listener se encarga
  };

  const handleDelete = async (notificationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta notificación?")) {
      await deleteNotification(notificationId);
      // No necesitamos recargar manualmente, el listener se encarga
    }
  };

  const getAudienceInfo = (row: Row) => {
    if (row.targetType === "specific") {
      return { icon: User, text: `Específico: ${row.userName}`, variant: "outline" as const };
    } else if (row.targetType === "all") {
      return { icon: Users, text: `Todos (${row.totalRecipients || 0})`, variant: "default" as const };
    } else if (row.audience === "resident") {
      return { icon: Users, text: `Residentes (${row.totalRecipients || 0})`, variant: "secondary" as const };
    }
    return { icon: Users, text: "Desconocido", variant: "outline" as const };
  };

  return (
    <div className="space-y-6">
      <NotificationForm residents={residents} />

      <Card>
        <CardHeader>
          <CardTitle>Historial de notificaciones</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="read">Leídas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAudience} onValueChange={(v: any) => setFilterAudience(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="specific">Específicas</SelectItem>
                  <SelectItem value="broadcast">Masivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRows.map((n) => {
            const audienceInfo = getAudienceInfo(n);
            const AudienceIcon = audienceInfo.icon;
            
            return (
              <div key={n.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex gap-3 items-start flex-1">
                  <Avatar>
                    <AvatarFallback>{(n.userName || "A").slice(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{n.message}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={audienceInfo.variant} className="text-xs">
                        <AudienceIcon className="h-3 w-3 mr-1" />
                        {audienceInfo.text}
                      </Badge>
                      {n.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.createdAt.toDate()).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {n.read ? (
                    <Badge className="bg-green-100 text-green-800">Leída</Badge>
                  ) : (
                    <Badge variant="secondary">No leída</Badge>
                  )}
                  <div className="flex gap-1">
                    {!n.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(n.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredRows.length === 0 && rows.length > 0 && (
            <p className="text-muted-foreground text-center py-8">No se encontraron notificaciones con los filtros aplicados.</p>
          )}
          {rows.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No hay notificaciones aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
