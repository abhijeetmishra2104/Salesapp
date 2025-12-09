"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { ShoppingCart, Star, Eye } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface ProductCardProps {
  product: Product
}

const badgeVariants: Record<string, string> = {
  sale: "bg-red-500 text-white",
  "wedding-collection": "bg-pink-100 text-pink-800",
  bestseller: "bg-amber-100 text-amber-800",
  "new-arrival": "bg-blue-100 text-blue-800",
  trending: "bg-emerald-100 text-emerald-800",
  comfortable: "bg-sky-100 text-sky-800",
  "low-stock": "bg-orange-100 text-orange-800",
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useStore()
  const [showDetails, setShowDetails] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>("")

  const handleAddToCart = () => {
    if (!selectedSize && product.attributes.sizes?.length > 0) {
      setShowDetails(true)
      return
    }

    dispatch({
      type: "ADD_TO_CART",
      item: {
        sku: product.sku,
        name: product.name,
        price: product.salePrice || product.price,
        quantity: 1,
        size: selectedSize,
        image: product.images[0],
      },
    })
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.badges.map((badge) => (
              <Badge key={badge} className={cn("text-xs", badgeVariants[badge] || "bg-muted text-muted-foreground")}>
                {badge.replace("-", " ")}
              </Badge>
            ))}
          </div>

          {/* Quick actions */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => setShowDetails(true)}>
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            {hasDiscount ? (
              <>
                <span className="font-semibold text-red-500">${product.salePrice}</span>
                <span className="text-sm text-muted-foreground line-through">${product.price}</span>
                <Badge variant="secondary" className="text-xs">
                  -{discountPercent}%
                </Badge>
              </>
            ) : (
              <span className="font-semibold">${product.price}</span>
            )}
          </div>

          <Button className="w-full mt-2 gap-2" size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground">{product.description}</p>

              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl font-bold text-red-500">${product.salePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">${product.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">${product.price}</span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Details:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Color: {product.attributes.color}</li>
                  <li>Material: {product.attributes.material}</li>
                  {product.attributes.heelHeight && <li>Heel Height: {product.attributes.heelHeight}</li>}
                </ul>
              </div>

              {product.attributes.sizes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Size:</p>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.attributes.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          Size {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    handleAddToCart()
                    if (selectedSize) setShowDetails(false)
                  }}
                  disabled={product.attributes.sizes?.length > 0 && !selectedSize}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
