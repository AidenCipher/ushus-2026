"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, ExternalLink, MapPin, Star, AlertCircle } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import * as React from "react";

export default function AccommodationPage() {
  const [onCampusRequested, setOnCampusRequested] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [gender, setGender] = React.useState("");

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOnCampusRequested(true);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accommodation</h1>
        <p className="text-muted-foreground mt-1">Curated lodging options near Christ University Hosur Road Campus.</p>
      </div>

      {/* Advisory notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary/95 leading-relaxed">
            <strong>Important Note:</strong> USHUS 2026 does not have an official tie-up with external hotel providers. The hotel listings below are curated suggestions only. However, you can request official on-campus hostel accommodation below.
          </p>
        </CardContent>
      </Card>

      {/* On-Campus Accommodation section */}
      <Card className="glass border-indigo-500/20 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-400">
            <Hotel className="w-5 h-5" />
            <CardTitle className="text-lg">On-Campus Accommodation</CardTitle>
          </div>
          <CardDescription>
            Official university guest houses and student hostel sharing arrangements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Christ University provides lodging facilities for outstation participants directly inside the campus. Stays are arranged at the campus hostels subject to availability.
          </p>
          <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-lg text-xs justify-between">
            <div>
              <span className="text-muted-foreground">Room Arrangement:</span>
              <p className="font-semibold text-foreground mt-0.5">Double Sharing (2 sharing)</p>
            </div>
            <div>
              <span className="text-muted-foreground">Standard Rate:</span>
              <p className="font-semibold text-indigo-300 mt-0.5">₹500 / Day</p>
            </div>
            <div>
              <span className="text-muted-foreground">Availability:</span>
              <p className="font-semibold text-emerald-400 mt-0.5">Open for Requests</p>
            </div>
          </div>

          {onCampusRequested ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs flex items-center gap-2.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>
                <strong>Request Submitted Successfully!</strong> Status: <span className="font-bold underline uppercase">Pending Approval</span>. Host allocation details will be sent to your email.
              </span>
            </div>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  Request On-Campus Accommodation
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/10 text-slate-150 max-w-sm bg-slate-950/95 backdrop-blur-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-white">Accommodation Request</DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Hostel rooms are separated by gender. Please provide accurate details.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRequestSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                    <Input required placeholder="Enter full name" className="bg-[#0b0f19] border-white/10 text-xs h-8" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gender</label>
                      <Select required onValueChange={setGender}>
                        <SelectTrigger className="bg-[#0b0f19] border-white/10 text-xs h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10 text-xs bg-[#0b0f19]">
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Check-in Date</label>
                      <Input required type="date" defaultValue="2026-11-05" className="bg-[#0b0f19] border-white/10 text-xs h-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nights Count</label>
                      <Input required type="number" min="1" max="5" defaultValue="2" className="bg-[#0b0f19] border-white/10 text-xs h-8" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sharing Rate</label>
                      <div className="h-8 bg-white/5 border border-white/10 rounded flex items-center px-2 text-xs font-semibold text-indigo-300">
                        ₹500 / night
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Additional Notes</label>
                    <Textarea placeholder="E.g., rooming with a specific teammate" className="bg-[#0b0f19] border-white/10 text-xs min-h-[50px] max-h-[100px]" />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold">
                      Submit Accommodation Request
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
