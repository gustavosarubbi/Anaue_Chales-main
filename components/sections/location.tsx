import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Car, Waves, TreePine, Navigation } from "lucide-react"
import Link from "next/link"

export function Location() {
  return (
    <section id="localizacao" className="py-24 bg-gradient-to-br from-beige-50 to-moss-50 texture-waves relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📍 Localização Privilegiada</Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-moss-900 mb-6">No Coração do Tarumã</h2>
          <p className="text-lg text-moss-700 font-light max-w-2xl mx-auto leading-relaxed">
            Localização estratégica próximo às principais atrações de Manaus, com fácil acesso e total tranquilidade.
          </p>
        </div>

        {/* Google Maps */}
        <div className="mb-12">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-moss-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-moss-50/50 border-b border-moss-100">
              <CardTitle className="text-center font-heading text-xl text-moss-900 flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5 text-moss-600" />
                Nossa Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video w-full h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.485337445665!2d-60.096383900000006!3d-2.9627469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x926c3dbaac5b11f5%3A0x85f34b546f03fa0f!2zQW5hdcOqIEp1bmdsZSBDaGFsw6lz!5e0!3m2!1spt-BR!2sbr!4v1757047079339!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Anauê Jungle Chalés"
                ></iframe>
              </div>
              <div className="p-6 bg-gradient-to-r from-moss-50 to-beige-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="font-heading text-moss-900 font-bold text-lg mb-1">Anauê Jungle Chalés</p>
                  <p className="text-moss-700 text-sm">R. Cedrinho - Tarumã Açu, Manaus - AM, 69022-000</p>
                </div>
                <Button
                  className="bg-moss-600 hover:bg-moss-700 text-white shadow-md hover:shadow-lg transition-all"
                  asChild
                >
                  <Link href="https://waze.com/ul?q=R.+Cedrinho+-+Tarumã+Açu,+Manaus+-+AM,+69022-000" target="_blank">
                    <Navigation className="mr-2 h-4 w-4" />
                    Abrir no Waze
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-moss-200 hover:border-moss-300 transition-colors shadow-sm cursor-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-moss-900 font-heading">
                <div className="bg-moss-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-moss-700" />
                </div>
                Pontos de Interesse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-moss-50/50 rounded-xl hover:bg-moss-50 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Waves className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-bold text-moss-900">Hope Bay Park</p>
                    <p className="text-sm text-moss-600">Parque aquático (5 min)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-beige-50/50 rounded-xl hover:bg-beige-50 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <TreePine className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-moss-900">Praia do Avião</p>
                    <p className="text-sm text-moss-600">Praia fluvial famosa (10 min)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-beige-200 hover:border-beige-300 transition-colors shadow-sm cursor-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-moss-900 font-heading">
                <div className="bg-beige-100 p-2 rounded-lg">
                  <Car className="h-5 w-5 text-beige-700" />
                </div>
                Acesso e Transporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 border border-moss-100 rounded-xl">
                  <p className="font-bold text-moss-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Estrada Asfaltada
                  </p>
                  <p className="text-sm text-moss-600">Acesso 100% asfaltado até o ramal principal. Apenas 500m de ramal de terra em boas condições.</p>
                </div>
                <div className="p-4 bg-white/50 border border-moss-100 rounded-xl">
                  <p className="font-bold text-moss-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Transporte por App
                  </p>
                  <p className="text-sm text-moss-600">Uber e 99 atendem a região normalmente para ida e volta.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* River Info */}
        <Card className="bg-gradient-to-br from-moss-900 to-moss-800 border-none text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <CardHeader className="relative z-10">
            <CardTitle className="text-center font-heading text-2xl flex items-center justify-center gap-3">
              <Waves className="h-6 w-6 text-cyan-300" />
              Informações sobre o Rio Negro
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-8">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                <h4 className="font-bold text-xl text-white mb-2">🌊 Período de Cheia</h4>
                <p className="text-base text-moss-100 font-medium mb-1">Dezembro a Julho</p>
                <p className="text-xs text-moss-300 uppercase tracking-wider">Igarapés Cheios</p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                <h4 className="font-bold text-xl text-white mb-2">🏖️ Período de Seca</h4>
                <p className="text-base text-moss-100 font-medium mb-1">Agosto a Novembro</p>
                <p className="text-xs text-moss-300 uppercase tracking-wider">Praias Gigantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
