"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { fetchProducts } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search } from "lucide-react"

interface Product {
  sku: string
  name: string
  category: string
  price: number
  salePrice: number | null
  description: string
  attributes: {
    color: string
    material: string
    heelHeight?: string
    sizes: string[]
  }
  images: string[]
  badges: string[]
  rating: number
  reviews: number
}

const categories = [
  { id: "all", label: "All Products" },
  { id: "heels", label: "Heels" },
  { id: "flats", label: "Flats" },
  { id: "boots", label: "Boots" },
  { id: "sneakers", label: "Sneakers" },
  { id: "accessories", label: "Accessories" },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    fetchProducts(category === "all" ? undefined : category).then((result) => {
      if (result.success) {
        setProducts(result.data)
      }
      setLoading(false)
    })
  }, [category])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Shop Collection</h1>
            <p className="text-muted-foreground">Discover perfect shoes for your special occasion</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap h-auto gap-2">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="px-4">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found</p>
            <Button
              variant="link"
              onClick={() => {
                setSearch("")
                setCategory("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
