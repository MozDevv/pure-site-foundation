import { ApplicationForm } from "@/components/application/application-form";
import { Header } from "@/components/layout/header";

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ApplicationForm />
    </div>
  );
}