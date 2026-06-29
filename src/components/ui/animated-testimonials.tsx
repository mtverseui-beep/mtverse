"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnimatedTestimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

type AnimatedTestimonialsProps = {
  testimonials: AnimatedTestimonial[];
  autoplay?: boolean;
  className?: string;
  intervalMs?: number;
  imagePriority?: boolean;
  imagePosition?: "left" | "right";
  controlsPosition?: "text" | "image";
};

function getStackRotation(index: number) {
  return ((index * 11) % 21) - 10;
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  className,
  intervalMs = 4500,
  imagePriority = false,
  imagePosition = "left",
  controlsPosition = "text",
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    setActive((current) => (count ? Math.min(current, count - 1) : 0));
  }, [count]);

  const handleNext = useCallback(() => {
    if (count < 2) return;
    setActive((current) => (current + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count < 2) return;
    setActive((current) => (current - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (!autoplay || count < 2) return;

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [autoplay, count, intervalMs]);

  if (!count) return null;

  const activeTestimonial = testimonials[active] ?? testimonials[0];
  const quoteWords = activeTestimonial.quote.split(/\s+/).filter(Boolean);
  const imageOnRight = imagePosition === "right";
  const controlsOnImage = controlsPosition === "image";
  const controls = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handlePrev}
        disabled={count < 2}
        aria-label="Previous prompt"
        className="group/button flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-xs)] transition-colors hover:border-primary/35 hover:text-primary disabled:pointer-events-none disabled:opacity-50 sm:size-9"
      >
        <ChevronLeft className="size-4 transition-transform duration-300 group-hover/button:-translate-x-0.5" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={count < 2}
        aria-label="Next prompt"
        className="group/button flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-xs)] transition-colors hover:border-primary/35 hover:text-primary disabled:pointer-events-none disabled:opacity-50 sm:size-9"
      >
        <ChevronRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
      </button>
    </div>
  );

  return (
    <div className={cn("w-full font-sans antialiased", className)}>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:items-center lg:gap-10",
          imageOnRight
            ? "md:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)]"
            : "md:grid-cols-[minmax(19rem,24rem)_minmax(0,1fr)]"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-4",
            imageOnRight && "md:order-2",
            controlsOnImage && imageOnRight && "md:flex-row-reverse"
          )}
        >
          <div className="relative aspect-[3/4] w-full max-w-[17rem] sm:max-w-[19rem] md:max-w-[23rem] lg:max-w-[24rem]">
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, index) => {
                const isActive = index === active;
                const rotation = getStackRotation(index);

                return (
                  <motion.div
                    key={`${testimonial.src}-${testimonial.name}`}
                    initial={{ opacity: 0, scale: 0.96, rotate: rotation }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.96,
                      rotate: isActive ? 0 : rotation,
                      zIndex: isActive ? 20 : 0,
                      y: isActive ? [0, -16, 0] : 8,
                    }}
                    exit={{ opacity: 0, scale: 0.96, rotate: -rotation }}
                    transition={{ duration: 0.42, ease: "easeInOut" }}
                    className={cn(
                      "absolute inset-0 origin-bottom",
                      isActive ? "pointer-events-auto" : "pointer-events-none"
                    )}
                  >
                    <Image
                      src={testimonial.src}
                      alt={testimonial.name}
                      fill
                      draggable={false}
                      loading={imagePriority && isActive ? "eager" : "lazy"}
                      sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 352px"
                      className="rounded-2xl object-cover object-center shadow-[var(--shadow-sm)]"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {controlsOnImage && <div className="shrink-0">{controls}</div>}
        </div>

        <div className={cn("flex min-h-0 flex-col justify-between gap-6 py-1 md:min-h-64", imageOnRight && "md:order-1")}>
          <motion.div
            key={active}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
          >
            <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {activeTestimonial.name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
              {activeTestimonial.designation}
            </p>
            <motion.p className="mt-4 text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-base sm:leading-7">
              {quoteWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.018 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          {!controlsOnImage && controls}
        </div>
      </div>
    </div>
  );
}
