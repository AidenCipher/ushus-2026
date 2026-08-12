"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";
import * as React from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-1">Quick answers to common questions about USHUS 2026.</p>
      </div>

      <div className="space-y-4">
        {FEST_CONTENT.faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
 
 
 
            >
              <Card className="glass border-white/10 overflow-hidden hover:border-primary/20 transition-all duration-200">
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                
                  {isOpen && (
                    <div
 
 
 
 
                    >
                      <div className="p-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-white/5 bg-white/[0.01]">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
