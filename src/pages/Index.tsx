// Update this page (the content is just a fallback if you fail to update the page)

import { Brain, Code, Users, GraduationCap, Rocket, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              TechAI Foundation Program
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Empowering youth with comprehensive training, mentoring, and real-world exposure in data and tech careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="xl" asChild>
                <a href="/apply">Join Our Program</a>
              </Button>
              <Button variant="outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              Our Mission
            </h2>
            <div className="max-w-4xl mx-auto text-lg text-muted-foreground space-y-6">
              <p>
                The TechAI Foundation Program is designed to bridge the opportunity gap in technology and data careers. 
                We believe every young person deserves access to quality training, expert mentorship, and real-world experience 
                that opens doors to successful tech careers.
              </p>
              <p>
                Our comprehensive approach combines hands-on learning with industry connections, ensuring participants 
                don't just learn skills—they build careers.
              </p>
            </div>
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
                <h3 className="text-xl font-bold mb-4">Comprehensive TechAI Training</h3>
                <p className="text-muted-foreground">
                  Complete foundation program covering data science, AI, and emerging technologies with comprehensive 
                  training, mentoring, and innovation development opportunities.
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
                  Real-life project implementation guided by expert mentors from industry-leading companies, 
                  providing hands-on experience and professional guidance.
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
                  Ready-to-showcase products developed by current participants, demonstrating real-world 
                  application of learned skills and technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-primary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-primary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <HandHeart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Strategic Partnerships</h3>
                <p className="text-muted-foreground">
                  Strategic partnerships providing opportunities at Pwani and Nairobi Innovation Weeks, 
                  connecting participants with industry leaders and potential employers.
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
                  Clear pathway from training to investor exposure, ensuring participants have direct routes 
                  to career opportunities and entrepreneurial ventures.
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
                  Focus on solving real community and industry challenges, giving participants meaningful 
                  experience while making a positive impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-4xl font-bold mb-2 text-accent">100+</h3>
              <p className="text-lg text-white/90">Youth Trained</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2 text-accent">50+</h3>
              <p className="text-lg text-white/90">Projects Completed</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2 text-accent">25+</h3>
              <p className="text-lg text-white/90">Industry Partners</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2 text-accent">90%</h3>
              <p className="text-lg text-white/90">Career Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Future?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join the next generation of tech leaders and innovators. Applications are now open for our 
            comprehensive TechAI Foundation Program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="xl" asChild>
              <a href="/apply">Apply to Program</a>
            </Button>
            <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="/student">Student Portal</a>
            </Button>
            <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="/admin">Admin Portal</a>
            </Button>
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
                <span className="text-xl font-bold text-primary">
                  TechAI Foundation
                </span>
              </div>
              <p className="text-muted-foreground">
                Empowering youth with comprehensive tech and data career opportunities through training, 
                mentoring, and innovation.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-accent">Programs</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>TechAI Foundation Course</p>
                <p>Mentorship Program</p>
                <p>Innovation Showcase</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-accent">Contact</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: infotechaifoundation@gmail.com</p>
                <p>Phone: +254 746 854 108</p>
                <p>Address: Nairobi, Kenya</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-muted-foreground">
              © 2025 TechAI Foundation Program. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
