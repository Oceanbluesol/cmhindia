"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <section id="faq" className="space-y-4">
      <h2 className="text-lg font-semibold">Frequently asked questions</h2>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>What is this site about?</AccordionTrigger>
            <AccordionContent>
              This site is a community-driven platform to share and discover events.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>How do I host an event?</AccordionTrigger>
            <AccordionContent>
              Create an account, go to your Dashboard → “Create Event”, fill the form, and submit.
              Your event will appear publicly once approved by an admin.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Where are poster images stored?</AccordionTrigger>
            <AccordionContent>
              Posters are uploaded to the <code>event-posters</code> bucket in Supabase Storage and the
              public URL is saved on the event.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>Can admins edit or reject events?</AccordionTrigger>
            <AccordionContent>
              Yes—admins can approve, reject, edit, feature, or delete any submitted event.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
