
import { GrecophIcon } from '@/components/app/grecoph-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, GanttChartSquare, Users, Building, ShieldCheck, MessageCircleHeart, Twitter, Linkedin, Facebook } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';


export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === 'hero-1');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <GrecophIcon className="h-6 w-6 text-primary" />
          <span className="ml-2 font-semibold text-lg">Grecoph</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Características
          </Link>
           <Link
            href="#benefits"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Beneficios
          </Link>
           <Link
            href="#testimonials"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Testimonios
          </Link>
          <Button asChild variant="default">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
         <Button asChild variant="outline" className="md:hidden ml-auto">
            <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <div className="flex flex-col justify-center space-y-4">
                 <div className="space-y-4">
                   <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4">
                     🏠 Conjunto Residencial El Trébol - Manzana 5
                   </div>
                   <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                     Bienvenido a Grecoph
                   </h1>
                   <p className="max-w-[600px] text-muted-foreground md:text-xl">
                     Sistema de Gestión de Proyectos y Control de Parqueaderos para el Conjunto Residencial El Trébol Manzana 5, Mosquera - Cundinamarca. Simplifica la administración de tu comunidad.
                   </p>
                 </div>
                 <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Button asChild size="lg" className="text-lg shadow-lg">
                     <Link href="/login">
                       Acceder al Portal
                     </Link>
                   </Button>
                 </div>
               </div>
               {heroImage &&
                 <div className="relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl"></div>
                   <Image
                       src={heroImage.src}
                       alt="Conjunto Residencial El Trébol - Gestión comunitaria moderna"
                       data-ai-hint="Imagen representativa de un conjunto residencial moderno con parqueaderos y áreas verdes"
                       width={600}
                       height={600}
                       className="mx-auto aspect-square overflow-hidden rounded-xl object-cover shadow-2xl border-4 border-white/50"
                   />
                   <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-lg">
                     Mosquera, Cundinamarca
                   </div>
                 </div>
               }
             </div>
           </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-medium">Características Principales</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Potencia tu Comunidad con Grecoph</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Herramientas especializadas para El Trébol Manzana 5: desde parqueaderos inteligentes hasta proyectos que unen a la comunidad.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Car className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium">
                        Control de Parqueaderos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Sistema inteligente de asignación de parqueaderos para El Trébol. Gestiona espacios, pagos y disponibilidad en tiempo real.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <GanttChartSquare className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium">
                        Proyectos Comunitarios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Democratiza las decisiones. Propón, cotiza y vota proyectos que mejoren la calidad de vida en tu conjunto residencial.</p>
                </CardContent>
              </Card>
               <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium">
                        Comunicación Inmediata
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Mantén informados a todos los residentes de El Trébol. Notificaciones personalizadas y anuncios importantes al instante.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/5 via-background to-primary/5">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">Beneficios Exclusivos</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">¿Por qué El Trébol elige Grecoph?</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Tecnología de vanguardia diseñada específicamente para potenciar la calidad de vida en tu conjunto residencial.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-2">
                    <div className="flex items-center gap-4 p-6 rounded-lg bg-card/50 hover:bg-card transition-colors shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building className="h-7 w-7 text-primary"/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Gestión 100% Digital</h3>
                            <p className="text-muted-foreground">Olvídate del papeleo. Todo lo que necesitas para administrar El Trébol está en la palma de tu mano.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-6 rounded-lg bg-card/50 hover:bg-card transition-colors shadow-sm">
                         <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                           <ShieldCheck className="h-7 w-7 text-primary"/>
                         </div>
                         <div>
                             <h3 className="text-lg font-bold">Transparencia Total</h3>
                             <p className="text-muted-foreground">Cada decisión, cada asignación, cada proyecto: todo traceable y accesible para todos los residentes.</p>
                         </div>
                     </div>
                      <div className="flex items-center gap-4 p-6 rounded-lg bg-card/50 hover:bg-card transition-colors shadow-sm">
                         <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                           <MessageCircleHeart className="h-7 w-7 text-primary"/>
                         </div>
                         <div>
                             <h3 className="text-lg font-bold">Comunidad Conectada</h3>
                             <p className="text-muted-foreground">Fomenta el sentido de pertenencia con comunicación instantánea y participación democrática en El Trébol.</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-4 p-6 rounded-lg bg-card/50 hover:bg-card transition-colors shadow-sm">
                         <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                           <Car className="h-7 w-7 text-primary"/>
                         </div>
                         <div>
                             <h3 className="text-lg font-bold">Parqueaderos Inteligentes</h3>
                             <p className="text-muted-foreground">Sistema automatizado que elimina conflictos y optimiza el uso de espacios en tu conjunto residencial.</p>
                         </div>
                     </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
              <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                 <div className="space-y-3">
                     <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">La Voz de El Trébol</h2>
                     <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                         Residentes y administradores de nuestro conjunto comparten su experiencia con Grecoph.
                     </p>
                 </div>
                 <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                     <Card className="hover:shadow-lg transition-shadow">
                         <CardContent className="p-6">
                             <div className="mb-4 text-primary">⭐⭐⭐⭐⭐</div>
                             <p className="text-muted-foreground mb-4">"Grecoph ha revolucionado cómo manejamos los parqueaderos en El Trébol. Ya no hay discusiones ni confusiones. ¡Es un cambio total!"</p>
                             <div className="font-semibold">María González</div>
                             <div className="text-xs text-muted-foreground">Residente, Torre A - El Trébol M5</div>
                         </CardContent>
                     </Card>
                      <Card className="hover:shadow-lg transition-shadow">
                         <CardContent className="p-6">
                             <div className="mb-4 text-primary">⭐⭐⭐⭐⭐</div>
                             <p className="text-muted-foreground mb-4">"Como administradora, ahora puedo gestionar todo desde mi teléfono. Los proyectos comunitarios nunca habían sido tan democráticos."</p>
                             <div className="font-semibold">Carlos Rodríguez</div>
                             <div className="text-xs text-muted-foreground">Administrador, El Trébol Manzana 5</div>
                         </CardContent>
                     </Card>
                      <Card className="hover:shadow-lg transition-shadow">
                         <CardContent className="p-6">
                             <div className="mb-4 text-primary">⭐⭐⭐⭐⭐</div>
                             <p className="text-muted-foreground mb-4">"Me encanta poder votar por las mejoras del conjunto desde casa. Grecoph nos ha unido más como comunidad en Mosquera."</p>
                             <div className="font-semibold">Laura Martínez</div>
                             <div className="text-xs text-muted-foreground">Residente, Torre C - El Trébol M5</div>
                         </CardContent>
                     </Card>
                 </div>
             </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary/5 to-primary/10 border-t py-8">
        <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-between">
                <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start">
                        <GrecophIcon className="h-8 w-8 text-primary" />
                        <span className="ml-3 text-xl font-semibold">Grecoph</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Conectando comunidades en Mosquera, Cundinamarca.</p>
                    <p className="mt-2 text-xs text-muted-foreground">🏠 Exclusivo para El Trébol Manzana 5</p>
                </div>
                <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
                    <h5 className="font-bold mb-2">Contacto</h5>
                    <p className="text-sm text-muted-foreground">Mosquera, Cundinamarca</p>
                    <p className="text-sm text-muted-foreground">Conjunto Residencial El Trébol M5</p>
                    <p className="text-sm text-muted-foreground">admin@eltrebol.com</p>
                    <p className="text-sm text-muted-foreground">(+57) 315-789-0123</p>
                </div>
                <div className="w-full md:w-1/3 text-center md:text-right">
                    <h5 className="font-bold mb-2">Comunidad</h5>
                    <div className="flex justify-center md:justify-end space-x-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          <div className="text-center">
                            <Users className="h-5 w-5 mx-auto mb-1" />
                            <span className="text-xs">Residentes</span>
                          </div>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          <div className="text-center">
                            <Building className="h-5 w-5 mx-auto mb-1" />
                            <span className="text-xs">Administración</span>
                          </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
                <p className="text-xs text-muted-foreground">&copy; 2024 Grecoph - El Trébol Manzana 5. Todos los derechos reservados.</p>
                <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
                    <Link href="#" className="text-xs hover:underline underline-offset-4">Términos de Servicio</Link>
                    <Link href="#" className="text-xs hover:underline underline-offset-4">Política de Privacidad</Link>
                    <Link href="#" className="text-xs hover:underline underline-offset-4">Reglamento Interno</Link>
                </nav>
            </div>
        </div>
      </footer>
    </div>
  );
}

    