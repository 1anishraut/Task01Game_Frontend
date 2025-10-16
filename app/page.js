"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";

const Home = dynamic(() => import("./Home/page.js"), {
  ssr: false,
});

export default function RockPaperScissorsPage() {
  

  return (
    <Home/>
  );
}
