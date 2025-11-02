import Link from "next/link";
import Image from "next/image";

export default function Home() {

  const section2 = [
    {
      title: "Why Choose Bohn Voyage?",
      description: "We offer the best experience on the Salt River. Our inflatable platforms are the most comfortable and durable on the market. We are the only company that offers a full day of floating with a lunch included.",
    },
    {
      title: "What is included in the 24 hour platform rental?",
      description: "We offer the best experience on the Salt River, offering a unique experience on the Salt River. Included in the 24 hour platform rental is:",
      list: [
        "24 hour rental of our inflatable platforms",
        "Tonto National Forest Adventure Pass",
        "Chairs",
        "Waters",
        "Clear Instructions",
        "A Great Time!",
      ]
    }
  ]

  const section3 = [{
    title: "Book Your Tubes",
    description: "Select your preferred date and time, then choose from our selection of premium tubes in various sizes. We offer tubes suitable for individuals and groups.",
  },
  {
    title: "Arrive & Get Ready",
    description: "On your scheduled day, arrive at our launch point where you'll receive your tubes and safety equipment. Our staff will provide a brief orientation on river safety.",
  },
  {
    title: "Launch & Float",
    description: "Enter the river and let the gentle current carry you downstream. Relax, enjoy the scenery, and create lasting memories as you float through nature's beauty.",
  }]

  const section4 = [{
    title: "Follow Safety Guidelines",
    description: "Stay within the designated floating area, wear your life vest, and keep hydrated. Always stay with your group and be aware of your surroundings.",
  },
  {
    title: "Exit & Return",
    description: "At the designated exit point, return your tubes and equipment. Transportation back to the launch point is available. Share your adventure with friends!",
  }]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/river2.jpg"
            alt="Scenic river view"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Float Your Way to Adventure
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">
            Experience Arizona&apos;s serenity by floating down the Salt River on our premium inflatable platforms
          </p>
          <Link
            href="/book"
            className="inline-block bg-secondary hover:opacity-90 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Book Your Float
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 flex flex-col items-center justify-center gap-12 bg-gradient-to-b from-primary to-quaternary">
        {section2.map((section, index) => (
          <div key={index} className="md:w-2/3 w-full mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center my-4 text-secondary">
              {section.title}
            </h2>
            <p className="text-secondary text-2xl text-center leading-relaxed">
              {section.description}
            </p>
            {section.list && <div className="py-4 text-secondary grid grid-cols-1 md:grid-cols-2 gap-4 text-2xl text-center leading-relaxed">
              {section.list.map((item) => (
                <p key={item} className="bg-primary rounded-lg p-4">{item}</p>
              ))}
            </div>}
          </div>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-quaternary">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-secondary">
          How to Get Started Floating Down the River
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {section3.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-secondary text-white rounded-full text-2xl font-bold mb-6 mx-auto">
                {index + 1}
              </div>
              <h3 className="text-2xl font-semibold text-secondary mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-gray-700 text-center leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}
        </div>


        {/* Additional Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {section4.map((section, index) => (
            <div key={index + 4} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-secondary text-white rounded-full text-2xl font-bold mb-6 mx-auto">
                {index + 4}
              </div>
              <h3 className="text-2xl font-semibold text-secondary mb-4 text-center">
                {section.title}
              </h3>
              <p className="text-gray-700 text-center leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}
        </div>


        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link
            href="/book"
            className="inline-block bg-secondary hover:opacity-90 text-white font-semibold py-4 px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Your River Adventure
          </Link>
        </div>
      </section>
    </div>
  );
}
