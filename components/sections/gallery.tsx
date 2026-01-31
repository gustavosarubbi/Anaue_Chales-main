"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

// ... existing categories and images data ...
const galleryCategories = [
  { id: "all", name: "Todos", description: "Explore todos os cantos do nosso refúgio" },
  { id: "chale2", name: "Chalé Camping Luxo", description: "Conheça nossa nova opção premium" },
  { id: "chales", name: "Chalé Master", description: "O clássico charme rústico" },
  { id: "natureza", name: "Natureza & Rio", description: "Imersão total na floresta amazônica" },
  { id: "gastronomia", name: "Gastronomia", description: "Sabores e experiências únicas" },
]

const galleryImages = [
  // Chalé Camping Luxo (Antigo Anauê)
  {
    id: 1,
    category: "chales",
    title: "Chalé Master - Exterior",
    description: "Vista externa do chalé integrado à natureza",
    image: "/Chale-1.jpg",
    featured: true
  },
  {
    id: 2,
    category: "chales",
    title: "Chalé Master - Varanda",
    description: "Varanda aconchegante para relaxar",
    image: "/chale-2.jpg",
  },
  {
    id: 3,
    category: "chales",
    title: "Quarto com TV",
    description: "Conforto e entretenimento",
    image: "/cama-casal-com-tv.jpg",
  },
  {
    id: 4,
    category: "chales",
    title: "Banheiro Moderno",
    description: "Comodidade e estilo",
    image: "/banheiro-box.jpg",
  },
  {
    id: 5,
    category: "chales",
    title: "Área de Descanso",
    description: "Relaxe na rede",
    image: "/lugar-para-deitar-.jpg",
  },
  {
    id: 15,
    category: "chales",
    title: "Hidromassagem",
    description: "Relaxe em nossa banheira",
    image: "/banheira.jpeg",
    featured: true
  },

  // Chalé Camping Luxo (Antigo Chalé 2)
  { id: 201, category: "chale2", title: "Chalé Camping Luxo - Vista Aérea", description: "Visão geral do novo chalé", image: "/Chale 2/IMG_3189.jpg", featured: true },
  { id: 202, category: "chale2", title: "Chalé Camping Luxo - Fachada", description: "Design moderno na selva", image: "/Chale 2/IMG_3190.jpg" },
  { id: 203, category: "chale2", title: "Chalé Camping Luxo - Interior", description: "Espaço e conforto", image: "/Chale 2/IMG_3191.jpg" },
  { id: 204, category: "chale2", title: "Chalé Camping Luxo - Quarto", description: "Climatizado e aconchegante", image: "/Chale 2/IMG_3192.jpg" },
  { id: 205, category: "chale2", title: "Chalé Camping Luxo - Banheiro", description: "Privacidade e modernidade", image: "/Chale 2/IMG_3193.jpg" },
  { id: 206, category: "chale2", title: "Chalé Camping Luxo - Detalhes", description: "Acabamento premium", image: "/Chale 2/IMG_3194.jpg" },
  { id: 207, category: "chale2", title: "Chalé Camping Luxo - Varanda", description: "Vista arborizada", image: "/Chale 2/IMG_3195.jpg" },
  { id: 208, category: "chale2", title: "Chalé Camping Luxo - Entrada", description: "Acesso privativo", image: "/Chale 2/IMG_3196.jpg" },
  { id: 209, category: "chale2", title: "Chalé Camping Luxo - Conforto", description: "Espaço amplo", image: "/Chale 2/IMG_3197.jpg" },
  { id: 210, category: "chale2", title: "Chalé Camping Luxo - Design", description: "Iluminação natural", image: "/Chale 2/IMG_3200.jpg" },
  { id: 211, category: "chale2", title: "Chalé Camping Luxo - Estilo", description: "Móveis planejados", image: "/Chale 2/IMG_3202.jpg" },
  { id: 212, category: "chale2", title: "Chalé Camping Luxo - Lounge", description: "Relaxamento garantido", image: "/Chale 2/IMG_3205.jpg" },
  { id: 213, category: "chale2", title: "Chalé Camping Luxo - Suite", description: "Privacidade total", image: "/Chale 2/IMG_3212.jpg" },
  { id: 214, category: "chale2", title: "Chalé Camping Luxo - Panorama", description: "Vista incrível", image: "/Chale 2/IMG_3221.jpg" },
  { id: 215, category: "chale2", title: "Chalé Camping Luxo - Deck", description: "Aproveite a brisa", image: "/Chale 2/IMG_3224.jpg" },
  { id: 216, category: "chale2", title: "Chalé Camping Luxo - Pôr do Sol", description: "Momentos mágicos", image: "/Chale 2/IMG_3225.jpg" },
  { id: 217, category: "chale2", title: "Chalé Camping Luxo - Noite", description: "Iluminação aconchegante", image: "/Chale 2/IMG_3226.jpg" },

  // Natureza & Rio
  {
    id: 11,
    category: "natureza",
    title: "Rio Natural",
    description: "Refresque-se nas águas",
    image: "/rio-natural.jpg",
    featured: true
  },
  {
    id: 12,
    category: "natureza",
    title: "Deck à Beira do Rio",
    description: "Contemple a vista",
    image: "/cadeiras-beira-rio.jpg",
  },
  {
    id: 13,
    category: "natureza",
    title: "Redário",
    description: "Descanso ao som da natureza",
    image: "/redes-a-beira-do-rio.jpg",
  },
  {
    id: 14,
    category: "natureza",
    title: "Stand-Up Paddle",
    description: "Aventura no rio",
    image: "/Stand-Up-Paddle.jpg",
  },
  {
    id: 16,
    category: "natureza",
    title: "Piscina Natural",
    description: "Mesa dentro d'água",
    image: "/mesa-na-piscina-natural.jpeg",
  },

  // Gastronomia
  {
    id: 6,
    category: "gastronomia",
    title: "Café da Manhã",
    description: "Comece o dia bem",
    image: "/café-da-manha.jpg",
    featured: true
  },
  {
    id: 7,
    category: "gastronomia",
    title: "Área Gourmet",
    description: "Churrasqueira com vista",
    image: "/churrasqueiro-com-vista-ao-rio.jpg",
  },
  {
    id: 8,
    category: "gastronomia",
    title: "Cozinha Completa",
    description: "Tudo para seu chef interior",
    image: "/frigobar-microondas.jpg",
  },
  {
    id: 9,
    category: "gastronomia",
    title: "Minibar",
    description: "Bebidas Geladas",
    image: "/frigobar-bebida.jpg",
  },
  {
    id: 10,
    category: "gastronomia",
    title: "Lazer",
    description: "Mesa de sinuca",
    image: "/mesa-de-sinuca.jpg",
  },
]


export function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)
  const [showAll, setShowAll] = useState(false)

  const INITIAL_DISPLAY_LIMIT = 6

  const filteredImages = activeCategory === "all"
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory)

  const displayedImages = showAll ? filteredImages : filteredImages.slice(0, INITIAL_DISPLAY_LIMIT)

  const handleNext = () => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    const nextIndex = (currentIndex + 1) % filteredImages.length
    setSelectedImage(filteredImages[nextIndex])
  }

  const handlePrev = () => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    setSelectedImage(filteredImages[prevIndex])
  }

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    setShowAll(false) // Reset pagination when category changes
  }

  return (
    <section id="galeria" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-moss-600 text-moss-700 px-4 py-1 text-sm tracking-wide bg-moss-50">
            NOSSO ESPAÇO
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 tracking-tight">
            Galeria de Fotos
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Cada detalhe foi pensado para proporcionar uma experiência inesquecível de conexão com a natureza.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {galleryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat.id
                ? "bg-moss-700 text-white shadow-lg scale-105"
                : "bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {displayedImages.map((image, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                key={image.id}
                className="break-inside-avoid"
              >
                <div
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-500"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative w-full">
                    <Image
                      src={image.image}
                      alt={image.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <h3 className="text-white font-bold text-lg">{image.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{image.description}</p>
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {!showAll && filteredImages.length > INITIAL_DISPLAY_LIMIT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={() => setShowAll(true)}
              className="bg-white text-moss-700 hover:bg-moss-50 border-2 border-moss-200 hover:border-moss-300 px-10 py-6 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              Ver mais fotos
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none shadow-none flex flex-col items-center justify-center outlines-none">
          <VisuallyHidden>
            <DialogTitle>Visualização da Imagem</DialogTitle>
          </VisuallyHidden>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {selectedImage && (
            <div className="relative w-full h-full p-4 md:p-10 flex items-center justify-center">
              <div className="relative w-full h-full max-w-7xl max-h-[85vh]">
                <Image
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-white text-2xl font-semibold mb-2">{selectedImage.title}</h3>
                <p className="text-white/70">{selectedImage.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
