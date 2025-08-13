import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle, Info, Star, Heart, Share } from "lucide-react"
import Link from "next/link"

export default function ComponentsPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Componentes</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Exemplos dos componentes shadcn/ui disponíveis no projeto.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Botões</CardTitle>
              <CardDescription>Diferentes variações de botões disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>Padrão</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destrutivo</Button>
                <Button size="sm">Pequeno</Button>
                <Button size="lg">Grande</Button>
                <Button disabled>Desabilitado</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Badges para destacar informações importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Padrão</Badge>
                <Badge variant="secondary">Secundário</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destrutivo</Badge>
                <Badge className="bg-green-500 hover:bg-green-600">Sucesso</Badge>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">Aviso</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Formulários</CardTitle>
              <CardDescription>Componentes de formulário para entrada de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Digite seu nome" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" placeholder="Digite sua mensagem..." />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Receber notificações</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Volume: 50</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Progresso</Label>
                    <Progress value={75} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Diferentes tipos de alertas para comunicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>Esta é uma mensagem informativa para o usuário.</AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Sucesso</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Operação realizada com sucesso!
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>Ocorreu um erro ao processar sua solicitação.</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Elementos Interativos</CardTitle>
              <CardDescription>Componentes com interações e estados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <h3 className="font-semibold mb-2">Favoritar</h3>
                    <Button variant="outline" size="sm">
                      <Star className="mr-2 h-4 w-4" />
                      Favorito
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <h3 className="font-semibold mb-2">Curtir</h3>
                    <Button variant="outline" size="sm">
                      <Heart className="mr-2 h-4 w-4" />
                      Curtir
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Share className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold mb-2">Compartilhar</h3>
                    <Button variant="outline" size="sm">
                      <Share className="mr-2 h-4 w-4" />
                      Compartilhar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
