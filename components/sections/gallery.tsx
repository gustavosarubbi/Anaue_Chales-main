"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Home, Utensils, Waves, TreePine, Camera, Heart, Calendar } from "lucide-react"
import Image from "next/image"

const galleryCategories = [
  {
    id: "all",
    name: "Todos",
    icon: Camera,
    description: "Todas as fotos dos nossos chalés",
  },
  {
    id: "chales",
    name: "Chalés",
    icon: Home,
    description: "Interior e exterior dos chalés",
  },
  {
    id: "gastronomia",
    name: "Gastronomia",
    icon: Utensils,
    description: "Área gourmet e churrasqueira",
  },
  {
    id: "natureza",
    name: "Natureza",
    icon: TreePine,
    description: "Paisagens e ambiente natural",
  },
  {
    id: "rio",
    name: "Rio",
    icon: Waves,
    description: "Atividades aquáticas e vista do rio",
  },
]

const galleryImages = [
  // Chalés
  {
    id: 1,
    category: "chales",
    title: "Chalé Anauê",
    description: "Vista externa do nosso chalé com arquitetura rústica e integrada à natureza",
    image: "/Chale-1.jpg",
  },
  {
    id: 2,
    category: "chales",
    title: "Chalé na floresta",
    description: "Design harmonioso e vista para a vegetação exuberante",
    image: "/chale-2.jpg",
  },
  {
    id: 3,
    category: "chales",
    title: "Quarto com TV",
    description: "Quarto aconchegante com cama casal e TV para seu conforto e entretenimento",
    image: "/cama-casal-com-tv.jpg",
  },
  {
    id: 4,
    category: "chales",
    title: "Banheiro Moderno",
    description: "Banheiro elegante com box de vidro e acabamentos modernos para sua comodidade",
    image: "/banheiro-box.jpg",
  },
  {
    id: 5,
    category: "chales",
    title: "Área de Descanso",
    description: "Espaço relaxante para deitar e apreciar a tranquilidade do ambiente natural",
    image: "/lugar-para-deitar-.jpg",
  },
  {
    id: 15,
    category: "chales",
    title: "Banheira de Hidromassagem",
    description: "Banheira relaxante com hidromassagem para momentos de total relaxamento e bem-estar",
    image: "/banheira.jpeg",
  },

  // Gastronomia
  {
    id: 6,
    category: "gastronomia",
    title: "Café da Manhã",
    description: "Café da manhã completo servido em ambiente acolhedor com vista para a natureza",
    image: "/café-da-manha.jpg",
  },
  {
    id: 7,
    category: "gastronomia",
    title: "Churrasqueiro com Vista",
    description: "Churrasqueiro profissional com vista privilegiada para o rio e natureza",
    image: "/churrasqueiro-com-vista-ao-rio.jpg",
  },
  {
    id: 8,
    category: "gastronomia",
    title: "Frigobar e Microondas",
    description: "Frigobar bem equipado com microondas para sua conveniência durante a estadia",
    image: "/frigobar-microondas.jpg",
  },
  {
    id: 9,
    category: "gastronomia",
    title: "Frigobar com Bebidas",
    description: "Frigobar abastecido com bebidas geladas para refrescar seu dia",
    image: "/frigobar-bebida.jpg",
  },
  {
    id: 10,
    category: "gastronomia",
    title: "Mesa de Sinuca",
    description: "Mesa de sinuca em ambiente aberto para diversão e entretenimento",
    image: "/mesa-de-sinuca.jpg",
  },

  // Natureza
  {
    id: 11,
    category: "natureza",
    title: "Rio Natural",
    description: "Vista deslumbrante do rio natural cercado pela vegetação exuberante da Amazônia",
    image: "/rio-natural.jpg",
  },
  {
    id: 12,
    category: "natureza",
    title: "Cadeiras à Beira do Rio",
    description: "Cadeiras confortáveis posicionadas estrategicamente para apreciar a vista do rio",
    image: "/cadeiras-beira-rio.jpg",
  },

  // Rio
  {
    id: 13,
    category: "rio",
    title: "Redes à Beira do Rio",
    description: "Redes suspensas à beira do rio para relaxamento total em contato com a natureza",
    image: "/redes-a-beira-do-rio.jpg",
  },
  {
    id: 14,
    category: "rio",
    title: "Stand-Up Paddle",
    description: "Atividade de Stand-Up Paddle no rio para aventura e diversão na água",
    image: "/Stand-Up-Paddle.jpg",
  },
]

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredImages =
    activeCategory === "all" ? galleryImages : galleryImages.filter((img) => img.category === activeCategory)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Reset index when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    setCurrentImageIndex(0)
  }

  return (
    <section id="galeria" className="py-20 bg-gradient-to-br from-beige-50 to-moss-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-moss-100 text-moss-800 hover:bg-moss-200">📸 Galeria</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4">Conheça Nossos Ambientes</h2>
          <p className="text-lg text-moss-700 max-w-2xl mx-auto">
            Explore através de imagens reais a beleza e conforto que preparamos para você
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {galleryCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`flex items-center gap-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-moss-600 hover:bg-moss-700 text-white"
                  : "border-moss-300 text-moss-700 hover:bg-moss-50 bg-white/80"
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.split(" ")[0]}</span>
            </Button>
          ))}
        </div>

        {/* Category Description */}
        <div className="text-center mb-8">
          <p className="text-moss-600 text-sm">
            {galleryCategories.find((cat) => cat.id === activeCategory)?.description}
          </p>
        </div>

        {/* Main Carousel */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-moss-200">
            <CardContent className="p-0 relative">
              {filteredImages.length > 0 && (
                <>
                  {/* Main Image */}
                  <div className="relative aspect-[3/2] overflow-hidden bg-moss-100">
                    <Image
                      src={filteredImages[currentImageIndex].image || "/placeholder.svg"}
                      alt={filteredImages[currentImageIndex].title}
                      fill
                      className="object-contain transition-all duration-500"
                      crossOrigin="anonymous"
                    />

                    {/* Navigation Arrows */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {filteredImages.length}
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-6 bg-gradient-to-r from-moss-50 to-beige-50">
                    <h3 className="text-xl font-bold text-moss-900 mb-2">{filteredImages[currentImageIndex].title}</h3>
                    <p className="text-moss-700">{filteredImages[currentImageIndex].description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Thumbnail Navigation */}
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 relative aspect-[4/3] w-20 md:w-24 rounded-lg overflow-hidden transition-all duration-300 bg-moss-100 ${
                  index === currentImageIndex
                    ? "ring-2 ring-moss-500 ring-offset-2 scale-105"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.image || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-contain"
                  crossOrigin="anonymous"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-moss-100 to-beige-100 border-moss-200">
            <CardContent className="p-8">
              <Heart className="h-8 w-8 text-moss-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-moss-900 mb-2">Gostou do que viu?</h3>
              <p className="text-moss-700 mb-6">Reserve agora e viva essa experiência única na natureza amazônica</p>
              <Button className="bg-moss-600 hover:bg-moss-700 text-white" asChild>
                <a href="#calendario">
                  <Calendar className="mr-2 h-4 w-4" />
                  Verificar Disponibilidade
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
