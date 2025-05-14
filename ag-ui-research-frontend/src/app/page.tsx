import Image from "next/image";
import Link from "next/link";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Research Assistant Powered by AI
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Get comprehensive research reports on any topic with our
                AI-powered research assistant.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/copilotkit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Features
            </h2>
            <p className="max-w-[85%] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our research assistant provides powerful capabilities to help you
              gather and analyze information.
            </p>
          </div>
          <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 md:max-w-[64rem]">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <path d="M10 17c-5-3-7-7-7-9a2 2 0 0 1 4 0c0 .5-.5 1-1 1"></path>
                  <path d="M7 11.5c7 4 14 0 16-3.5-1 3-6 6-13 6-3 0-5-.5-5-.5"></path>
                  <path d="M13 4c-4 0-5 4-5 4 1-3 4-3 4-3 3 1 4 4 4 4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Fast Research</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Quickly search and compile information from multiple sources.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Smart Analysis</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Our AI analyzes information to extract key insights and
                findings.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Detailed Reports</h3>
              <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                Generate well-structured reports with comprehensive information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  About Our Platform
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our research assistant platform is built with the latest AI
                  technology to help you find, analyze, and organize information
                  quickly and efficiently.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/copilotkit"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Try It Now
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/globe.svg"
                alt="Research globe"
                width={400}
                height={400}
                className="dark:invert"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Image
              src="/next.svg"
              alt="Logo"
              width={100}
              height={24}
              className="dark:invert"
            />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2025 Research Assistant. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
