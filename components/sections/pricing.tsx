import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CreditCard, Smartphone, Users } from "lucide-react"
import Link from "next/link"

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">💰 Valores</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Preços e Horários</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Tarifas especiais para diferentes períodos da semana
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Weekend Pricing */}
          <Card className="border-moss-200 bg-gradient-to-br from-moss-50 to-moss-100 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-moss-600 text-white">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-moss-900">
                <Calendar className="h-5 w-5" />
                Finais de Semana
              </CardTitle>
              <p className="text-sm text-moss-700">Sexta a sábado, sábado a domingo, domingo a segunda-feira e feriados</p>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-moss-900 font-bold text-4xl">R$ 800</span>
                <p className="text-moss-600 font-semibold">Via Pix (pernoite)</p>
                <p className="text-xs text-moss-500">Parcelado com juros da máquina</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-moss-700">
                  <Smartphone className="h-4 w-4 text-moss-600" />
                  <span>Pagamento via Pix</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-moss-700">
                  <CreditCard className="h-4 w-4 text-moss-600" />
                  <span>Parcelado com juros da máquina</span>
                </div>
              </div>

              <Button className="w-full bg-moss-600 hover:bg-moss-700 text-white" asChild>
                <Link href="#calendario">
                  <Calendar className="mr-2 h-4 w-4" />
                  Verificar Disponibilidade
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Weekday Pricing */}
          <Card className="border-beige-200 bg-gradient-to-br from-beige-50 to-beige-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-moss-900">
                <Calendar className="h-5 w-5" />
                Segunda a Quinta
              </CardTitle>
              <p className="text-sm text-moss-700">Exceto feriados e vésperas</p>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-moss-900 font-bold text-4xl">R$ 650</span>
                <p className="text-moss-600 font-semibold">Via Pix (pernoite)</p>
                <p className="text-xs text-moss-500">Parcelado com juros da máquina</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-moss-700">
                  <Smartphone className="h-4 w-4 text-beige-600" />
                  <span>Pagamento via Pix</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-moss-700">
                  <CreditCard className="h-4 w-4 text-beige-600" />
                  <span>Parcelado com juros da máquina</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-moss-600 text-moss-600 hover:bg-moss-50 bg-transparent"
                asChild
              >
                <Link href="#calendario">
                  <Calendar className="mr-2 h-4 w-4" />
                  Verificar Disponibilidade
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Person Pricing */}
        <Card className="bg-gradient-to-r from-beige-50 to-moss-50 border-beige-200 mb-12">
          <CardHeader>
            <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Valores para Pessoa Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/60 rounded-lg">
                <div className="text-xl font-bold text-moss-800 mb-2">Até 5 anos</div>
                <p className="text-moss-600 font-medium">Não pagam</p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <div className="text-xl font-bold text-moss-800 mb-2">De 6 a 15 anos</div>
                <p className="text-moss-600 font-medium">Adicional de R$ 100</p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <div className="text-xl font-bold text-moss-800 mb-2">A partir de 16 anos</div>
                <p className="text-moss-600 font-medium">Adicional de R$ 150</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Info */}
        <Card className="bg-gradient-to-r from-moss-50 to-beige-50 border-moss-200">
          <CardHeader>
            <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de Check-in e Check-out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-center">
              <div className="p-6 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-moss-800 mb-2">14:00</div>
                <p className="text-moss-600 font-medium">Check-in</p>
                <p className="text-sm text-moss-500 mt-1">A partir das 14h</p>
              </div>
              <div className="p-6 bg-white/60 rounded-lg">
                <div className="text-2xl font-bold text-moss-800 mb-2">11:00</div>
                <p className="text-moss-600 font-medium">Check-out</p>
                <p className="text-sm text-moss-500 mt-1">Até às 11h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
