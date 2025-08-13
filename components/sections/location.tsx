import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Car, Waves, TreePine, Navigation } from "lucide-react"
import Link from "next/link"

export function Location() {
  return (
    <section id="localizacao" className="py-20 bg-gradient-to-br from-beige-50 to-moss-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📍 Localização Privilegiada</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">No Coração do Tarumã</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Localização estratégica próximo às principais atrações de Manaus
          </p>
        </div>

        {/* Google Maps */}
        <div className="mb-12">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-moss-200">
            <CardHeader>
              <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                Nossa Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.0123456789!2d-60.0123456!3d-3.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMDAnNDQuNCJTIDYwwrAwMCc0NC40Ilc!5e0!3m2!1spt-BR!2sbr!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Anauê Jungle Chalés"
                ></iframe>
              </div>
              <div className="p-6 bg-gradient-to-r from-moss-50 to-beige-50">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-moss-600 hover:bg-moss-700 text-white" asChild>
                    <Link
                      href="https://wa.me/559294197052?text=Olá! Gostaria de informações sobre a localização."
                      target="_blank"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Solicitar Localização
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-moss-600 text-moss-600 hover:bg-moss-50 bg-transparent"
                    asChild
                  >
                    <Link href="https://waze.com/ul/h6xmr0kz2b" target="_blank">
                      <Navigation className="mr-2 h-4 w-4" />
                      Abrir no Waze
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-moss-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-moss-900">
                <MapPin className="h-5 w-5 text-moss-600" />
                Pontos de Interesse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-moss-50 rounded-lg">
                  <Waves className="h-5 w-5 text-moss-600" />
                  <div>
                    <p className="font-medium text-moss-800">Hope Bay Park</p>
                    <p className="text-sm text-moss-600">Parque aquático próximo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-beige-50 rounded-lg">
                  <TreePine className="h-5 w-5 text-beige-600" />
                  <div>
                    <p className="font-medium text-moss-800">Praia do Avião</p>
                    <p className="text-sm text-moss-600">Praia fluvial famosa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-beige-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-moss-900">
                <Car className="h-5 w-5 text-beige-600" />
                Acesso e Transporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-beige-50 rounded-lg">
                  <p className="font-medium text-moss-800 mb-2">Acesso de Carro</p>
                  <p className="text-sm text-moss-600">Fácil acesso por estrada, com estacionamento no local</p>
                </div>
                <div className="p-4 bg-moss-50 rounded-lg">
                  <p className="font-medium text-moss-800 mb-2">Localização</p>
                  <p className="text-sm text-moss-600">Região do Tarumã, Manaus - AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* River Info */}
        <Card className="bg-gradient-to-r from-moss-100 to-beige-100 border-moss-300">
          <CardHeader>
            <CardTitle className="text-center text-moss-900">🌊 Informações sobre o Rio Negro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-center">
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-moss-800 mb-2">Período de Cheia</h4>
                <p className="text-sm text-moss-600">Dezembro a Julho</p>
                <p className="text-xs text-moss-500 mt-1">Melhor época para atividades aquáticas</p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-moss-800 mb-2">Período de Seca</h4>
                <p className="text-sm text-moss-600">Agosto a Novembro</p>
                <p className="text-xs text-moss-500 mt-1">Praias fluviais mais extensas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
