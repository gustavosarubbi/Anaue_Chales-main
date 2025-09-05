import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Phone, MessageCircle } from "lucide-react"

export function ContactForm() {

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">💬 Entre em Contato</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Reserve Sua Experiência na Natureza</h2>
          <p className="text-lg text-moss-700 max-w-3xl mx-auto leading-relaxed">
            Entre em contato conosco diretamente pelo WhatsApp ou telefone para fazer sua reserva e esclarecer todas as dúvidas sobre sua estadia no paraíso amazônico.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-moss-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Resposta em até 30 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-moss-500 rounded-full"></div>
              <span>Atendimento personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-beige-500 rounded-full"></div>
              <span>Sem compromisso</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border-moss-200">
            <CardHeader>
              <CardTitle className="text-moss-900 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato Direto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-moss-50 rounded-lg">
                <p className="font-semibold text-moss-800 mb-1">WhatsApp</p>
                <p className="text-moss-600 mb-3">(92) 99419-7052</p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                  <a href="https://wa.me/559294197052" target="_blank" rel="noreferrer">
                    Conversar Agora
                  </a>
                </Button>
              </div>

              <div className="p-4 bg-beige-50 rounded-lg">
                <p className="font-semibold text-moss-800 mb-1">Instagram</p>
                <p className="text-moss-600 mb-3">@anaue.chales</p>
                <Button
                  variant="outline"
                  className="w-full border-moss-300 text-moss-700 hover:bg-moss-50 bg-transparent"
                  asChild
                >
                  <a href="https://instagram.com/anaue.chales" target="_blank" rel="noreferrer">
                    Seguir no Instagram
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
