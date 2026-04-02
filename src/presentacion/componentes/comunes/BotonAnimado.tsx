"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
};

export function BotonAnimado({ children, type = "button", ...props }: Props) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
