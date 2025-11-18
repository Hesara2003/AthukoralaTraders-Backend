import React from "react"
import { cn } from "../../lib/utils"

function RevealImageListItem({ text, images }) {
  const container = "absolute right-8 -top-1 z-40 h-20 w-16"
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-md"

  return (
    <div className="group relative h-fit w-fit overflow-visible py-8">
      <h1 className="text-7xl font-black text-foreground transition-all duration-500 group-hover:opacity-40">
        {text}
      </h1>
      <div className={container}>
        <div className={effect}>
          <img alt={images[1].alt} src={images[1].src} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12"
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img alt={images[0].alt} src={images[0].src} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}

function RevealImageList() {
  const items = [
    {
      text: "Quality",
      images: [
        {
          src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&auto=format&fit=crop&q=60",
          alt: "Quality products",
        },
        {
          src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&auto=format&fit=crop&q=60",
          alt: "Premium hardware",
        },
      ],
    },
    {
      text: "Trust",
      images: [
        {
          src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&auto=format&fit=crop&q=60",
          alt: "Customer trust",
        },
        {
          src: "https://images.unsplash.com/photo-1560264280-88b68371db39?w=200&auto=format&fit=crop&q=60",
          alt: "Partnership",
        },
      ],
    },
    {
      text: "Excellence",
      images: [
        {
          src: "https://images.unsplash.com/photo-1554224311-beee1ac91c7a?w=200&auto=format&fit=crop&q=60",
          alt: "Service excellence",
        },
        {
          src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&auto=format&fit=crop&q=60",
          alt: "Team excellence",
        },
      ],
    },
  ]
  return (
    <div className="flex flex-col gap-1 rounded-sm bg-background px-8 py-4">
      <h3 className="text-sm font-black uppercase text-muted-foreground">Our Values</h3>
      {items.map((item, index) => (
        <RevealImageListItem key={index} text={item.text} images={item.images} />
      ))}
    </div>
  )
}

export { RevealImageList }
