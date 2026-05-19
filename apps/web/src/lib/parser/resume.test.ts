import { describe, expect, it } from "vitest";
import {
  parseCareerNotesBasic,
  parseCoverLetterBasic,
  parsePortfolioBasic,
} from "./resume";

describe("career document deterministic parsers", () => {
  it("extracts cover-letter paragraphs and selling points", () => {
    const parsed = parseCoverLetterBasic(
      "Dear Hiring Manager,\n\nI am applying for the Product Engineer role at Acme Corp because I have built onboarding systems that improved activation by 22%.\n\nAt Beta, I led a cross-functional launch for 12,000 users and shipped reusable analytics dashboards.\n\nSincerely,\nAda",
    );

    expect(parsed.targetCompany).toBe("Acme Corp");
    expect(parsed.targetPosition).toBe("Product Engineer");
    expect(parsed.tone).toBe("professional");
    expect(parsed.reusableParagraphs).toEqual(
      expect.arrayContaining([
        expect.stringContaining("built onboarding systems"),
        expect.stringContaining("cross-functional launch"),
      ]),
    );
    expect(parsed.keySellingPoints).toEqual(
      expect.arrayContaining([expect.stringContaining("improved activation")]),
    );
  });

  it("extracts portfolio project URL, stack, proof points, and bullets", () => {
    const parsed = parsePortfolioBasic(
      "Selected Work\n\nProject: Launch Metrics\nhttps://github.com/ada/launch-metrics\nStack: Next.js, PostgreSQL\n- Built dashboards for 12,000 users\n- Reduced reporting latency by 45%",
    );

    expect(parsed.links).toContain("https://github.com/ada/launch-metrics");
    expect(parsed.projects).toEqual([
      expect.objectContaining({
        name: "Launch Metrics",
        url: "https://github.com/ada/launch-metrics",
        technologies: ["Next.js", "PostgreSQL"],
        bullets: [
          "Built dashboards for 12,000 users",
          "Reduced reporting latency by 45%",
        ],
        proofPoints: expect.arrayContaining([
          "Built dashboards for 12,000 users",
          "Reduced reporting latency by 45%",
        ]),
      }),
    ]);
  });

  it("extracts visual portfolio sections with heading stacks and image captions", () => {
    const parsed = parsePortfolioBasic(
      `Portfolio linkedin.com/in/ANonABento | github.com/ANonABento
Kevin Jiang Resume
Robotic Arm Puppeteer — Python | ROS2 | OpenCV | Linux | Fusion360
Fusion 360 CAD Assembly
Real Life Assembly
A Python + ROS2 based control and calibration toolkit for the OpenArm robotic platform, designed to make puppeteering, simulation, and data collection for sim training more intuitive, cost-effective, and accurate.
●​ Built a Python + ROS2 environment, integrating Dynamixel motor SDK for encoder reading and writing through serial
●​ Implemented multi-camera AprilTag perception system using OpenCV ArUco with covariance based accuracy filtering

Portfolio linkedin.com/in/ANonABento | github.com/ANonABento
Kevin Jiang Resume
Expressive AI Robot Head — Python | PyTorch | llama.cpp | Whisper | ESP32 | FreeRTOS
Real Life Assembly Partial View of CAD System Flowchart
A ROS2-based robotic head that integrates large language models, speech, vision, and servo control to push AI beyond text into physical interaction to create more humanlike communication with AI through robots.
●​ Built a GPU-accelerated pipeline with CUDA and PyTorch, optimizing VRAM usage to run fully locally on Ubuntu/WSL2

AR Gesture Controlled Robot — Javascript | Python | Jetson Nano | Docker
3DoF & Claw Assembly Drive Base Assembly Gesture Control Dashboard
Built a modular robot platform controlled through Snap Spectacles, enabling natural gesture-based navigation and robotic arm manipulation to make teleoperation feel as natural as moving your own hands.
●​ Developed an end-to-end gesture-to-motion pipeline: Snap API → Flask server → HiveMQ MQTT → ROS2 nodes
●​ Optimized system for sub-100ms latency & introduced MQTT communication layer scalable to multi-robot scenarios

One Handed Keyboard — C | STM32 | GPIO | FSM | OnShape | 3D-Printing
Wiring diagram for both transmitter & receiver
Made an AAC device in the form of a wrist-mounted keyboard offering a more intuitive typing experience through simplified sequential input means and predictive text for mobility-limited users.
●​ Designed a wrist-mounted keyboard with full-functionally and autocorrect in software using only 5 GPIO buttons
●​ Project submission received an overall 99% grade with well-written documentation accessible here: Google Doc

VR Haptic Gloves — C++ | ESP32 | Arduino | 3D-Printing | Cura | Soldering
Wearing the bare device CAD of simplified “lite” version Testing in VR
●​ Soldered together an ESP32 with various electronic components, badge reels, 3D prints, and 22 AWG wire
●​ Utilized servos to create a haptic feedback system, providing realistic tactile responses based on virtual interactions

Robotics — Java | OpenCV | OnShape | 3D-Printing | Motor Control | Manufacturing
2024 Devolotics bot “Pluto” CAD of the drone launcher & the deposit Autonomous Visualization
Competed at the FIRST Tech Challenge World Championship as the lead builder and programmer for team Devolotics.
●​ Main contributions are toward Pluto’s deposit system, gate opener, hang, drone launcher, and autonomous program

PCB Design & Assembly — Altium Designer | Oscilloscope | Soldering
Schematic Designed In Altium Designer
Routed PCB Printed PCB
●​ Onboarded by learning the process for developing a circuit board from start to finish in Altium Designer
●​ Cleanly routed all the ports utilizing vias and traces resulting in 0 errors and uniform spacing throughout

C# Apps & Games — C# | OpenCV | FSM | Unity 2D/3D | Blender | VS Code | Visual Studio
Face recognition for an alarm system Best Overall @ UWGDC Game Jam Fall 2024 Behind the scenes of my latest 3D game
●​ Wrote the C# code in Visual Studio 2022 using Emgu OpenCV as the computer vision element for a larger alarm system
●​ Games are on my itch.io page

Java Applications — OpenCV | AIML | TTS | Eclipse | Android Studio
Real-time item labeling Web-scraping for display data AIML chatbot with text-to-speech
●​ Made an Android Studio app that detects objects with CameraX and webscrapes decomposition times from a database
●​ Applications are on my GitHub repositories`,
    );

    const names = parsed.projects.map((project) => project.name);
    expect(names).toEqual([
      "Robotic Arm Puppeteer",
      "Expressive AI Robot Head",
      "AR Gesture Controlled Robot",
      "One Handed Keyboard",
      "VR Haptic Gloves",
      "Robotics",
      "PCB Design & Assembly",
      "C# Apps & Games",
      "Java Applications",
    ]);
    expect(names).not.toEqual(
      expect.arrayContaining(["Portfolio", "Kevin Jiang Resume"]),
    );

    expect(parsed.projects[0]).toEqual(
      expect.objectContaining({
        technologies: ["Python", "ROS2", "OpenCV", "Linux", "Fusion360"],
        description: expect.stringContaining("OpenArm robotic platform"),
        bullets: expect.arrayContaining([
          expect.stringContaining("Dynamixel motor SDK"),
        ]),
      }),
    );
    expect(parsed.projects[0].description).not.toContain("CAD Assembly");

    expect(parsed.projects[2]).toEqual(
      expect.objectContaining({
        technologies: ["Javascript", "Python", "Jetson Nano", "Docker"],
        proofPoints: expect.arrayContaining([
          expect.stringContaining("sub-100ms latency"),
        ]),
      }),
    );
    expect(parsed.projects[3].proofPoints).toEqual(
      expect.arrayContaining([expect.stringContaining("99% grade")]),
    );
  });

  it("extracts career notes into loose bullets, achievements, paragraphs, projects, and skills", () => {
    const parsed = parseCareerNotesBasic(
      "Career notes\nSkills: React, facilitation\n\nThis paragraph captures how I explain onboarding work in applications and should be reusable later.\n\n- Improved onboarding completion by 18%\n- Built Project Atlas for support teams\n- Mentored two interns on testing habits",
    );

    expect(parsed.skills).toEqual(["React", "facilitation"]);
    expect(parsed.paragraphs).toEqual([
      "This paragraph captures how I explain onboarding work in applications and should be reusable later.",
    ]);
    expect(parsed.bullets).toEqual(
      expect.arrayContaining([
        "Improved onboarding completion by 18%",
        "Built Project Atlas for support teams",
      ]),
    );
    expect(parsed.achievements).toEqual([
      "Improved onboarding completion by 18%",
    ]);
    expect(parsed.projects).toEqual([
      expect.objectContaining({
        name: "Atlas for support teams",
        bullets: ["Built Project Atlas for support teams"],
      }),
    ]);
  });
});
