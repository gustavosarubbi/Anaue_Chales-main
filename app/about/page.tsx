import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code2, Palette, Smartphone, Zap, Shield, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sobre o Projeto</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Conheça as tecnologias e recursos incluídos neste projeto Next.js completo.
          </p>
        </div>

        {/* Project Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Projeto Next.js + Tailwind CSS</CardTitle>
            <CardDescription>Um template completo e moderno para desenvolvimento web</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>Next.js 15</Badge>
              <Badge>React 18</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind CSS</Badge>
              <Badge>shadcn/ui</Badge>
              <Badge>Lucide Icons</Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Este projeto foi criado com as melhores práticas de desenvolvimento moderno, incluindo componentes
              reutilizáveis, tipagem TypeScript, design responsivo e suporte a tema escuro.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Next.js App Router</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Utiliza o novo App Router do Next.js 15 com Server Components, layouts aninhados e roteamento baseado em
                arquivos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Design System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Componentes shadcn/ui com Tailwind CSS para um design consistente e profissional em todo o projeto.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Responsivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Design totalmente responsivo que funciona perfeitamente em dispositivos móveis, tablets e desktops.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Otimizado para performance com Server Components, code splitting automático e otimizações do Next.js.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">TypeScript</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tipagem completa com TypeScript para maior segurança e melhor experiência de desenvolvimento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-lg">Tema Escuro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Suporte completo a tema escuro com transições suaves e cores otimizadas para ambos os modos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Stack Tecnológico</CardTitle>
            <CardDescription>Tecnologias e ferramentas utilizadas neste projeto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Frontend</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Next.js 15 (App Router)</li>
                  <li>• React 18 (Server Components)</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui Components</li>
                  <li>• Lucide React Icons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Recursos</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Design Responsivo</li>
                  <li>• Tema Escuro/Claro</li>
                  <li>• Componentes Reutilizáveis</li>
                  <li>• Otimização de Performance</li>
                  <li>• SEO Otimizado</li>
                  <li>• Acessibilidade (a11y)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
