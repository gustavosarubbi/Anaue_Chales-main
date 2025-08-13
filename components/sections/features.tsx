import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Home, Flame, Wine, ShoppingCart, Shield, Wifi, Users, Waves, Heart } from "lucide-react"

const features = [
  {
    icon: Coffee,
    title: "Café da Manhã Incluso",
    description: "Delicioso café da manhã servido no chalé em uma charmosa cesta",
    highlight: true,
  },
  {
    icon: Home,
    title: "Chalé Completo",
    description: "Micro-ondas, frigobar, forno elétrico, ar condicionado e tudo que você precisa",
    highlight: true,
  },
  {
    icon: Flame,
    title: "Churrasqueira Privativa",
    description: "À beira do rio para você usar à vontade (traga o carvão)",
    highlight: true,
  },
  {
    icon: Wine,
    title: "Adega de Vinhos",
    description: "Traga o seu vinho ou adquira no local",
    highlight: false,
  },
  {
    icon: ShoppingCart,
    title: "Consumo Livre",
    description: "Fique à vontade para levar o que quiser consumir no local",
    highlight: false,
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Monitorado por câmeras e alarmes de segurança 24h",
    highlight: true,
  },
  {
    icon: Wifi,
    title: "Wi-Fi Gratuito",
    description: "Internet de alta velocidade em todo o chalé",
    highlight: false,
  },
  {
    icon: Waves,
    title: "Prancha de SUP",
    description: "Disponível por adicional de R$ 50",
    highlight: false,
  },
  {
    icon: Heart,
    title: "Pet Friendly",
    description: "Seus pets são bem-vindos! 🐕",
    highlight: true,
  },
]

export function Features() {
  return (
    <section id="comodidades" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">🛏️ Diária para Casal</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Incluído no Seu Pernoite</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Desfrute de uma experiência completa com todas as comodidades e serviços inclusos
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`text-center transition-all duration-300 hover:shadow-lg ${
                feature.highlight ? "border-moss-200 bg-moss-50/50" : "border-beige-200 bg-beige-50/30"
              }`}
            >
              <CardHeader>
                <div
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    feature.highlight ? "bg-moss-100" : "bg-beige-100"
                  }`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.highlight ? "text-moss-600" : "text-beige-600"}`} />
                </div>
                <CardTitle className="text-lg text-moss-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-moss-700 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-moss-50 to-beige-50 border-moss-200">
          <CardHeader>
            <CardTitle className="text-center text-moss-900 flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Informações sobre Hóspedes Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/60 rounded-lg">
                <p className="font-semibold text-moss-800">Até 5 anos</p>
                <p className="text-sm text-moss-600">Não pagam</p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <p className="font-semibold text-moss-800">6 a 17 anos</p>
                <p className="text-sm text-moss-600">+ R$ 50</p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <p className="font-semibold text-moss-800">A partir de 18 anos</p>
                <p className="text-sm text-moss-600">+ R$ 100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
