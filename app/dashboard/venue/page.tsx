"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Info, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import * as React from "react";

export default function VenuePage() {
  const venues = [
    { event: "Best Manager", building: "Block A (Main Block)", floor: "4th Floor", room: "Room 402" },
    { event: "Marketing Maverick", building: "Block B (Business School)", floor: "2nd Floor", room: "Room 201" },
    { event: "Budget Battlefield (Finance)", building: "Block B (Business School)", floor: "2nd Floor", room: "Room 205" },
    { event: "HR Horizon", building: "Block C", floor: "3rd Floor", room: "Room 312" },
    { event: "Operations Odyssey", building: "Block A (Main Block)", floor: "3rd Floor", room: "Room 305" },
    { event: "Startup Showdown", building: "Auditorium Block", floor: "1st Floor", room: "Seminar Hall B" },
    { event: "Inaugural & Valedictory", building: "Auditorium Block", floor: "Ground Floor", room: "Main Auditorium" }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Venue & Maps</h1>
        <p className="text-muted-foreground mt-1">Navigate Christ University Bangalore Central Campus with ease.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column (2/3 width) - Maps & Directions */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="google-maps" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 h-12">
              <TabsTrigger value="google-maps" className="flex-1 py-2 text-sm font-medium">Google Maps</TabsTrigger>
              <TabsTrigger value="directions" className="flex-1 py-2 text-sm font-medium">Directions & Transit</TabsTrigger>
            </TabsList>

            <TabsContent value="google-maps" className="mt-4">
              <Card className="glass border-white/10 overflow-hidden">
                <CardContent className="p-0 h-[450px] relative">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d3888.481434316719!2d77.60351337589574!3d12.934614215555627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae144e3e3b3b4f%3A0x6b7db08e1ec2ad6a!2sChrist+University!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Christ University Central Campus Map"
                    className="absolute inset-0"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="directions" className="mt-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Getting to Campus</CardTitle>
                  <CardDescription>Directions from key Bangalore transit hubs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      from: "Krantivira Sangolli Rayanna (KSR) Railway Station / Majestic Bus Stand",
                      modes: [
                        { name: "Bus", detail: "BMTC buses heading to Koramangala or Dairy Circle (e.g. 171, 356, 360). Get down at Christ University / Dairy Circle bus stop." },
                        { name: "Metro + Cab/Auto", detail: "Take Green Line metro to National College or South End Circle, then auto/cab to campus (approx. 4.5 km)." }
                      ]
                    },
                    {
                      from: "Kempegowda International Airport (BLR)",
                      modes: [
                        { name: "Airport Bus (Vayu Vajra)", detail: "Take KIA-7 or KIA-7A directly to Dairy Circle or Christ University." },
                        { name: "App Cabs", detail: "Ola, Uber, or BluSmart directly via Hebbal flyover to Hosur Road (approx 40 km, 1.5 - 2 hours depending on traffic)." }
                      ]
                    }
                  ].map((route, i) => (
                    <div key={i} className="space-y-2 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-primary" /> From {route.from}
                      </h4>
                      <div className="pl-6 space-y-2 text-xs">
                        {route.modes.map((mode, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="font-medium text-foreground">{mode.name}:</span>
                            <p className="text-muted-foreground leading-relaxed">{mode.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Info className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Parking Information</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                Two-wheeler parking is available inside the campus at the designated multi-level parking lot near Gate 1. Show your USHUS confirmation card at the gate for access.
              </p>
              <p>
                Four-wheeler parking is strictly restricted for external participants inside the campus. We highly recommend using public transport or app cabs. Paid external parking options are available in nearby commercial buildings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right column (1/3 width) - Room allocations */}
        <div className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Room Allocations</CardTitle>
              <CardDescription>Location guide for all business verticals.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {venues.map((venue, idx) => (
                  <div key={idx} className="p-4 space-y-1 hover:bg-white/5 transition-colors">
                    <p className="text-xs text-primary font-medium">{venue.event}</p>
                    <p className="text-sm font-semibold text-foreground">{venue.building}</p>
                    <p className="text-xs text-muted-foreground">{venue.floor} • {venue.room}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-sm font-bold text-amber-500">Security Note</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-500/90 leading-relaxed">
              Always wear your USHUS 2026 lanyard and ID card visible at all times. Christ University Security reserves the right to ask for proof of registration/ID anywhere on campus.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
