// Update this page (the content is just a fallback if you fail to update the page)

import { Brain, Code, Users } from "lucide-react";
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent">
              TechAI Foundation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Transform your future with cutting-edge AI and technology education. 
              Join our comprehensive learning program designed to create the next generation of tech leaders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="xl" asChild>
                <a href="/apply">Apply Now</a>
              </Button>
              <Button variant="outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Why Choose TechAI Foundation?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive program combines theoretical knowledge with hands-on experience 
              to prepare you for the future of technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-elegant hover:shadow-primary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-gradient-primary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">AI & Machine Learning</h3>
                <p className="text-muted-foreground">
                  Master the fundamentals of artificial intelligence, neural networks, 
                  and machine learning algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-secondary transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-gradient-accent p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Programming Excellence</h3>
                <p className="text-muted-foreground">
                  Learn Python, JavaScript, and other cutting-edge programming languages 
                  through practical projects.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-accent transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-secondary p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Community & Mentorship</h3>
                <p className="text-muted-foreground">
                  Join a vibrant community of learners and get guidance from 
                  industry experts and mentors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers through our program. 
            Apply today and take the first step towards your future in technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="xl" asChild>
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="rounded-lg bg-gradient-primary p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TechAI Foundation
              </span>
            </div>
            <p className="text-muted-foreground">
              © 2024 TechAI Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
