"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Home, Utensils, Waves, TreePine, Camera, Heart, Calendar, X, ZoomIn } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

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
  {
    id: 16,
    category: "rio",
    title: "Mesa na Piscina Natural",
    description: "Mesa posicionada na piscina natural para refeições únicas em contato com a natureza",
    image: "/mesa-na-piscina-natural.jpeg",
  },
]

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)

  const filteredImages =
    activeCategory === "all" ? galleryImages : galleryImages.filter((img) => img.category === activeCategory)

  // Embla Carousel configuration with touch support
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentImageIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  // Reset carousel when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    setCurrentImageIndex(0)
    if (emblaApi) {
      emblaApi.reInit()
    }
  }

  const handleImageZoom = (image: typeof galleryImages[0]) => {
    setSelectedImage(image)
    setIsZoomOpen(true)
  }

  // Ensure currentImageIndex is always valid
  useEffect(() => {
    if (filteredImages.length > 0 && currentImageIndex >= filteredImages.length) {
      setCurrentImageIndex(0)
      if (emblaApi) {
        emblaApi.scrollTo(0)
      }
    }
  }, [filteredImages, currentImageIndex, emblaApi])

  return (
    <section id="galeria" className="py-20 bg-gradient-to-br from-beige-50 to-moss-50 texture-organic relative">
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

        {/* Main Carousel with Touch Support */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-moss-200 shadow-xl">
            <CardContent className="p-0 relative">
              {filteredImages.length > 0 && (
                <>
                  {/* Embla Carousel Container */}
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex touch-pan-y">
                      {filteredImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="flex-[0_0_100%] min-w-0"
                        >
                          <div className="relative aspect-[3/2] overflow-hidden bg-moss-100 cursor-pointer group">
                            <Image
                              src={image.image || "/placeholder.svg"}
                              alt={image.title}
                              fill
                              className="object-contain transition-all duration-500 group-hover:scale-105"
                              crossOrigin="anonymous"
                              priority={index === 0}
                            />
                            
                            {/* Zoom Button Overlay */}
                            <button
                              onClick={() => handleImageZoom(image)}
                              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300"
                              aria-label="Ampliar imagem"
                            >
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                                <ZoomIn className="h-6 w-6 text-moss-900" />
                              </div>
                            </button>

                            {/* Image Counter */}
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm font-medium">
                              {currentImageIndex + 1} / {filteredImages.length}
                            </div>

                            {/* Progress Indicators (Dots) - dentro da imagem */}
                            {index === currentImageIndex && (
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                                {filteredImages.map((_, dotIndex) => (
                                  <button
                                    key={dotIndex}
                                    onClick={() => scrollTo(dotIndex)}
                                    className={`transition-all duration-300 rounded-full ${
                                      dotIndex === currentImageIndex
                                        ? "bg-white w-8 h-2"
                                        : "bg-white/50 hover:bg-white/80 w-2 h-2"
                                    }`}
                                    aria-label={`Ir para imagem ${dotIndex + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 md:left-4 top-[25%] -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full h-10 w-10 md:h-12 md:w-12 transition-all duration-300"
                    onClick={scrollPrev}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 md:right-4 top-[25%] -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full h-10 w-10 md:h-12 md:w-12 transition-all duration-300"
                    onClick={scrollNext}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>


                  {/* Image Info */}
                  {filteredImages[currentImageIndex] && (
                    <div className="p-6 bg-gradient-to-r from-moss-50 to-beige-50 animate-fadeIn">
                      <h3 className="text-xl font-bold text-moss-900 mb-2">{filteredImages[currentImageIndex].title}</h3>
                      <p className="text-moss-700">{filteredImages[currentImageIndex].description}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Thumbnail Navigation with Smooth Scroll */}
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x">
            {filteredImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => scrollTo(index)}
                className={`flex-shrink-0 relative aspect-[4/3] w-20 md:w-24 rounded-lg overflow-hidden transition-all duration-300 bg-moss-100 snap-start ${
                  index === currentImageIndex
                    ? "ring-3 ring-moss-500 ring-offset-2 scale-105 shadow-lg"
                    : "opacity-70 hover:opacity-100 hover:scale-105 hover:shadow-md"
                }`}
              >
                <Image
                  src={image.image || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-contain transition-transform duration-300"
                  crossOrigin="anonymous"
                />
                {index === currentImageIndex && (
                  <div className="absolute inset-0 border-2 border-moss-500 rounded-lg pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Modal */}
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-0">
            <VisuallyHidden>
              <DialogTitle>Visualização ampliada da imagem</DialogTitle>
            </VisuallyHidden>
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedImage && (
                <>
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedImage.image || "/placeholder.svg"}
                      alt={selectedImage.title}
                      fill
                      className="object-contain"
                      crossOrigin="anonymous"
                      priority
                    />
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsZoomOpen(false)}
                    className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300"
                    aria-label="Fechar zoom"
                  >
                    <X className="h-6 w-6" />
                  </button>

                  {/* Image Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                    <p className="text-white/90">{selectedImage.description}</p>
                  </div>

                  {/* Navigation in Zoom */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full h-12 w-12"
                    onClick={() => {
                      scrollPrev()
                      const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1
                      setSelectedImage(filteredImages[prevIndex])
                    }}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full h-12 w-12"
                    onClick={() => {
                      scrollNext()
                      const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
                      const nextIndex = (currentIndex + 1) % filteredImages.length
                      setSelectedImage(filteredImages[nextIndex])
                    }}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-moss-100 to-beige-100 border-moss-200">
            <CardContent className="p-8">
              <Heart className="h-8 w-8 text-moss-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-moss-900 mb-2">Gostou do que viu?</h3>
              <p className="text-moss-700 mb-6">Reserve agora e viva essa experiência única na natureza amazônica</p>
              <Button className="bg-moss-600 hover:bg-moss-700 text-white" asChild>
                <Link href="/checkout">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reservar Agora
                </Link>
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
