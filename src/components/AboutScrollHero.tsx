import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export function AboutScrollHero() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1280&auto=format&fit=crop&q=80"
      bgImageSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&auto=format&fit=crop&q=80"
      title="Athukorala Traders"
      date="Since 1995"
      scrollToExpand="Scroll to Explore Our Story"
      textBlend={true}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          30 Years of Hardware Excellence
        </h2>
        <p className="text-lg mb-8 text-gray-700 leading-relaxed">
          From humble beginnings to becoming Sri Lanka's most trusted hardware supplier, 
          our journey has been built on quality, service, and unwavering commitment to our customers. 
          Discover what makes us different and why thousands choose Athukorala Traders for their hardware needs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">30+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Products Available</div>
          </div>
        </div>
      </div>
    </ScrollExpandMedia>
  );
}