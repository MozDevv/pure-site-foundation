// Update this page (the content is just a fallback if you fail to update the page)

import {
  Brain,
  Code,
  Users,
  GraduationCap,
  Rocket,
  HandHeart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import heroImage from '@/assets/hero-bg.jpg';
import CountUp from 'react-countup';
import { PlayCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
const Index = () => {
  const stats = [
    {
      value: 5000,
      suffix: '+',
      label: 'Students',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      value: 30,
      suffix: '+',
      label: 'Instructors',
      icon: GraduationCap,
      color: 'bg-yellow-500',
    },
    {
      value: 200,
      suffix: '+',
      label: 'Learning Videos',
      icon: PlayCircle,
      color: 'bg-green-500',
    },
    {
      value: 100,
      suffix: '+',
      label: 'Study Materials',
      icon: BookOpen,
      color: 'bg-teal-500',
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="  py- bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container  flex flex-col-reverse md:flex-row items-center gap-12 min-h-[70vh]">
          {/* Left: Text */}
          <div className="mt-28 sm:mt-0 flex-1 text-center md:text-left ">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary">
              TechAI Program
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto md:mx-0 leading-relaxed">
              Empowering youth with comprehensive training, mentoring, and
              real-world exposure in data and tech careers
            </p>
            <div className="flex flex-col mt-20 sm:mt-0 sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start">
              <Button variant="hero" size="xl" asChild>
                <a href="/apply">Join Our Program</a>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Learn More
              </Button>
            </div>
          </div>
          {/* Right: Image */}
          {/* Right: Image with blob background */}
          <div className="relative flex-2 hidden  md:flex justify-center items-center">
            {/* Blob Background */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="absolute -top-12 -right-24 w-[650px] h-[650px] z-0"
            >
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  fill="#006990"
                  d="M58.4,-66.3C73.1,-55.5,82.9,-36.7,84.6,-17.4C86.3,1.9,80,21.8,68.5,34.9C57.1,48,40.6,54.3,24.2,60.1C7.8,65.9,-8.6,71.3,-24.1,68.2C-39.5,65,-54.1,53.4,-64.5,38.3C-75,23.2,-81.3,4.7,-76.9,-11.4C-72.4,-27.4,-57.3,-41.1,-42,-52C-26.7,-62.9,-13.4,-70.9,3.6,-75.1C20.7,-79.2,41.3,-79.5,58.4,-66.3Z"
                  transform="translate(100 100) "
                />
              </svg>
            </motion.div>

            {/* The image */}
            <motion.img
              src="/landing.png"
              alt="TechAI  Hero"
              className="w-full max-w-xl object-cover relative z-10"
              loading="lazy"
              initial={{ opacity: 0, scale: 0.9, y: 60 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
            />

            {/* Floating Card - moved more to the left and with a primary gradient background */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="absolute top-[-50px] left-[-50px] bg-gradient-to-br from-primary/60 to-primary/40 shadow-xl rounded-2xl p-4 flex items-center gap-3 z-20"
            >
              {/* Avatars */}
              <div className="flex -space-x-2">
                <img
                  src="https://img.freepik.com/free-photo/casual-young-african-man-smiling-isolated-white_93675-128895.jpg?t=st=1757538615~exp=1757542215~hmac=3177d9d358f024ade52fd79e1ff4c8e96a0f6b1b345a34b6817467c416871294&w=1480"
                  alt="Student"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <img
                  src="https://img.freepik.com/free-photo/casual-young-african-man-smiling-isolated-white_93675-128895.jpg?t=st=1757538615~exp=1757542215~hmac=3177d9d358f024ade52fd79e1ff4c8e96a0f6b1b345a34b6817467c416871294&w=1480"
                  alt="Student"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <img
                  src="https://img.freepik.com/free-photo/casual-young-african-man-smiling-isolated-white_93675-128895.jpg?t=st=1757538615~exp=1757542215~hmac=3177d9d358f024ade52fd79e1ff4c8e96a0f6b1b345a34b6817467c416871294&w=1480"
                  alt="Student"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              </div>

              {/* Text + Stars */}
              <div>
                <p className="text-sm font-semibold text-white drop-shadow">
                  5,000+ Students
                </p>
                <div className="flex items-center text-yellow-400">
                  {/* 5 stars */}
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.889 2.134c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.48 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-10 bg-white">
        <div className="container text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-row items-center gap-4  p-6"
              >
                {/* Icon circle */}
                <div className=""></div>
                <div
                  className={`w-16 hidden  h-16 md:flex items-center justify-center rounded-full ${stat.color}`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>

                {/* Number and Label */}
                <div className="flex flex-col items-start">
                  <h3 className="text-3xl font-bold mb-1 text-primary">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  </h3>
                  <p className="text-lg text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-20 bg-muted">
        <div className="container flex flex-col md:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-6 text-primary">
              Our Mission
            </h2>
            <div className="text-lg text-muted-foreground space-y-6 max-w-xl">
              <p>
                The TechAI Program is designed to bridge the opportunity gap in
                technology and data careers. We believe every young person
                deserves access to quality training, expert mentorship, and
                real-world experience that opens doors to successful tech
                careers.
              </p>
              <p>
                Our comprehensive approach combines hands-on learning with
                industry connections, ensuring participants don't just learn
                skills—they build careers.
              </p>
            </div>
          </div>
          {/* Right: Illustration/Image */}
          <div className="flex-1 flex justify-center">
            <img
              src="study-group-african-people.jpg"
              alt="TechAI Mission"
              className="rounded-xl shadow-lg w-full max-w-md object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              Program Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-elegant hover:shadow-primary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-primary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Comprehensive TechAI Training
                </h3>
                <p className="text-muted-foreground">
                  Complete program covering data science, AI, and emerging
                  technologies with comprehensive training, mentoring, and
                  innovation development opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-secondary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-secondary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Expert Mentorship</h3>
                <p className="text-muted-foreground">
                  Real-life project implementation guided by expert mentors from
                  industry-leading companies, providing hands-on experience and
                  professional guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-accent transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-accent p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Innovation Showcase</h3>
                <p className="text-muted-foreground">
                  Ready-to-showcase products developed by current participants,
                  demonstrating real-world application of learned skills and
                  technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-primary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-primary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <HandHeart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Strategic Partnerships
                </h3>
                <p className="text-muted-foreground">
                  Strategic partnerships providing opportunities at Pwani and
                  Nairobi Innovation Weeks, connecting participants with
                  industry leaders and potential employers.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-secondary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-secondary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Career Pathway</h3>
                <p className="text-muted-foreground">
                  Clear pathway from training to investor exposure, ensuring
                  participants have direct routes to career opportunities and
                  entrepreneurial ventures.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-accent transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-accent p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Real-World Impact</h3>
                <p className="text-muted-foreground">
                  Focus on solving real community and industry challenges,
                  giving participants meaningful experience while making a
                  positive impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join the next generation of tech leaders and innovators.
            Applications are now open for our comprehensive TechAI Program.
          </p>
          <div className="flex  flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <a href="/apply">Apply to Program</a>
            </Button>
            <Button variant="success" size="lg" className="" asChild>
              <a href="/signin">Sign In</a>
            </Button>
            {/* <Button variant="default" size="xl" className="" asChild>
              <a href="/tutor">Tutor Portal</a>
            </Button>
            <Button variant="default" size="xl" className="" asChild>
              <a href="/admin">Admin Portal</a>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg bg-primary p-2">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">TechAI</span>
              </div>
              <p className="text-muted-foreground">
                Empowering youth with comprehensive tech and data career
                opportunities through training, mentoring, and innovation.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-accent">Programs</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>TechAI Course</p>
                <p>Mentorship Program</p>
                <p>Innovation Showcase</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-accent">Contact</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: info@zanarianalytics.com</p>
                <p>Phone: +254 746 854 108</p>
                <p>Address: Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-muted-foreground">
              © 2025 TechAI Program. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
