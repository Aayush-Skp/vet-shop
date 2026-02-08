/**
 * Services Model - Service categories and offerings
 */

const servicesModel = {
  categories: [
    {
      id: "veterinary-care",
      title: "Veterinary Care",
      icon: "stethoscope",
      services: [
        "General check-ups & consultations",
        "Vaccinations & preventive care",
        "Surgery & emergency care",
        "Dental care",
      ],
    },
    {
      id: "pet-wellness",
      title: "Pet Wellness",
      icon: "heart",
      services: [
        "Health monitoring",
        "Nutrition counseling",
        "Weight management",
        "Senior pet care",
      ],
    },
    {
      id: "grooming",
      title: "Grooming Services",
      icon: "scissors",
      services: [
        "Bathing & grooming",
        "Nail trimming",
        "Coat care",
        "Hygiene services",
      ],
    },
    {
      id: "accessories-food",
      title: "Pet Accessories & Food",
      icon: "shopping-bag",
      services: [
        "Quality pet food",
        "Toys & accessories",
        "Medications",
        "Supplements",
      ],
    },
  ],
  ctaButton: "View All Services",
};
