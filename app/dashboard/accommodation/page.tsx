"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, ExternalLink, MapPin, Star, AlertCircle } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";
import { motion } from "framer-motion";
import * as React from "react";

export default function AccommodationPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accommodation</h1>
        <p className="text-muted-foreground mt-1">Curated lodging options near Christ University Bangalore Central Campus.</p>
      </div>

      {/* Advisory notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary/95 leading-relaxed">
            <strong>Important Note:</strong> USHUS 2026 does not have an official tie-up with any accommodation provider. These are curated suggestions only, listed for the convenience of outstation participants. Participants are requested to directly contact the properties and verify details before booking.
          </p>
        </CardContent>
      </Card>

      {/* Recommended Hotels */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Hotel className="w-5 h-5 text-primary" /> Recommended Hotels
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEST_CONTENT.hotels.map((hotel, i) => (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass border-white/10 h-full flex flex-col justify-between hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold leading-tight">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-primary" /> {hotel.rating}
                    </div>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {hotel.distance} from campus
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="bg-white/5 border border-white/5 p-2 px-3 rounded text-xs">
                    <span className="text-muted-foreground">Estimated Rate:</span>{" "}
                    <span className="font-semibold text-foreground">{hotel.priceRange}</span>
                  </div>
                  <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button variant="outline" className="w-full text-xs border-white/10 hover:bg-white/5 gap-2">
                      Book / View Property <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Budget hostel / PG options */}
      <div className="grid sm:grid-cols-2 gap-6 pt-4">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">PG / Hostel Options</CardTitle>
            <CardDescription>Budget-friendly options for longer stays or larger teams.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              There are numerous student hostel and PG chains located in the immediate vicinity of Christ University (SG Palya and Koramangala 1st Block).
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Stanza Living:</strong> Premium co-living options near Dairy Circle.</li>
              <li><strong>ZoloStay:</strong> Co-living properties within walking distance of the university gates.</li>
              <li>Local PGs (Separate for Men & Women) offer daily stay rates ranging from ₹500 to ₹1000/day.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Airbnb Area Recommendations</CardTitle>
            <CardDescription>Best residential zones to look for properties.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              If traveling in a team of 4-6 members, booking an entire apartment on Airbnb can be highly cost-effective and comfortable. We recommend searching in:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Koramangala:</strong> Vibrant neighborhood with numerous cafes and shops. (1.5 - 3 km from campus)</li>
              <li><strong>BTM Layout:</strong> High density of residential properties. (2 - 4 km from campus)</li>
              <li><strong>Jayanagar:</strong> Peaceful residential neighborhood. (3 - 5 km from campus)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
