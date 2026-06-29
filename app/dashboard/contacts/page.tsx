"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, Mail, Clock, ShieldAlert } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";
import { motion } from "framer-motion";
import * as React from "react";

export default function ContactsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Directory</h1>
        <p className="text-muted-foreground mt-1">Get in touch with the core team, event heads, or emergency services.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Core Team Organisers */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Core Organisers
          </h2>

          <div className="space-y-3">
            {FEST_CONTENT.coreTeam.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass border-white/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {member.phone !== "TBD" && (
                        <a href={`tel:${member.phone}`}>
                          <button className="p-2 bg-white/5 hover:bg-white/10 text-primary border border-white/10 rounded transition-colors" title="Call">
                            <Phone className="w-4 h-4" />
                          </button>
                        </a>
                      )}
                      <a href={`mailto:${member.email}`}>
                        <button className="p-2 bg-white/5 hover:bg-white/10 text-primary border border-white/10 rounded transition-colors" title="Email">
                          <Mail className="w-4 h-4" />
                        </button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Services */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-danger" /> Emergency Services
          </h2>

          <div className="space-y-3">
            {FEST_CONTENT.emergencyContacts.map((contact, i) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-danger/20 bg-danger/5 hover:border-danger/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-danger truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {contact.available} availability
                      </p>
                    </div>
                    {contact.phone !== "TBD" && (
                      <a href={`tel:${contact.phone}`} className="shrink-0">
                        <button className="p-2 bg-danger/10 hover:bg-danger/25 text-danger border border-danger/20 rounded transition-colors" title="Call">
                          <Phone className="w-4 h-4" />
                        </button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Medical room note */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Campus Medical Room</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                The Christ University Central Campus medical room is located in the basement of Block I (next to the main gym). First aid and emergency care is staffed during fest hours.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
