"use client"

import * as React from "react"
import {
  IconHelp,
  IconBook,
  IconVideo,
  IconMessageCircle,
  IconMail,
  IconBrandDiscord,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Sample FAQ data
  const faqs = [
    {
      question: "How do I add a new song?",
      answer: "To add a new song, navigate to the Songs section in the sidebar, then click on 'Add New Song'. Fill in the required information including title, artist, lyrics, and chords, then click 'Save Song'."
    },
    {
      question: "How do I feature a song on the homepage?",
      answer: "To feature a song on the homepage, go to the song's details page and toggle the 'Featured' switch. Alternatively, you can go to the 'Featured Content' section and add the song from there."
    },
    {
      question: "How do I manage user accounts?",
      answer: "User accounts can be managed in the 'User Management' section. You can view all users, edit their details, or delete accounts if necessary. Note that user authentication is handled through Firebase."
    },
    {
      question: "How do I change the site colors?",
      answer: "Site colors can be changed in the 'Settings > Appearance' section. You can customize the primary color, secondary color, background color, and text color to match your branding."
    },
    {
      question: "How do I create a collection of songs?",
      answer: "To create a collection, go to the 'Collections' section and click 'Add New Collection'. Give your collection a name, description, and add songs to it. You can also set the visibility of the collection."
    },
    {
      question: "How do I view analytics for my site?",
      answer: "Analytics can be viewed in the 'Analytics' section. You can see usage statistics, popular search terms, and other metrics to help you understand how users are interacting with your site."
    },
  ]

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Help & Support" />
        <div className="space-y-6 p-6">
          {/* Header with page name */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
            <p className="text-muted-foreground">
              Find answers to common questions and get support
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </div>

          {/* Help tabs */}
          <Tabs defaultValue="faq">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="faq" className="mt-6 space-y-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <IconHelp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No results found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We couldn't find any FAQs matching your search. Try a different query or browse the documentation.
                    </p>
                  </div>
                )}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="documentation" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>
                      Learn the basics of using the admin panel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          Introduction to the Dashboard
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          Managing Songs
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          Working with Collections
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Features</CardTitle>
                    <CardDescription>
                      Dive deeper into advanced functionality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          User Management
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          Analytics & Reporting
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconBook className="mr-2 h-4 w-4" />
                          Customizing Appearance
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Video Tutorials</CardTitle>
                    <CardDescription>
                      Watch step-by-step video guides
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconVideo className="mr-2 h-4 w-4" />
                          Adding Your First Song
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconVideo className="mr-2 h-4 w-4" />
                          Setting Up Firebase Authentication
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
                          <IconVideo className="mr-2 h-4 w-4" />
                          Creating Featured Content
                          <IconChevronRight className="ml-auto h-4 w-4" />
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="text-lg font-medium">API Documentation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore our comprehensive API documentation to integrate with our services.
                </p>
                <Button className="mt-4">
                  <IconBook className="mr-2 h-4 w-4" />
                  View API Docs
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Support</CardTitle>
                    <CardDescription>
                      Get help via email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Our support team is available Monday to Friday, 9am to 5pm EST.
                      We typically respond within 24 hours.
                    </p>
                    <Button className="w-full">
                      <IconMail className="mr-2 h-4 w-4" />
                      Email Support
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Live Chat</CardTitle>
                    <CardDescription>
                      Chat with our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Get immediate assistance through our live chat service.
                      Available during business hours.
                    </p>
                    <Button className="w-full">
                      <IconMessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Community Support</CardTitle>
                  <CardDescription>
                    Connect with other users and our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Join our Discord community to get help from other users and our support team.
                    Share ideas, ask questions, and stay updated on the latest features.
                  </p>
                  <Button className="w-full sm:w-auto">
                    <IconBrandDiscord className="mr-2 h-4 w-4" />
                    Join Discord Community
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
