"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./_actions/manage-notifications";
import { Check, CheckCheck, Bell, BellRing, Search, Calendar, User, Users } from "lucide-react";

type N = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: any;
  audience?: string;
  targetType?: string;
  readAt?: any;
};

export default function ResidentNotificationsPage() {
  const [rows, setRows] = useState<N[]>([]);
  const [filteredRows, setFilteredRows] = useState<N[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth!.onAuthStateChanged((user: { uid: string } | null) => {
      setCurrentUser(user);
      if (user) {
        // Listener en tiempo real para notificaciones del usuario
        const unsubscribeNotifications = onSnapshot(
          query(
            collection(db!, "notifications"),
            where("userId", "==", user.uid)
          ),
          (snapshot) => {
            const notifications = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            // Ordenar por createdAt descendente en el cliente
            notifications.sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || new Date(0);
              const bTime = b.createdAt?.toDate?.() || new Date(0);
              return bTime.getTime() - aTime.getTime();
            });
            setRows(notifications);
          }
        );

        return () => unsubscribeNotifications();
      }
    });
    return () => unsub();
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

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRows(filtered);
  }, [rows, filterStatus, searchTerm]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    // No necesitamos recargar manualmente, el listener se encarga
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    await markAllNotificationsAsRead(currentUser.uid);
    // No necesitamos recargar manualmente, el listener se encarga
  };

  const unreadCount = rows.filter(n => !n.read).length;

  const getNotificationIcon = (notification: N) => {
    if (notification.targetType === "specific") {
      return <User className="h-4 w-4" />;
    } else if (notification.targetType === "all" || notification.audience === "resident") {
      return <Users className="h-4 w-4" />;
    }
    return <Bell className="h-4 w-4" />;
  };

  const getNotificationTypeText = (notification: N) => {
    if (notification.targetType === "specific") {
      return "Personal";
    } else if (notification.targetType === "all") {
      return "Para todos";
    } else if (notification.audience === "resident") {
      return "Para residentes";
    }
    return "General";
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <Bell className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BellRing className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">No leídas</p>
              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Leídas</p>
              <p className="text-2xl font-bold">{rows.length - unreadCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis notificaciones</CardTitle>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRows.map(n => (
            <div
              key={n.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                !n.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-start flex-1">
                  <div className={`p-2 rounded-full ${!n.read ? 'bg-blue-100' : 'bg-muted'}`}>
                    {getNotificationIcon(n)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${!n.read ? 'font-semibold text-black' : ''}`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${!n.read ? 'text-gray-700' : 'text-muted-foreground'}`}>{n.message}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {getNotificationTypeText(n)}
                      </Badge>
                      {n.createdAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(n.createdAt.toDate()).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {n.read && n.readAt && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Leída el {new Date(n.readAt.toDate()).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {n.read ? (
                    <Badge className="bg-green-100 text-green-800">Leída</Badge>
                  ) : (
                    <>
                      <Badge variant="secondary">No leída</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && rows.length > 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron notificaciones con los filtros aplicados.</p>
            </div>
          )}
          {rows.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes notificaciones aún.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Las notificaciones del administrador aparecerán aquí.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
