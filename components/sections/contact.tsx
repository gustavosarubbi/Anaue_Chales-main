import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Instagram, MapPin } from "lucide-react"
import Link from "next/link"

export function Contact() {
  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-moss-900 to-moss-800 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-lg text-moss-100 max-w-2xl mx-auto">
            Estamos prontos para tornar sua estadia inesquecível
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-beige-300" />
                Telefone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">(92) 99419-7052</p>
              <p className="text-moss-200 text-sm mb-4">Atendimento todos os dias</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="tel:+559294197052">
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar Agora
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-beige-300" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-2">Reservas e Dúvidas</p>
              <p className="text-moss-200 text-sm mb-4">Resposta rápida e atendimento personalizado</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                <Link href="https://wa.me/559294197052" target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Abrir WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-beige-300" />
                Instagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold mb-2">@anaue.chales</p>
              <p className="text-moss-200 text-sm mb-4">Veja fotos e novidades</p>
              <Button
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <Link href="https://instagram.com/anaue.chales" target="_blank">
                  <Instagram className="mr-2 h-4 w-4" />
                  Seguir no Instagram
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Location */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-beige-300" />
              Nossa Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-2">Tarumã, Manaus - AM</p>
            <p className="text-moss-200 text-sm mb-6">Próximo ao Hope Bay Park e à Praia do Avião</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-moss-600 hover:bg-moss-700 text-white" asChild>
                <Link
                  href="https://wa.me/559294197052?text=Olá! Gostaria de informações sobre a localização."
                  target="_blank"
                >
                  Solicitar Localização
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
