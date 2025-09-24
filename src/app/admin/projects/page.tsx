import { db } from "@/lib/firebase/server";
import type { CommunityProject, ProjectQuote, ProjectVote } from "@/lib/types";
import { ProjectForm } from "./_components/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getProjects(): Promise<(CommunityProject & { quotes: ProjectQuote[], votes: ProjectVote[] })[]> {
  if (!db) return [];
  const snap = await db.collection("communityProjects").orderBy("createdAt", "desc").get();
  const projects = [];
  for (const d of snap.docs) {
    const x = d.data() as any;
    const project = {
      id: d.id,
      title: x.title,
      description: x.description,
      justification: x.justification || '',
      priority: x.priority || 'medium',
      viability: x.viability || '',
      budget: x.budget,
      status: x.status,
      votingDeadline: x.votingDeadline?.toDate?.() || null,
      createdBy: x.createdBy || '',
      createdAt: x.createdAt?.toDate?.() || new Date(),
    } as CommunityProject;

    // Fetch quotes and votes
    const [quotesSnap, votesSnap] = await Promise.all([
      db.collection("projectQuotes").where("projectId", "==", d.id).get(),
      db.collection("projectVotes").where("projectId", "==", d.id).get()
    ]);
    const quotes = quotesSnap.docs.map(q => ({ id: q.id, ...q.data() } as ProjectQuote));
    const votes = votesSnap.docs.map(v => ({ id: v.id, ...v.data() } as ProjectVote));

    projects.push({ ...project, quotes, votes });
  }
  return projects;
}

export default async function ProjectsAdminPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestión de propuestas comunitarias</p>
        </div>
        <ProjectForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const totalVotes = p.votes.length;
          return (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary">{p.status}</Badge>
              {p.status === 'voting' && p.quotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Ranking de Cotizaciones:</h4>
                  {p.quotes
                    .map(quote => {
                      const voteCount = p.votes.filter(v => v.voteChoice === quote.id).length;
                      return { ...quote, voteCount };
                    })
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map(quote => {
                      const percentage = totalVotes > 0 ? (quote.voteCount / totalVotes) * 100 : 0;
                      return (
                        <div key={quote.id} className="p-2 border rounded">
                          <div className="flex justify-between items-center text-sm">
                            <span>{quote.providerName} - ${quote.amount.toLocaleString('es-CO')}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={quote.fileUrl} target="_blank">
                                  <FileText className="h-4 w-4" />
                                </Link>
                              </Button>
                              <span>{quote.voteCount} votos ({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="mt-1 h-1" />
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">Presupuesto: ${p.budget?.toLocaleString?.("es-CO")}</CardFooter>
          </Card>
          );
        })}
        {projects.length === 0 && <p className="text-muted-foreground">No hay proyectos aún.</p>}
      </div>
    </div>
  );
}
