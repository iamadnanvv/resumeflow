export type ResumeContent = {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    link: string;
    description: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
};

export const emptyResume: ResumeContent = {
  personal: { fullName: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

export const sampleResume: ResumeContent = {
  personal: {
    fullName: "Alex Morgan",
    title: "Senior Product Engineer",
    email: "alex@example.com",
    phone: "+1 555 0142",
    location: "San Francisco, CA",
    website: "alexmorgan.dev",
    summary: "Product-minded engineer with 7+ years building scalable web applications. Led teams shipping features used by millions.",
  },
  experience: [
    {
      id: "e1",
      role: "Senior Product Engineer",
      company: "Lumen Labs",
      location: "Remote",
      startDate: "2022",
      endDate: "Present",
      bullets: [
        "Led migration to Next.js 14 reducing TTI by 47%.",
        "Built design system adopted across 6 product teams.",
      ],
    },
  ],
  education: [
    { id: "ed1", degree: "B.S. Computer Science", school: "UC Berkeley", startDate: "2014", endDate: "2018", description: "" },
  ],
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  projects: [],
  certifications: [],
  languages: [],
};