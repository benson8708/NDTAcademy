window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-et']={
 "id": "et",
 "code": "ET",
 "name": "Eddy Current Testing",
 "cp105": "ANSI/ASNT CP-105-2024 ET Topical Outlines",
 "hours": {
  "snt_tc_1a": {
   "l1": 40,
   "l2": 40
  },
  "nas410": {
   "l1": 40,
   "l2": 40
  },
  "directToL2": 80
 },
 "futureTechniques": [
  "Alternating Current Field Measurement (ACFM)",
  "Remote Field Testing (RFT)",
  "Magnetic Flux Leakage (MFL)",
  "Eddy Current Array (ECA)"
 ],
 "levels": [
  {
   "level": "I",
   "targetHours": 40,
   "description": "Level I eddy current testing covers the history and physics of electromagnetic induction, eddy current generation and properties, sensing elements and probe types, selection of inspection parameters, readout mechanisms, and hands-on lab demonstrations. Trainees learn to perform standardized eddy current tests under the supervision of a Level II or III.",
   "finalExam": {
    "questions": 50,
    "passingScore": 80,
    "bank": "ECT",
    "bankLevel": 1,
    "status": "placeholder"
   },
   "modules": [
    {
     "id": "et1-1",
     "title": "Introduction to Eddy Current Testing",
     "cpSection": "ECT Level I Theory Course 1.0",
     "hours": 3.0,
     "lessons": [
      {
       "id": "et1-1-1",
       "title": "History and Development of Eddy Current Testing",
       "minutes": 60,
       "objectives": [
        "Summarize the contributions of Arago, Lenz, Faraday, and Maxwell to electromagnetic testing",
        "Describe how advances in electronics shaped modern eddy current instruments",
        "Place eddy current testing within the family of NDT methods"
       ],
       "topics": [
        "1.1 Historical and developmental process",
        "1.1.1 Founding fathers: Arago, Lenz, Faraday, and Maxwell",
        "1.1.2 Advances in electronics"
       ],
       "media": [
        {
         "type": "video",
         "title": "From Arago's Disk to Digital Instruments: A History of ET",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Timeline of Electromagnetic Testing Milestones",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-1-2",
       "title": "Basic Physics: Varying Magnetic Fields and Induction",
       "minutes": 60,
       "objectives": [
        "Explain how a varying magnetic field induces current in a conductor",
        "State Faraday's law of electromagnetic induction in practical terms",
        "Identify the controlling physical principles behind eddy current testing"
       ],
       "topics": [
        "1.2 Basic physics and controlling principles",
        "1.2.1 Varying magnetic fields",
        "1.2.2 Electromagnetic induction"
       ],
       "media": [
        {
         "type": "video",
         "title": "Electromagnetic Induction Explained",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Coil and Conductor Induction Explorer",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Magnetic Field Around an AC Coil",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-1-3",
       "title": "Primary and Secondary Field Relationships",
       "minutes": 60,
       "objectives": [
        "Differentiate the primary coil field from the secondary field produced by eddy currents",
        "Describe how the opposing secondary field changes the net field at the coil",
        "Relate primary/secondary field interaction to the basis of test indications"
       ],
       "topics": [
        "1.2.3 Primary and secondary force relationships"
       ],
       "media": [
        {
         "type": "narration",
         "title": "Primary vs. Secondary Fields: The Push-Back Principle",
         "duration": "8:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Primary and Secondary Field Interaction",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Field Opposition Visualizer",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-2",
     "title": "Electromagnetic Theory: Eddy Current Generation and Impedance",
     "cpSection": "ECT Level I Theory Course 2.0 (2.1.1-2.1.3)",
     "hours": 5.0,
     "lessons": [
      {
       "id": "et1-2-1",
       "title": "Generation of Eddy Currents by an AC Field",
       "minutes": 75,
       "objectives": [
        "Explain how an alternating current in a test coil generates eddy currents in a conductive part",
        "Describe the conditions required for eddy current generation",
        "Sketch the basic coil-to-part energy transfer process"
       ],
       "topics": [
        "2.0 Electromagnetic theory",
        "2.1 Eddy current theory",
        "2.1.1 Generation of eddy currents by means of an AC field"
       ],
       "media": [
        {
         "type": "video",
         "title": "How Eddy Currents Are Generated",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "AC Coil Over a Conductor: Eddy Current Generator",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Eddy Current Flow in a Test Part",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-2-2",
       "title": "Fields Created by Eddy Currents and Impedance Changes",
       "minutes": 75,
       "objectives": [
        "Describe the secondary magnetic field produced by induced eddy currents",
        "Explain how the secondary field changes coil impedance",
        "Define impedance as the combination of resistance and inductive reactance"
       ],
       "topics": [
        "2.1.2 Effect of fields created by eddy currents (impedance changes)"
       ],
       "media": [
        {
         "type": "video",
         "title": "Why Coil Impedance Changes During a Test",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Resistance, Reactance, and Impedance Vector",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Impedance-Plane Response Simulator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-2-3",
       "title": "Effect of Impedance Change on Instrumentation",
       "minutes": 75,
       "objectives": [
        "Trace how a coil impedance change becomes a usable instrument signal",
        "Identify what an eddy current instrument actually measures",
        "Relate signal amplitude and phase to changes in the test part"
       ],
       "topics": [
        "2.1.3 Effect of change of impedance on instrumentation"
       ],
       "media": [
        {
         "type": "narration",
         "title": "From Coil to Screen: The Signal Chain",
         "duration": "9:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Block Diagram of an Eddy Current Instrument",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-2-4",
       "title": "Reading the Impedance Plane",
       "minutes": 75,
       "objectives": [
        "Interpret basic impedance-plane displays for common test variables",
        "Distinguish liftoff, conductivity, and flaw response directions on the impedance plane",
        "Apply impedance concepts from lessons 2.1.1-2.1.3 to practical signal recognition"
       ],
       "topics": [
        "2.1 Eddy current theory (impedance-plane integration and review)",
        "2.1.2 Effect of fields created by eddy currents (impedance changes) - applied",
        "2.1.3 Effect of change of impedance on instrumentation - applied"
       ],
       "media": [
        {
         "type": "simulation",
         "title": "Interactive Impedance-Plane Trainer",
         "status": "placeholder"
        },
        {
         "type": "video",
         "title": "Impedance Plane Walkthrough with Live Signals",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Impedance-Plane Response Quick Card",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-3",
     "title": "Properties of Eddy Currents",
     "cpSection": "ECT Level I Theory Course 2.0 (2.1.4)",
     "hours": 6.0,
     "lessons": [
      {
       "id": "et1-3-1",
       "title": "Circular Flow and Surface Concentration",
       "minutes": 75,
       "objectives": [
        "Describe the circular travel path of eddy currents in a test part",
        "Explain why eddy current density is strongest at the surface",
        "State why eddy currents are zero at the center of a solid conductor in an alternating field"
       ],
       "topics": [
        "2.1.4 Properties of eddy currents",
        "2.1.4.1 Travel in circular direction",
        "2.1.4.2 Strongest on surface of test material",
        "2.1.4.3 Zero value at center of solid conductor placed in an alternating magnetic field"
       ],
       "media": [
        {
         "type": "video",
         "title": "Where Eddy Currents Flow",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Eddy Current Density vs. Depth Cross-Section",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Current Density Profile Explorer",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-3-2",
       "title": "Strength, Timing, Orientation, and Current Magnitude",
       "minutes": 75,
       "objectives": [
        "Relate eddy current strength, time relationship, and orientation to test-system parameters and test-part characteristics",
        "Explain why induced eddy current flow is small in magnitude",
        "Identify which system settings and part properties control eddy current behavior"
       ],
       "topics": [
        "2.1.4.4 Strength, time relationship, and orientation as functions of test-system parameters and test-part characteristics",
        "2.1.4.5 Small magnitude of current flow"
       ],
       "media": [
        {
         "type": "narration",
         "title": "What Controls Eddy Current Strength and Orientation",
         "duration": "9:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "System Parameters vs. Part Characteristics Map",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-3-3",
       "title": "Frequency, Phase, and Depth of Penetration",
       "minutes": 75,
       "objectives": [
        "Describe the relationship between test frequency and phase of eddy currents at depth",
        "Calculate standard depth of penetration trends as frequency changes",
        "Select a frequency direction (higher/lower) for surface vs. subsurface sensitivity"
       ],
       "topics": [
        "2.1.4.6 Relationships of frequency and phase"
       ],
       "media": [
        {
         "type": "video",
         "title": "Frequency, Phase Lag, and Penetration Depth",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Standard Depth of Penetration Calculator",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Skin Depth Formula and Worked Examples",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-3-4",
       "title": "Conductivity and Permeability Effects",
       "minutes": 75,
       "objectives": [
        "Explain how material conductivity affects eddy current response",
        "Describe magnetic permeability effects in ferromagnetic test parts",
        "Compare signals from conductive nonmagnetic and ferromagnetic materials"
       ],
       "topics": [
        "2.1.4.7 Electrical effects, conductivity of materials",
        "2.1.4.8 Magnetic effects, permeability of materials"
       ],
       "media": [
        {
         "type": "video",
         "title": "Conductivity and Permeability on the Impedance Plane",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Conductivity Curve (Z-Curve) Simulator",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "IACS Conductivity Scale for Common Alloys",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-3-5",
       "title": "Geometrical Effects",
       "minutes": 60,
       "objectives": [
        "Identify geometry effects such as edges, thickness changes, and curvature on eddy current signals",
        "Distinguish geometry-related signals from discontinuity signals",
        "Plan scans to minimize unwanted geometry response"
       ],
       "topics": [
        "2.1.4.9 Geometrical effects"
       ],
       "media": [
        {
         "type": "video",
         "title": "Edge Effect and Geometry Signals",
         "duration": "9:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Common Geometry Signal Sources",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-4",
     "title": "Theory Lab Demonstrations",
     "cpSection": "ECT Level I Theory Course 3.0",
     "hours": 3.0,
     "lessons": [
      {
       "id": "et1-4-1",
       "title": "Lab: Generating Z-Curves with Conductivity Samples",
       "minutes": 90,
       "objectives": [
        "Generate a conductivity (Z) curve using a set of conductivity samples",
        "Plot sample responses on the impedance plane and identify the conductivity locus",
        "Explain how the Z-curve supports material sorting and verification"
       ],
       "topics": [
        "3.0 Lab demonstration",
        "3.1 Generation of Z-curves with conductivity samples"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Building a Z-Curve Step by Step",
         "duration": "18:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Z-Curve with Conductivity Standards",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Z-Curve Lab Worksheet",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-4-2",
       "title": "Lab: Generating Liftoff Curves",
       "minutes": 90,
       "objectives": [
        "Generate liftoff curves on samples of differing conductivity",
        "Describe the direction and shape of liftoff response on the impedance plane",
        "Use liftoff curves to set phase rotation so liftoff is horizontal"
       ],
       "topics": [
        "3.2 Generation of liftoff curves"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Liftoff Curves and Phase Rotation",
         "duration": "16:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Liftoff Curve Explorer",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-5",
     "title": "Eddy Current Sensing Elements",
     "cpSection": "ECT Level I Basic Technique Course 1.0",
     "hours": 6.0,
     "lessons": [
      {
       "id": "et1-5-1",
       "title": "Probe Coil Arrangements",
       "minutes": 75,
       "objectives": [
        "Identify probe (surface) coils, encircling coils, and inside (bobbin) coils",
        "Match each coil arrangement to the part geometries it suits",
        "Describe inspection coverage for each arrangement"
       ],
       "topics": [
        "1.0 Types of eddy current sensing elements",
        "1.1 Probes",
        "1.1.1 Types of arrangements",
        "1.1.1.1 Probe coils",
        "1.1.1.2 Encircling coils",
        "1.1.1.3 Inside coils"
       ],
       "media": [
        {
         "type": "video",
         "title": "Coil Arrangements: Surface, Encircling, and Inside",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Coil Arrangement Gallery with Field Patterns",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-5-2",
       "title": "Modes of Operation: Absolute, Differential, and Hybrid",
       "minutes": 75,
       "objectives": [
        "Differentiate absolute, differential, and hybrid coil operating modes",
        "Explain the theory of operation of each mode",
        "Predict signal behavior for gradual vs. abrupt changes in each mode"
       ],
       "topics": [
        "1.1.2 Modes of operation",
        "1.1.2.1 Absolute",
        "1.1.2.2 Differential",
        "1.1.2.3 Hybrids",
        "1.1.3 Theory of operation"
       ],
       "media": [
        {
         "type": "video",
         "title": "Absolute vs. Differential: What the Signals Look Like",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Coil Mode Signal Comparator",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Bridge Circuits for Absolute and Differential Coils",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-5-3",
       "title": "Hall Effect Sensors",
       "minutes": 75,
       "objectives": [
        "Explain the theory of operation of Hall effect sensors",
        "Compare coil-based and Hall element sensing systems",
        "Identify applications where Hall sensors offer advantages"
       ],
       "topics": [
        "1.1.4 Hall effect sensors",
        "1.1.4.1 Theory of operation",
        "1.1.4.2 Differences between coil and Hall element systems"
       ],
       "media": [
        {
         "type": "video",
         "title": "Hall Effect Sensors in Electromagnetic Testing",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Hall Element vs. Induction Coil Sensing",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-5-4",
       "title": "Applications, Advantages, and Limitations",
       "minutes": 75,
       "objectives": [
        "List the principal applications of eddy current sensing elements: material properties, flaw detection, and geometrical features",
        "Summarize the advantages of eddy current testing",
        "State the limitations that constrain eddy current applications"
       ],
       "topics": [
        "1.1.5 Applications",
        "1.1.5.1 Measurement of material properties",
        "1.1.5.2 Flaw detection",
        "1.1.5.3 Geometrical features",
        "1.1.6 Advantages",
        "1.1.7 Limitations"
       ],
       "media": [
        {
         "type": "video",
         "title": "What Eddy Current Can (and Cannot) Do",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "ET Applications, Advantages, and Limitations Summary Table",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-5-5",
       "title": "Factors Affecting Choice of Sensing Elements",
       "minutes": 60,
       "objectives": [
        "Select a sensing element based on part type, discontinuity type, and probable flaw location",
        "Account for testing speed and required coverage when choosing a sensor",
        "Justify a probe selection for a given inspection scenario"
       ],
       "topics": [
        "1.2 Factors affecting choice of sensing elements",
        "1.2.1 Type of part to be inspected",
        "1.2.2 Type of discontinuity to be detected",
        "1.2.3 Speed of testing required",
        "1.2.4 Amount of testing (percentage) required",
        "1.2.5 Probable location of discontinuity"
       ],
       "media": [
        {
         "type": "interactive",
         "title": "Probe Selection Decision Tool",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Sensing Element Selection Flowchart",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-6",
     "title": "Selection of Inspection Parameters",
     "cpSection": "ECT Level I Basic Technique Course 2.0",
     "hours": 6.0,
     "lessons": [
      {
       "id": "et1-6-1",
       "title": "Test Frequency Selection",
       "minutes": 90,
       "objectives": [
        "Explain how test frequency controls penetration depth and sensitivity",
        "Select an appropriate frequency for surface and subsurface inspection tasks",
        "Recognize frequency-related trade-offs in resolution and phase separation"
       ],
       "topics": [
        "2.0 Selection of inspection parameters",
        "2.1 Frequency"
       ],
       "media": [
        {
         "type": "video",
         "title": "Choosing the Right Test Frequency",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Frequency Effects on the Impedance Plane",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Frequency Selection Worked Examples",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-6-2",
       "title": "Drive Current and Voltage Settings",
       "minutes": 90,
       "objectives": [
        "Set coil drive current/voltage appropriate to the application",
        "Set Hall effect element drive current/voltage appropriate to the application",
        "Describe how drive level affects signal strength and saturation"
       ],
       "topics": [
        "2.2 Coil drive - current/voltage",
        "2.3 Hall effect element drive - current/voltage"
       ],
       "media": [
        {
         "type": "video",
         "title": "Drive Settings for Coils and Hall Elements",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Drive Level vs. Signal Response",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-6-3",
       "title": "Gain, Display Sensitivity, and Standardization",
       "minutes": 90,
       "objectives": [
        "Adjust channel gain and display sensitivity to obtain a usable signal",
        "Perform instrument standardization using reference standards",
        "Explain why and when standardization must be repeated"
       ],
       "topics": [
        "2.4 Channel gain",
        "2.5 Display sensitivity selections",
        "2.6 Standardization"
       ],
       "media": [
        {
         "type": "video",
         "title": "Standardizing an Eddy Current Instrument",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Gain and Sensitivity Setup Trainer",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Standardization Checklist",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-6-4",
       "title": "Filtering and Thresholds",
       "minutes": 90,
       "objectives": [
        "Apply high-pass and low-pass filtering to improve signal quality",
        "Set alarm thresholds for automated accept/reject decisions",
        "Recognize how improper filter settings can mask flaw signals"
       ],
       "topics": [
        "2.7 Filtering",
        "2.8 Thresholds"
       ],
       "media": [
        {
         "type": "video",
         "title": "Filters and Thresholds in Practice",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Filter Effects Sandbox",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-7",
     "title": "Readout Mechanisms",
     "cpSection": "ECT Level I Basic Technique Course 3.0",
     "hours": 5.0,
     "lessons": [
      {
       "id": "et1-7-1",
       "title": "Meters and Impedance Plane Displays",
       "minutes": 75,
       "objectives": [
        "Differentiate calibrated and uncalibrated meter readouts",
        "Interpret analog and digital impedance plane displays",
        "Select an appropriate display format for a given test"
       ],
       "topics": [
        "3.0 Readout mechanisms",
        "3.1 Calibrated or uncalibrated meters",
        "3.2 Impedance plane displays",
        "3.2.1 Analog",
        "3.2.2 Digital"
       ],
       "media": [
        {
         "type": "video",
         "title": "Readout Tour: Meters to Impedance Planes",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Display Format Comparison Chart",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-7-2",
       "title": "Data Recording, Alarms, and Numerical Readouts",
       "minutes": 75,
       "objectives": [
        "Describe data recording system options for eddy current tests",
        "Configure alarms, lights, and audible indicators",
        "Use numerical readouts for conductivity and thickness values"
       ],
       "topics": [
        "3.3 Data recording systems",
        "3.4 Alarms, lights, etc.",
        "3.5 Numerical readouts"
       ],
       "media": [
        {
         "type": "video",
         "title": "Recording and Alarming Test Data",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Data Recording Options Summary",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-7-3",
       "title": "Marking, Sorting, and Cutoff Systems",
       "minutes": 75,
       "objectives": [
        "Explain how marking systems flag rejectable indications in production",
        "Describe sorting gates and tables for automated part disposition",
        "Outline the function of cutoff saws or shears in continuous-product testing"
       ],
       "topics": [
        "3.6 Marking systems",
        "3.7 Sorting gates and tables",
        "3.8 Cutoff saw or shears"
       ],
       "media": [
        {
         "type": "video",
         "title": "Production-Line Marking and Sorting",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Automated Sorting Line Layout",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-7-4",
       "title": "Automation and Feedback",
       "minutes": 75,
       "objectives": [
        "Describe automation and feedback loops in eddy current test systems",
        "Explain how feedback maintains test consistency in high-speed lines",
        "Identify operator responsibilities in automated systems"
       ],
       "topics": [
        "3.9 Automation and feedback"
       ],
       "media": [
        {
         "type": "video",
         "title": "Automated Eddy Current Systems and Feedback Control",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Automated Test Line Walkthrough",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et1-8",
     "title": "Technique Lab Demonstrations",
     "cpSection": "ECT Level I Basic Technique Course 4.0",
     "hours": 6.0,
     "lessons": [
      {
       "id": "et1-8-1",
       "title": "Lab: Filter Effects on Rotating Reference Standards",
       "minutes": 90,
       "objectives": [
        "Demonstrate the effect of filter settings on signals from rotating reference standards",
        "Identify over-filtered and under-filtered signal conditions",
        "Optimize filters for a given rotational speed"
       ],
       "topics": [
        "4.0 Lab demonstration",
        "4.1 Demo filter effects on rotating reference standards"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Filters on a Rotating Standard",
         "duration": "16:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Filter Effects Lab",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Filter Lab Worksheet",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-8-2",
       "title": "Lab: Liftoff and Frequency Effects",
       "minutes": 90,
       "objectives": [
        "Demonstrate liftoff effects on signal amplitude and phase",
        "Demonstrate frequency effects on signal response and penetration",
        "Compensate for liftoff using phase rotation and probe technique"
       ],
       "topics": [
        "4.2 Demo liftoff effects",
        "4.3 Demo frequency effects"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Liftoff and Frequency Side by Side",
         "duration": "16:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Liftoff and Frequency Lab",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-8-3",
       "title": "Lab: Rotational and Forward Speed Effects",
       "minutes": 90,
       "objectives": [
        "Demonstrate how rotational and forward (throughput) speed affect signal response",
        "Match filter and speed settings to maintain detection sensitivity",
        "Document speed-related limits for a test setup"
       ],
       "topics": [
        "4.4 Demo rotational and forward speed effects"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Speed Effects on Detection",
         "duration": "15:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Scan Speed Lab",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et1-8-4",
       "title": "Lab: Generating a Z-Curve with Conductivity Standards",
       "minutes": 90,
       "objectives": [
        "Generate a Z-curve using a full set of conductivity standards",
        "Verify instrument standardization against known conductivity values",
        "Use the completed Z-curve to evaluate unknown samples"
       ],
       "topics": [
        "4.5 Generate a Z-curve with conductivity standards"
       ],
       "media": [
        {
         "type": "video",
         "title": "Lab Demo: Z-Curve with Conductivity Standards",
         "duration": "16:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Bench: Conductivity Standards Lab",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Conductivity Standards Lab Worksheet",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    }
   ]
  },
  {
   "level": "II",
   "targetHours": 40,
   "description": "Level II eddy current testing builds on Level I theory with in-depth study of coil impedance factors, signal-to-noise ratio, test frequency selection, coupling, field strength, and instrument design, then applies them through standards, operating procedures, signal classification, flaw sizing, conductivity sorting, and thickness evaluation. Trainees learn to set up, standardize, interpret, and evaluate eddy current tests against acceptance criteria.",
   "finalExam": {
    "questions": 50,
    "passingScore": 80,
    "bank": "ECT",
    "bankLevel": 2,
    "status": "placeholder"
   },
   "modules": [
    {
     "id": "et2-1",
     "title": "Review of Electromagnetic Theory",
     "cpSection": "ECT Level II Principles Course 1.0",
     "hours": 3.75,
     "lessons": [
      {
       "id": "et2-1-1",
       "title": "Eddy Current Theory Review",
       "minutes": 75,
       "objectives": [
        "Review eddy current generation, properties, and depth of penetration from Level I",
        "Explain impedance changes caused by induced eddy currents",
        "Solve frequency and depth-of-penetration problems"
       ],
       "topics": [
        "1.0 Review of electromagnetic theory",
        "1.1 Eddy current theory"
       ],
       "media": [
        {
         "type": "video",
         "title": "Level II Theory Refresher: Eddy Current Fundamentals",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Key Equations and Relationships Review Sheet",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-1-2",
       "title": "Types of Eddy Current Sensing Probes",
       "minutes": 75,
       "objectives": [
        "Review surface, encircling, and bobbin probe configurations and operating modes",
        "Match probe types to part geometry and discontinuity orientation",
        "Compare coil and Hall element sensing for Level II applications"
       ],
       "topics": [
        "1.2 Types of eddy current sensing probes"
       ],
       "media": [
        {
         "type": "video",
         "title": "Probe Types: A Level II Perspective",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Probe Configuration and Mode Matrix",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-1-3",
       "title": "Impedance Plane Mastery",
       "minutes": 75,
       "objectives": [
        "Predict impedance-plane trajectories for changes in conductivity, permeability, liftoff, and flaws",
        "Apply phase analysis to separate test variables",
        "Diagnose signal patterns from combined variable changes"
       ],
       "topics": [
        "1.1 Eddy current theory (impedance-plane analysis, applied review)",
        "1.2 Types of eddy current sensing probes (signal response by probe type)"
       ],
       "media": [
        {
         "type": "simulation",
         "title": "Advanced Impedance-Plane Trainer",
         "status": "placeholder"
        },
        {
         "type": "video",
         "title": "Reading Complex Impedance-Plane Signals",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Impedance-Plane Pattern Library",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-2",
     "title": "Factors that Affect Coil Impedance",
     "cpSection": "ECT Level II Principles Course 2.0",
     "hours": 6.0,
     "lessons": [
      {
       "id": "et2-2-1",
       "title": "Test Part Factors: Conductivity and Permeability",
       "minutes": 90,
       "objectives": [
        "Explain how test-part conductivity shifts coil impedance",
        "Explain how magnetic permeability dominates impedance response in ferromagnetic parts",
        "Predict impedance-plane movement for conductivity and permeability changes"
       ],
       "topics": [
        "2.0 Factors that affect coil impedance",
        "2.1 Test part",
        "2.1.1 Conductivity",
        "2.1.2 Permeability"
       ],
       "media": [
        {
         "type": "video",
         "title": "Conductivity and Permeability as Impedance Drivers",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Test-Part Variable Impedance Simulator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-2-2",
       "title": "Test Part Factors: Mass and Homogeneity",
       "minutes": 90,
       "objectives": [
        "Describe how part mass and thickness within the field affect coil impedance",
        "Explain how material homogeneity variations create signal responses",
        "Distinguish homogeneity signals from discontinuity signals"
       ],
       "topics": [
        "2.1.3 Mass",
        "2.1.4 Homogeneity"
       ],
       "media": [
        {
         "type": "video",
         "title": "Mass and Homogeneity Effects on the Signal",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Thin vs. Thick Part Field Interaction",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-2-3",
       "title": "Test System Factors: Frequency, Coupling, and Field Strength",
       "minutes": 90,
       "objectives": [
        "Analyze how frequency selection changes the operating point on the impedance plane",
        "Explain coupling effects (liftoff/fill factor) on impedance",
        "Describe field strength effects on impedance response"
       ],
       "topics": [
        "2.2 Test system",
        "2.2.1 Frequency",
        "2.2.2 Coupling",
        "2.2.3 Field strength"
       ],
       "media": [
        {
         "type": "simulation",
         "title": "System Parameter Impedance Explorer",
         "status": "placeholder"
        },
        {
         "type": "video",
         "title": "Tuning the Test System: Frequency, Coupling, Drive",
         "duration": "13:00",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-2-4",
       "title": "Test Coil Shape and Hall Effect Elements",
       "minutes": 90,
       "objectives": [
        "Relate test coil size and shape to field distribution and resolution",
        "Describe how Hall effect elements respond compared with coils",
        "Select coil geometry for specific impedance-response requirements"
       ],
       "topics": [
        "2.2.4 Test coil and shape",
        "2.2.5 Hall effect elements"
       ],
       "media": [
        {
         "type": "video",
         "title": "Coil Geometry and Hall Elements in System Design",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Coil Shape vs. Field Footprint",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Coil Impedance Factors Summary Table",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-3",
     "title": "Signal-to-Noise Ratio",
     "cpSection": "ECT Level II Principles Course 3.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "et2-3-1",
       "title": "Defining Signal-to-Noise Ratio",
       "minutes": 90,
       "objectives": [
        "Define signal-to-noise ratio (SNR) and express it quantitatively",
        "Identify common noise sources in eddy current testing",
        "State minimum SNR expectations for reliable detection"
       ],
       "topics": [
        "3.0 Signal-to-noise ratio",
        "3.1 Definition",
        "7.1 Review of display format",
        "7.2 Detection and examination procedure",
        "7.3 Crack signals \u2014 linear cracks, angled cracks, line contacts"
       ],
       "media": [
        {
         "type": "video",
         "title": "What Is SNR and Why It Matters",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Signal vs. Noise: Annotated Waveforms",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-3-2",
       "title": "SNR in Eddy Current Testing",
       "minutes": 90,
       "objectives": [
        "Relate SNR to detectability of discontinuities in eddy current tests",
        "Evaluate how material, geometry, and setup conditions degrade SNR",
        "Assess SNR from real impedance-plane and strip-chart data"
       ],
       "topics": [
        "3.2 Relationship to eddy current testing"
       ],
       "media": [
        {
         "type": "video",
         "title": "SNR on the Screen: Real Test Examples",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Noise Injection Simulator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-3-3",
       "title": "Methods of Improving SNR",
       "minutes": 90,
       "objectives": [
        "Apply frequency, filtering, probe, and technique changes to improve SNR",
        "Choose between hardware and procedural noise-reduction methods",
        "Verify SNR improvement after corrective adjustments"
       ],
       "topics": [
        "3.3 Methods of improving signal-to-noise ratio (SNR)"
       ],
       "media": [
        {
         "type": "video",
         "title": "Practical SNR Improvement Techniques",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "SNR Optimization Workbench",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "SNR Troubleshooting Checklist",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-4",
     "title": "Selection of Test Frequency",
     "cpSection": "ECT Level II Principles Course 4.0",
     "hours": 5.0,
     "lessons": [
      {
       "id": "et2-4-1",
       "title": "Frequency and Type of Test",
       "minutes": 75,
       "objectives": [
        "Relate test frequency to the type of test being performed (flaw detection, sorting, thickness)",
        "Determine optimum frequency ranges for common applications",
        "Explain the consequences of operating far from the optimum frequency"
       ],
       "topics": [
        "4.0 Selection of test frequency",
        "4.1 Relationship of frequency to type of test"
       ],
       "media": [
        {
         "type": "video",
         "title": "Matching Frequency to the Job",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Frequency Sweep Application Explorer",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-4-2",
       "title": "Noise Causes and Reduction: Saturation, Shielding, Grounding",
       "minutes": 75,
       "objectives": [
        "Identify causes of noise that influence frequency selection",
        "Apply DC saturation, shielding, and grounding to reduce noise",
        "Weigh SNR considerations when finalizing test frequency"
       ],
       "topics": [
        "4.2 Considerations affecting choice of test",
        "4.2.1 SNR",
        "4.2.2 Causes of noise",
        "4.2.3 Methods to reduce noise",
        "4.2.3.1 DC saturation",
        "4.2.3.2 Shielding",
        "4.2.3.3 Grounding"
       ],
       "media": [
        {
         "type": "video",
         "title": "Killing Noise: Saturation, Shields, and Grounds",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Noise Sources and Countermeasures Map",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-4-3",
       "title": "Phase Discrimination and Response Speed",
       "minutes": 75,
       "objectives": [
        "Use phase discrimination to separate variables of interest from noise",
        "Account for response speed requirements when choosing frequency",
        "Balance phase separation against penetration needs"
       ],
       "topics": [
        "4.2.4 Phase discrimination",
        "4.2.5 Response speed"
       ],
       "media": [
        {
         "type": "simulation",
         "title": "Phase Discrimination Simulator",
         "status": "placeholder"
        },
        {
         "type": "video",
         "title": "Phase Angle Separation in Frequency Selection",
         "duration": "11:00",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-4-4",
       "title": "Skin Effect",
       "minutes": 75,
       "objectives": [
        "Explain skin effect and its dependence on frequency, conductivity, and permeability",
        "Compute standard depth of penetration for given materials and frequencies",
        "Apply skin effect reasoning to subsurface flaw detection limits"
       ],
       "topics": [
        "4.2.6 Skin effect"
       ],
       "media": [
        {
         "type": "video",
         "title": "Skin Effect Deep Dive",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Skin Depth Calculator and Visualizer",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Depth of Penetration Tables for Common Alloys",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-5",
     "title": "Coupling and Field Strength",
     "cpSection": "ECT Level II Principles Course 5.0-6.0",
     "hours": 5.0,
     "lessons": [
      {
       "id": "et2-5-1",
       "title": "Fill Factor",
       "minutes": 75,
       "objectives": [
        "Define and calculate fill factor for encircling and bobbin coil tests",
        "Explain how fill factor affects sensitivity and signal amplitude",
        "Specify acceptable fill factor ranges for tubular product testing"
       ],
       "topics": [
        "5.0 Coupling",
        "5.1 Fill factor"
       ],
       "media": [
        {
         "type": "video",
         "title": "Fill Factor: Coupling for Encircling and Bobbin Coils",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Fill Factor Geometry and Formula",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Fill Factor Sensitivity Simulator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-5-2",
       "title": "Liftoff",
       "minutes": 75,
       "objectives": [
        "Describe liftoff effects on amplitude and phase for surface probes",
        "Apply liftoff compensation and phase-rotation techniques",
        "Use liftoff intentionally for coating thickness measurement"
       ],
       "topics": [
        "5.2 Liftoff"
       ],
       "media": [
        {
         "type": "video",
         "title": "Liftoff: Enemy and Tool",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Liftoff Compensation Trainer",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-5-3",
       "title": "Field Strength: Permeability Changes and Saturation",
       "minutes": 75,
       "objectives": [
        "Explain how permeability variations create noise in ferromagnetic testing",
        "Describe magnetic saturation and its use in suppressing permeability noise",
        "Select field strength to manage permeability effects"
       ],
       "topics": [
        "6.0 Field strength and its selection",
        "6.1 Permeability changes",
        "6.2 Saturation"
       ],
       "media": [
        {
         "type": "video",
         "title": "Saturating Ferromagnetic Parts for Cleaner Signals",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "B-H Curve and Saturation Region",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-5-4",
       "title": "AC Field Strength Effects on Eddy Current Testing",
       "minutes": 75,
       "objectives": [
        "Analyze the effect of AC field strength on eddy current response",
        "Recognize nonlinear effects from excessive drive in magnetic materials",
        "Set drive levels that balance sensitivity and signal linearity"
       ],
       "topics": [
        "6.3 Effect of AC field strength on eddy current testing"
       ],
       "media": [
        {
         "type": "video",
         "title": "Drive Level and AC Field Strength Effects",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Field Strength Response Workbench",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-6",
     "title": "Instrument Design Considerations",
     "cpSection": "ECT Level II Principles Course 7.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "et2-6-1",
       "title": "Amplification",
       "minutes": 90,
       "objectives": [
        "Describe amplifier stages in eddy current instruments and their effect on signals",
        "Explain gain, dynamic range, and amplifier saturation",
        "Recognize amplifier-induced signal distortion"
       ],
       "topics": [
        "7.0 Instrument design considerations",
        "7.1 Amplification"
       ],
       "media": [
        {
         "type": "video",
         "title": "Inside the Instrument: Amplification",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Amplifier Chain Block Diagram",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-6-2",
       "title": "Phase Detection",
       "minutes": 90,
       "objectives": [
        "Explain how phase detection extracts amplitude and phase from the coil signal",
        "Relate phase detection to impedance-plane display generation",
        "Describe how phase rotation controls display orientation"
       ],
       "topics": [
        "7.2 Phase detection"
       ],
       "media": [
        {
         "type": "video",
         "title": "Inside the Instrument: Phase Detection",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Phase Detector Demonstrator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-6-3",
       "title": "Differentiation and Filtering",
       "minutes": 90,
       "objectives": [
        "Describe differentiation and filtering circuits in eddy current instruments",
        "Predict the effect of high-pass, low-pass, and band-pass filtering on flaw signals",
        "Select filter settings compatible with scan speed and flaw response"
       ],
       "topics": [
        "7.3 Differentiation of filtering"
       ],
       "media": [
        {
         "type": "video",
         "title": "Inside the Instrument: Filtering and Differentiation",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Filter Response Designer",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Filter Selection Guide by Application",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-7",
     "title": "Standards and Operating Procedures",
     "cpSection": "ECT Level II Techniques and Applications Course 1.0",
     "hours": 3.75,
     "lessons": [
      {
       "id": "et2-7-1",
       "title": "Standards and Specifications in Eddy Current Testing",
       "minutes": 75,
       "objectives": [
        "Identify the major industry standards and specifications governing eddy current testing",
        "Explain how codes, standards, and specifications relate to each other",
        "Locate technique requirements within a governing specification"
       ],
       "topics": [
        "1.0 User standards and operating procedures",
        "1.1 Explanation of standards and specifications used in eddy current testing"
       ],
       "media": [
        {
         "type": "video",
         "title": "The Standards Landscape for ET",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Common ET Standards and Specifications Index",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-7-2",
       "title": "Working from Written Operating Procedures",
       "minutes": 75,
       "objectives": [
        "Interpret the essential elements of an eddy current operating procedure",
        "Execute a test in full compliance with procedure requirements",
        "Recognize conditions requiring procedure clarification or deviation approval"
       ],
       "topics": [
        "1.1 Explanation of standards and specifications used in eddy current testing - procedure structure and essential variables"
       ],
       "media": [
        {
         "type": "video",
         "title": "Anatomy of an ET Operating Procedure",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Procedure Walkthrough Exercise",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-7-3",
       "title": "Procedure Compliance, Records, and Reporting",
       "minutes": 75,
       "objectives": [
        "Document test parameters, standardization, and results per procedure and specification",
        "Verify that reported results satisfy specification reporting requirements",
        "Maintain traceability between reference standards, settings, and recorded data"
       ],
       "topics": [
        "1.1 Explanation of standards and specifications used in eddy current testing - documentation and reporting requirements"
       ],
       "media": [
        {
         "type": "video",
         "title": "Recording and Reporting ET Results",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "ET Test Report Template and Checklist",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    },
    {
     "id": "et2-8",
     "title": "Inspection System Output and Evaluation",
     "cpSection": "ECT Level II Techniques and Applications Course 2.0",
     "hours": 7.5,
     "lessons": [
      {
       "id": "et2-8-1",
       "title": "Accept/Reject Criteria and Signal Classification",
       "minutes": 90,
       "objectives": [
        "Apply accept/reject criteria including sorting and go/no-go decisions",
        "Classify signals as discontinuities or flaws using defined processes",
        "Document disposition decisions consistent with acceptance criteria"
       ],
       "topics": [
        "2.0 Inspection system output",
        "2.1 Accept/reject criteria",
        "2.1.1 Sorting, go/no-go",
        "2.2 Signal classification processes",
        "2.2.1 Discontinuity",
        "2.2.2 Flaw"
       ],
       "media": [
        {
         "type": "video",
         "title": "From Signal to Disposition: Accept/Reject Decisions",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Signal Classification Practice Set",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-8-2",
       "title": "Detection of Signals of Interest: Near and Far Surface",
       "minutes": 90,
       "objectives": [
        "Detect and discriminate near-surface signals of interest",
        "Detect and discriminate far-surface signals of interest",
        "Optimize frequency and phase settings for near vs. far surface detection"
       ],
       "topics": [
        "2.3 Detection of signals of interest",
        "2.3.1 Near surface",
        "2.3.2 Far surface"
       ],
       "media": [
        {
         "type": "video",
         "title": "Near-Surface vs. Far-Surface Flaw Signals",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Depth-Dependent Signal Simulator",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-8-3",
       "title": "Flaw-Sizing Techniques and Flaw Frequency",
       "minutes": 90,
       "objectives": [
        "Estimate flaw depth using phase-to-depth techniques",
        "Estimate flaw depth using volts-to-depth (amplitude) techniques",
        "Calculate flaw frequency for periodic discontinuities in continuous product"
       ],
       "topics": [
        "2.4 Flaw-sizing techniques",
        "2.4.1 Phase to depth",
        "2.4.2 Volts to depth",
        "2.5 Calculation of flaw frequency"
       ],
       "media": [
        {
         "type": "video",
         "title": "Sizing Flaws: Phase and Amplitude Methods",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Phase-to-Depth Sizing Trainer",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Flaw-Sizing Calibration Curve Workbook",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-8-4",
       "title": "Conductivity Sorting and Thickness Evaluation",
       "minutes": 90,
       "objectives": [
        "Sort materials for properties related to conductivity (alloy, heat treatment)",
        "Evaluate metal and coating thickness using eddy current techniques",
        "Standardize sorting and thickness setups with appropriate reference standards"
       ],
       "topics": [
        "2.6 Sorting for properties related to conductivity",
        "2.7 Thickness evaluation"
       ],
       "media": [
        {
         "type": "video",
         "title": "Sorting and Thickness Measurement Applications",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Conductivity Sorting and Thickness Workbench",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      },
      {
       "id": "et2-8-5",
       "title": "Measurement of Ferromagnetic Properties",
       "minutes": 90,
       "objectives": [
        "Describe eddy current measurement of ferromagnetic material properties",
        "Explain the use of comparative circuits for property comparison",
        "Set up a comparative test against a known reference part"
       ],
       "topics": [
        "2.8 Measurement of ferromagnetic properties",
        "2.8.1 Comparative circuits"
       ],
       "media": [
        {
         "type": "video",
         "title": "Comparative Testing of Ferromagnetic Parts",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Comparative Bridge Circuit Schematic",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Ferromagnetic Property Testing Setup Guide",
         "status": "placeholder"
        }
       ],
       "check": {
        "type": "knowledge-check",
        "questions": 5,
        "status": "placeholder"
       }
      }
     ],
     "moduleQuiz": {
      "questions": 10,
      "passingScore": 80,
      "status": "placeholder"
     }
    }
   ]
  }
 ]
};