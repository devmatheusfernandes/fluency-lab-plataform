"use client";

import { useState, useMemo } from "react";
import { Mail, Shield, Calendar, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyResults } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

export interface TeacherStudentItem {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  role?: string;
  isActive?: boolean;
  nextClass?: {
    startAt: Date | string;
    type: string;
  } | null;
}

interface TeacherStudentsTabProps {
  students: TeacherStudentItem[];
  basePath: string;
}

export function TeacherStudentsTab({ students = [], basePath }: TeacherStudentsTabProps) {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const lower = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.email.toLowerCase().includes(lower)
    );
  }, [students, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total: {filteredStudents.length} {filteredStudents.length === 1 ? "aluno" : "alunos"}
        </span>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const isActive = student.isActive ?? true;
            return (
              <Link
                key={student.id}
                href={`${basePath}/${student.id}`}
                className={`card p-5 flex flex-col gap-4 transition-all hover:ring-1 hover:ring-primary/20 ${
                  !isActive ? "opacity-70 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={student.photoUrl || ""} alt={student.name} />
                      <AvatarFallback name={student.name} className="bg-primary/5 text-primary">
                        {student.name ? student.name.substring(0, 2).toUpperCase() : "AL"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground leading-tight">
                        {student.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="break-all max-w-60">{student.email}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {student.nextClass ? (() => {
                    const date = new Date(student.nextClass.startAt);
                    const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                    const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0.5 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 flex items-center gap-1 font-semibold"
                      >
                        <Calendar className="w-3 h-3" /> {dateStr} às {timeStr}
                      </Badge>
                    );
                  })() : (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0.5 px-2 bg-muted/40 text-muted-foreground border-border/50 flex items-center gap-1 font-normal"
                    >
                      <Calendar className="w-3 h-3" /> Sem Aula Agendada
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-primary/60" />
                    Aluno
                  </div>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[10px] uppercase tracking-wider font-bold"
                  >
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyResults searchQuery={search} />
      )}
    </div>
  );
}
