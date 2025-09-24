
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectVote, CommunityProject, ProjectQuote } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Vote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

export default function ResidentProjectsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [projectData, setProjectData] = useState<Record<string, { quotes: ProjectQuote[], votes: ProjectVote[], userVote?: ProjectVote }>>({});

    useEffect(() => {
        const unsub = auth!.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch projects
                const projQ = query(collection(db!, "communityProjects"), orderBy("createdAt", "desc"));
                const projSnap = await getDocs(projQ);
                const fetchedProjects = projSnap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() || new Date(),
                        votingDeadline: data.votingDeadline?.toDate?.() || null,
                    } as CommunityProject;
                });
                setProjects(fetchedProjects);

                // Fetch quotes and votes for each project
                const data: Record<string, any> = {};
                for (const proj of fetchedProjects) {
                    const [quotesSnap, votesSnap] = await Promise.all([
                        getDocs(query(collection(db!, "projectQuotes"), where("projectId", "==", proj.id))),
                        getDocs(query(collection(db!, "projectVotes"), where("projectId", "==", proj.id)))
                    ]);
                    const quotes = quotesSnap.docs.map(d => {
                        const data = d.data();
                        return {
                            id: d.id,
                            ...data,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                        } as ProjectQuote;
                    });
                    const votes = votesSnap.docs.map(d => {
                        const data = d.data();
                        return {
                            id: d.id,
                            ...data,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                        } as ProjectVote;
                    });
                    const userVote = votes.find(v => v.userId === firebaseUser.uid);
                    data[proj.id] = { quotes, votes, userVote };
                }
                setProjectData(data);
            }
        });
        return () => unsub();
    }, []);

    const statusVariant = {
        proposal: 'secondary',
        voting: 'default',
        approved: 'default',
        rejected: 'destructive',
    } as const;

    const statusText = {
        proposal: 'Propuesta',
        voting: 'En Votación',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    };
    
    const handleVote = async (projectId: string, quoteId: string, providerName: string) => {
        if (!user) return;

        try {
            await addDoc(collection(db!, "projectVotes"), {
                projectId,
                userId: user.uid,
                voteChoice: quoteId,
                createdAt: new Date(),
            });

            // Update UI
            const newVote: ProjectVote = {
                id: `temp-${Date.now()}`,
                projectId,
                userId: user.uid,
                voteChoice: quoteId,
                createdAt: new Date(),
            };

            setProjectData((prevData:any) => {
                const currentVotes = prevData[projectId]?.votes || [];
                return {
                    ...prevData,
                    [projectId]: {
                        ...prevData[projectId],
                        userVote: newVote,
                        votes: [...currentVotes, newVote]
                    }
                }
            });

            toast({
                title: "Voto Registrado",
                description: `Has votado por la cotización de ${providerName}.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo registrar el voto.",
                variant: "destructive",
            });
        }
    };
    
    if (!user) return null;

    if (projects.length === 0) {
        return (
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Proyectos de la Comunidad</h1>
                    <p className="text-muted-foreground">Revisa las propuestas, consulta las cotizaciones y participa en las decisiones de tu comunidad.</p>
                </div>
                <div className="text-center text-muted-foreground py-10">
                    No hay proyectos disponibles en este momento.
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Proyectos de la Comunidad</h1>
                <p className="text-muted-foreground">Revisa las propuestas, consulta las cotizaciones y participa en las decisiones de tu comunidad.</p>
            </div>
            {projects.map(project => {
                const quotes: ProjectQuote[] = projectData[project.id]?.quotes || [];
                const votes: ProjectVote[] = projectData[project.id]?.votes || [];
                const userVote: ProjectVote | undefined = projectData[project.id]?.userVote;
                const totalVotes = votes.length;

                return (
                <Card key={project.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{project.title}</CardTitle>
                                <CardDescription>Presupuesto: ${project.budget.toLocaleString('es-CO')}</CardDescription>
                            </div>
                            <Badge variant={statusVariant[project.status]}>{statusText[project.status]}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        
                        {project.status === 'voting' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold">Cotizaciones (Ranking por votos):</h4>
                            {quotes
                                .map(quote => {
                                    const quoteVotes = votes.filter(v => v.voteChoice === quote.id).length;
                                    return { ...quote, voteCount: quoteVotes };
                                })
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map(quote => {
                                    const votePercentage = totalVotes > 0 ? (quote.voteCount / totalVotes) * 100 : 0;
                                    return (
                                    <div key={quote.id} className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium">{quote.providerName} - ${quote.amount.toLocaleString('es-CO')}</div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={quote.fileUrl} target="_blank">
                                                        <FileText className="mr-2 h-4 w-4"/>Ver PDF
                                                    </Link>
                                                </Button>
                                                <Button size="sm" disabled={!!userVote} onClick={() => handleVote(project.id, quote.id, quote.providerName)}>
                                                    <Vote className="mr-2 h-4 w-4"/>Votar
                                                </Button>
                                            </div>
                                        </div>
                                        <Progress value={votePercentage} className="mt-2 h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">{quote.voteCount} voto(s) ({votePercentage.toFixed(1)}%)</p>
                                    </div>
                                    )
                                })}
                            {quotes.length === 0 && <p className="text-sm text-muted-foreground">No hay cotizaciones para este proyecto.</p>}
                        </div>
                        )}
                        {userVote && <p className="text-sm text-primary font-medium mt-4">Ya has votado en este proyecto.</p>}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                        {project.createdAt && `Publicado el ${format(new Date(project.createdAt), 'dd/MM/yyyy')}`}
                        {project.status === 'voting' && project.votingDeadline && ` - Votación cierra el ${format(new Date(project.votingDeadline), 'dd/MM/yyyy')}`}
                    </CardFooter>
                </Card>
                )
            })}
        </div>
    )
}
