import { Project, MediumMeta } from './types';

export const PROJECTS: Project[] = [
  {
    id: "001",
    title: "NEON VELOCITY",
    thema: "Cyberpunk",
    medium: "Motion Graphics",
    client: "Synthwave Records",
    secondTitle: "The Pulse of Tomorrow",
    description: "A comprehensive motion branding package for a leading synthwave label, focusing on retro-futurism.",
    startDate: "15/01/2024",
    endDate: "15/03/2024",
    totalAudience: "1'200'000",
    link: "https://example.com/project-1",
    thumbnail: "https://picsum.photos/seed/p1/800/600",
    context: "The client needed a visual identity that felt both nostalgic for the 80s and aggressively futuristic.",
    goal: "Increase label brand recognition by 40% across digital streaming platforms.",
    impactAnalysis: "Post-launch metrics showed a 55% increase in playlist saves and high engagement on motion assets.",
    learnings: "Dynamic typography performs significantly better than static logos in the current algorithmic environment.",
    credits: [
      { role: "Creative Director", name: "Alex Rivet" },
      { role: "Motion Designer", name: "Sarah Chen" },
      { role: "Sound Design", name: "LFO Studio" }
    ],
    relatedLinks: [
      { label: "Learn more about Synthwave Branding", url: "#" },
      { label: "You might love: DIGITAL RUSH", url: "#" }
    ]
  },
  {
    id: "002",
    title: "HALFTONE DREAMS",
    thema: "Abstract",
    medium: "Print Media",
    client: "Art Basel",
    secondTitle: "Exploring Digital Grain",
    description: "An exploration of physical textures translated into digital halftone patterns.",
    startDate: "01/08/2023",
    endDate: "20/11/2023",
    totalAudience: "50'000",
    link: "https://example.com/project-2",
    thumbnail: "https://picsum.photos/seed/p2/800/600",
    context: "Commissioned for the 2023 winter showcase to bridge the gap between digital generative art and traditional printing.",
    goal: "Create a tactile souvenir experience for attendees that feels unique to the touch.",
    impactAnalysis: "70% of printed catalogs were claimed within the first 48 hours of the event.",
    learnings: "UV spot coatings on halftone patterns create unexpected and welcome optical illusions.",
    credits: [
      { role: "Lead Artist", name: "Julian Thorne" },
      { role: "Print Specialist", name: "Ink & Paper Co." },
      { role: "Curator", name: "Elena Rossi" }
    ],
    relatedLinks: [
      { label: "Print Process Documentation", url: "#" },
      { label: "You might love: TEXTURE STUDY 04", url: "#" }
    ]
  },
  {
    id: "003",
    title: "ORANGE MONOLITH",
    thema: "Minimalism",
    medium: "3D Installation",
    client: "TechCorp Global",
    secondTitle: "Static Movement",
    description: "A site-specific installation using light and shadow to create a monumental orange monolith.",
    startDate: "10/10/2023",
    endDate: "10/01/2024",
    totalAudience: "250'000",
    link: "https://example.com/project-3",
    thumbnail: "https://picsum.photos/seed/p3/800/600",
    context: "Designed for the lobby of TechCorp's new sustainable headquarters in Oslo.",
    goal: "Represent the brand's 'Solid Foundation, Infinite Energy' philosophy through geometry.",
    impactAnalysis: "Became the #1 photographed location in the building, increasing corporate social presence.",
    learnings: "Ambient lighting conditions vary more than simulated models predicted; real-time sensor adjustment was key.",
    credits: [
      { role: "Architect", name: "Bjorn Hansen" },
      { role: "Lighting Tech", name: "Lumina Works" },
      { role: "Project Manager", name: "Mark Sterling" }
    ],
    relatedLinks: [
      { label: "Architectural Deep Dive", url: "#" },
      { label: "You might love: BLUE VOID", url: "#" }
    ]
  }
];

export const MEDIUM_METADATA: Record<string, MediumMeta> = {
  "Motion Graphics": {
    id: "mg",
    title: "Motion Graphics",
    description: "Creating rhythm through temporal compositions and dynamic visual hierarchies.",
    approach: "My approach to motion involves treating every frame as a potential poster. I focus on easing, kinetic typography, and the synchronization of visual data with auditory cues to maximize viewer retention in high-velocity digital environments."
  },
  "Print Media": {
    id: "pm",
    title: "Print Media",
    description: "Bridging the tactile world with digital precision through halftone and ink.",
    approach: "In print, I explore the friction between the digital pixel and the physical drop of ink. I specialize in high-contrast halftone techniques and experimental paper stocks, ensuring that the final physical artifact carries a weight that digital media cannot replicate."
  },
  "3D Installation": {
    id: "3d",
    title: "3D Installation",
    description: "Manipulating space, light, and geometry to redefine physical environments.",
    approach: "Spatial design is about the dialogue between the viewer and the structure. I use 3D installations to create immersive, monochromatic experiences that play with light and shadow, transforming static architecture into a living, breathing narrative space."
  }
};