import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDiagnosticos } from "@/lib/db";
import type { Diagnostico } from "@/types";
import { Building2, ClipboardCheck, TrendingUp, Users } from "lucide-react";

const AdminDashboard = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);

  useEffect(() => {
    setDiagnosticos(getDiagnosticos());
  }, []);

  const totalEmpresas = new Set(diagnosticos.map((d) => d.empresa)).size;
  const totalDiagnosticos = diagnosticos.length;
  const promedio =
    totalDiagnosticos > 0
      ? Math.round(diagnosticos.reduce((s, d) => s + d.puntaje, 0) / totalDiagnosticos)
      : 0;

  const getBadgeVariant = (puntaje: number) => {
    if (puntaje >= 80) return "success";
    if (puntaje >= 60) return "warning";
    return "danger";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Panel de administración de diagnósticos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas Evaluadas
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalEmpresas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diagnósticos Realizados
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalDiagnosticos}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cumplimiento Promedio
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{promedio}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Diagnósticos Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay diagnósticos realizados aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Cumplimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticos.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.empresa}</TableCell>
                    <TableCell className="text-muted-foreground">{d.email}</TableCell>
                    <TableCell>{d.ciudad}</TableCell>
                    <TableCell>{d.fecha}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getBadgeVariant(d.puntaje)}>
                        {d.puntaje}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
