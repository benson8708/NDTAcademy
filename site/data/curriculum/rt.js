window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-rt']={
 "id": "rt",
 "code": "RT",
 "name": "Radiographic Testing",
 "cp105": "ANSI/ASNT CP-105-2024 RT Topical Outlines",
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
 "radSafetyNote": "Radiation safety training is delivered as a separate course per the regulatory jurisdiction (state, federal, or national authority) and is not counted toward the method training hours shown here. Per CP-105-2024, a Radiation Safety Topical Outline (Appendix A) may be used as guidance. Note: NAS410 requires 40 hours per level for film OR non-film radiography; film AND non-film (digital) combined requires 60/60 hours.",
 "futureTechniques": [
  "Computed Radiography (CR) Level I Topical Outline",
  "Computed Radiography (CR) Level II Topical Outline",
  "Digital Radiography (DR) Level I Topical Outline",
  "Digital Radiography (DR) Level II Topical Outline",
  "Computed Tomography (CT) Level I Topical Outline",
  "Computed Tomography (CT) Level II Topical Outline",
  "Limited Certification for Radiographic Testing Interpretation (Film)",
  "Limited Certification for Digital Radiography and Computed Radiography Interpretation",
  "Limited Certification for Computed Tomography Interpretation"
 ],
 "levels": [
  {
   "level": "I",
   "targetHours": 40,
   "description": "Level I covers the CP-105-2024 Basic Radiographic Testing Physics Course and Radiography Technique Course for film radiography: atomic and radiation physics, radiation sources and exposure devices, interaction of radiation with matter, safety principles review, geometric exposure principles, film and screens, exposure arithmetic, image quality, film processing, and standard film exposure techniques.",
   "finalExam": {
    "questions": 50,
    "passingScore": 80,
    "bank": "RT",
    "bankLevel": 1,
    "status": "placeholder"
   },
   "modules": [
    {
     "id": "rt1-1",
     "title": "Introduction and Fundamental Properties of Matter",
     "cpSection": "Basic RT Physics Course 1.0-2.0",
     "hours": 4.75,
     "lessons": [
      {
       "id": "rt1-1-1",
       "title": "Introduction to Industrial Radiographic Testing",
       "minutes": 75,
       "objectives": [
        "Summarize the history and discovery of radioactive materials and X-rays",
        "Define industrial radiographic testing (RT) and its role among NDT methods",
        "Explain why radiation protection is fundamental to radiographic work"
       ],
       "topics": [
        "Physics 1.1 History and discovery of radioactive materials",
        "Physics 1.2 Definition of industrial radiographic testing (RT)",
        "Physics 1.3 Radiation protection - why?"
       ],
       "media": [
        {
         "type": "video",
         "title": "From Roentgen to Modern Industrial RT",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Where RT Fits Among NDT Methods",
         "status": "placeholder"
        },
        {
         "type": "narration",
         "title": "Why Radiation Protection Matters",
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
       "id": "rt1-1-2",
       "title": "Basic Math Review for Radiography",
       "minutes": 60,
       "objectives": [
        "Apply exponents, square roots, and scientific notation to radiography calculations",
        "Rearrange and solve basic formulas used in exposure and decay problems"
       ],
       "topics": [
        "Physics 1.4 Basic math review - exponents, square root, etc."
       ],
       "media": [
        {
         "type": "video",
         "title": "Math Skills for Radiographers",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Exponent and Square Root Practice Problems",
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
       "id": "rt1-1-3",
       "title": "Elements, Atoms, and Atomic Particles",
       "minutes": 75,
       "objectives": [
        "Distinguish elements, atoms, molecules, and compounds",
        "Describe the properties of protons, electrons, and neutrons"
       ],
       "topics": [
        "Physics 2.1 Elements and atoms",
        "Physics 2.2 Molecules and compounds",
        "Physics 2.3 Atomic particles - properties of protons, electrons, and neutrons"
       ],
       "media": [
        {
         "type": "video",
         "title": "Building Blocks of Matter",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Atomic Particles and Their Properties",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Build-an-Atom Explorer",
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
       "id": "rt1-1-4",
       "title": "Atomic Structure, Number, Weight, and Isotopes",
       "minutes": 75,
       "objectives": [
        "Describe atomic structure including shells and the nucleus",
        "Differentiate atomic number from atomic weight",
        "Distinguish an isotope from a radioisotope"
       ],
       "topics": [
        "Physics 2.4 Atomic structure",
        "Physics 2.5 Atomic number and weight",
        "Physics 2.6 Isotope versus radioisotope"
       ],
       "media": [
        {
         "type": "video",
         "title": "Atomic Structure and Isotopes",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Isotope vs. Radioisotope Comparison Chart",
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
     "id": "rt1-2",
     "title": "Radioactive Materials and Types of Radiation",
     "cpSection": "Basic RT Physics Course 3.0-4.0",
     "hours": 5.25,
     "lessons": [
      {
       "id": "rt1-2-1",
       "title": "Production of Radioactive Materials",
       "minutes": 75,
       "objectives": [
        "Explain how radioisotopes are produced by neutron activation and nuclear fission",
        "Distinguish stable from unstable (radioactive) atoms"
       ],
       "topics": [
        "Physics 3.1 Production of radioactive materials",
        "Physics 3.1.1 Neutron activation",
        "Physics 3.1.2 Nuclear fission",
        "Physics 3.2 Stable versus unstable (radioactive) atoms"
       ],
       "media": [
        {
         "type": "video",
         "title": "How Radiographic Isotopes Are Made",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Neutron Activation vs. Fission Products",
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
       "id": "rt1-2-2",
       "title": "Activity, Half-Life, and Radioactive Decay",
       "minutes": 75,
       "objectives": [
        "Define the becquerel as the unit of activity and specific activity in becquerels per gram",
        "Calculate remaining source activity using half-life and plot radioactive decay"
       ],
       "topics": [
        "Physics 3.3 Becquerel - the unit of activity",
        "Physics 3.4 Half-life of radioactive materials",
        "Physics 3.5 Plotting of radioactive decay",
        "Physics 3.6 Specific activity - becquerels/gram"
       ],
       "media": [
        {
         "type": "video",
         "title": "Half-Life and Decay Curves",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Source Decay Calculator and Plotter",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Decay Tables for Common RT Sources",
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
       "id": "rt1-2-3",
       "title": "Particulate and Electromagnetic Radiation",
       "minutes": 75,
       "objectives": [
        "Describe the properties of alpha, beta, and neutron particulate radiation",
        "Characterize X-ray and gamma ray electromagnetic radiation"
       ],
       "topics": [
        "Physics 4.1 Particulate radiation - properties: alpha, beta, neutron",
        "Physics 4.2 Electromagnetic radiation - X-ray, gamma ray"
       ],
       "media": [
        {
         "type": "video",
         "title": "Types of Ionizing Radiation",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Penetrating Power of Alpha, Beta, Gamma, and Neutron Radiation",
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
       "id": "rt1-2-4",
       "title": "X-ray and Gamma Ray Production and Energy",
       "minutes": 90,
       "objectives": [
        "Explain how X-rays are produced in a tube and how gamma rays originate in the nucleus",
        "Compare energy characteristics of common radioisotope sources and X-ray machines"
       ],
       "topics": [
        "Physics 4.3 X-ray production",
        "Physics 4.4 Gamma ray production",
        "Physics 4.5 Gamma ray energy",
        "Physics 4.6 Energy characteristics of common radioisotope sources",
        "Physics 4.7 Energy characteristics of X-ray machines"
       ],
       "media": [
        {
         "type": "video",
         "title": "Inside the X-ray Tube: Bremsstrahlung and Characteristic Radiation",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Energy Spectra: Ir-192, Co-60, Se-75 vs. X-ray Machines",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "kVp vs. Photon Energy Spectrum Simulator",
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
     "id": "rt1-3",
     "title": "Interaction of Radiation with Matter",
     "cpSection": "Basic RT Physics Course 5.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt1-3-1",
       "title": "Ionization and Interaction Mechanisms",
       "minutes": 90,
       "objectives": [
        "Define ionization and explain its significance in radiography",
        "Describe the photoelectric effect, Compton scattering, and pair production"
       ],
       "topics": [
        "Physics 5.1 Ionization",
        "Physics 5.2 Radiation interaction with matter",
        "Physics 5.2.1 Photoelectric effect",
        "Physics 5.2.2 Compton scattering",
        "Physics 5.2.3 Pair production"
       ],
       "media": [
        {
         "type": "video",
         "title": "Three Ways Photons Interact with Matter",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Photoelectric, Compton, and Pair Production by Energy Range",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Photon Interaction Probability Explorer",
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
       "id": "rt1-3-2",
       "title": "Exposure Units and Source Emissivity",
       "minutes": 90,
       "objectives": [
        "Define the coulomb per kilogram (C/kg) as the unit of radiation exposure",
        "Compare emissivity values of common radiographic sources and X-ray exposure devices"
       ],
       "topics": [
        "Physics 5.3 Unit of radiation exposure - coulomb per kilogram (C/kg)",
        "Physics 5.4 Emissivity of commonly used radiographic sources",
        "Physics 5.5 Emissivity of X-ray exposure devices"
       ],
       "media": [
        {
         "type": "video",
         "title": "Measuring Radiation Exposure: Units and Emissivity",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Emissivity Tables for Common Sources",
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
       "id": "rt1-3-3",
       "title": "Attenuation, Shielding, and the Inverse Square Law",
       "minutes": 90,
       "objectives": [
        "Explain attenuation of electromagnetic radiation and the role of shielding",
        "Calculate shielding requirements using half-value and tenth-value layers",
        "Apply the inverse square law to intensity-distance problems"
       ],
       "topics": [
        "Physics 5.6 Attenuation of electromagnetic radiation - shielding",
        "Physics 5.7 Half-value layers (HVL), tenth-value layers (TVL)",
        "Physics 5.8 Inverse square law"
       ],
       "media": [
        {
         "type": "video",
         "title": "HVL, TVL, and Shielding Math",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Inverse Square Law Calculator",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Shielding Thickness vs. Intensity Simulator",
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
     "id": "rt1-4",
     "title": "Exposure Devices and Radiation Sources",
     "cpSection": "Basic RT Physics Course 6.0",
     "hours": 5.25,
     "lessons": [
      {
       "id": "rt1-4-1",
       "title": "Radioisotope Sources and Exposure Devices",
       "minutes": 90,
       "objectives": [
        "Describe sealed-source design and fabrication for gamma, beta/bremsstrahlung, and neutron sources",
        "Identify the operating characteristics of radioisotope exposure devices"
       ],
       "topics": [
        "Physics 6.1 Radioisotope sources",
        "Physics 6.1.1 Sealed-source design and fabrication",
        "Physics 6.1.2 Gamma ray sources",
        "Physics 6.1.3 Beta and bremsstrahlung sources",
        "Physics 6.1.4 Neutron sources",
        "Physics 6.2 Radioisotope exposure device characteristics"
       ],
       "media": [
        {
         "type": "video",
         "title": "Anatomy of a Gamma Exposure Device",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Sealed Source Capsule Cutaway",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Exposure Device Component Identifier",
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
       "id": "rt1-4-2",
       "title": "Low-Energy Electronic Radiation Sources (500 keV and Less)",
       "minutes": 90,
       "objectives": [
        "Describe X-ray tube design, generators, and control circuits",
        "Explain accelerating potential, target configuration, heat dissipation, duty cycle, and beam filtration"
       ],
       "topics": [
        "Physics 6.3 Electronic radiation sources - 500 keV and less, low energy",
        "Physics 6.3.1 Generator - high-voltage rectifiers",
        "Physics 6.3.2 X-ray tube design and fabrication",
        "Physics 6.3.3 X-ray control circuits",
        "Physics 6.3.4 Accelerating potential",
        "Physics 6.3.5 Target material and configuration",
        "Physics 6.3.6 Heat dissipation",
        "Physics 6.3.7 Duty cycle",
        "Physics 6.3.8 Beam filtration"
       ],
       "media": [
        {
         "type": "video",
         "title": "Industrial X-ray Tube Design and Controls",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "X-ray Tube and Generator Circuit Schematic",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Duty Cycle and Heat Loading Simulator",
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
       "id": "rt1-4-3",
       "title": "Medium- and High-Energy Electronic Sources",
       "minutes": 75,
       "objectives": [
        "Identify resonance transformers, Van de Graaff accelerators, linear accelerators, and betatrons",
        "Compare output and beam filtration considerations for high-energy equipment"
       ],
       "topics": [
        "Physics 6.4 Electronic radiation sources - medium- and high-energy",
        "Physics 6.4.1 Resonance transformer",
        "Physics 6.4.2 Van de Graaff accelerator",
        "Physics 6.4.3 Linear accelerator",
        "Physics 6.4.4 Betatron",
        "Physics 6.4.5 Coulomb per kilogram (C/kg) output",
        "Physics 6.4.6 Equipment design and fabrication",
        "Physics 6.4.7 Beam filtration"
       ],
       "media": [
        {
         "type": "video",
         "title": "High-Energy Radiography: Linacs and Betatrons",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Accelerator Types Compared",
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
       "id": "rt1-4-4",
       "title": "Fluoroscopic Radiation Sources",
       "minutes": 60,
       "objectives": [
        "Describe fluoroscopic equipment design and direct-viewing screens",
        "Explain screen unsharpness and screen conversion efficiency"
       ],
       "topics": [
        "Physics 6.5 Fluoroscopic radiation sources",
        "Physics 6.5.1 Fluoroscopic equipment design",
        "Physics 6.5.2 Direct-viewing screens",
        "Physics 6.5.5 Screen unsharpness",
        "Physics 6.5.6 Screen conversion efficiency"
       ],
       "media": [
        {
         "type": "video",
         "title": "Fluoroscopy Fundamentals",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Fluoroscopic System Layout",
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
     "id": "rt1-5",
     "title": "Radiographic Safety Principles Review",
     "cpSection": "Basic RT Physics Course 7.0",
     "hours": 2.75,
     "lessons": [
      {
       "id": "rt1-5-1",
       "title": "Controlling Personnel Exposure: Time, Distance, Shielding, ALARA",
       "minutes": 90,
       "objectives": [
        "Apply time, distance, and shielding concepts to control personnel exposure",
        "Explain the ALARA concept and its application in daily radiographic work"
       ],
       "topics": [
        "Physics 7.1 Controlling personnel exposure",
        "Physics 7.2 Time, distance, shielding concepts",
        "Physics 7.3 ALARA concept"
       ],
       "media": [
        {
         "type": "video",
         "title": "Time, Distance, Shielding in Practice",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Dose Reduction Scenario Trainer",
         "status": "placeholder"
        },
        {
         "type": "narration",
         "title": "ALARA: A Working Philosophy",
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
       "id": "rt1-5-2",
       "title": "Radiation Detection Equipment and Device Operating Characteristics",
       "minutes": 75,
       "objectives": [
        "Identify common radiation detection and survey instruments and their uses",
        "Describe exposure device operating characteristics relevant to safe operation"
       ],
       "topics": [
        "Physics 7.4 Radiation detection equipment",
        "Physics 7.5 Exposure device operating characteristics"
       ],
       "media": [
        {
         "type": "video",
         "title": "Survey Meters, Dosimeters, and Alarms",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Detection Instrument Selection Chart",
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
     "id": "rt1-6",
     "title": "The Radiographic Process and Geometric Principles",
     "cpSection": "Radiography Technique Course 1.0-2.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt1-6-1",
       "title": "The Process of Radiography and the Electromagnetic Spectrum",
       "minutes": 90,
       "objectives": [
        "Describe the overall process of film radiography from exposure to image",
        "Relate X-ray and gamma spectra to penetrating ability or beam quality",
        "Predict the effect of mA and kVp changes on beam quality and intensity"
       ],
       "topics": [
        "Technique 1.1 Process of radiography",
        "Technique 1.2 Types of electromagnetic radiation sources",
        "Technique 1.3 Electromagnetic spectrum",
        "Technique 1.4 Penetrating ability or quality of X-rays and gamma rays",
        "Technique 1.5 Spectrum of X-ray tube source",
        "Technique 1.6 Spectrum of gamma radioisotope source",
        "Technique 1.7 X-ray tube - change of mA or kVp effect on quality and intensity"
       ],
       "media": [
        {
         "type": "video",
         "title": "From Source to Radiograph: The Film RT Process",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "X-ray vs. Gamma Spectra and the EM Spectrum",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "mA/kVp Effects on Quality and Intensity",
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
       "id": "rt1-6-2",
       "title": "Geometric Exposure Principles",
       "minutes": 90,
       "objectives": [
        "Explain shadow formation, distortion, and enlargement",
        "Calculate geometric unsharpness from source size and distances",
        "Describe methods for finding discontinuity depth"
       ],
       "topics": [
        "Technique 2.1 Geometric exposure principles",
        "Technique 2.1.1 Shadow formation and distortion",
        "Technique 2.1.2 Shadow enlargement calculation",
        "Technique 2.1.3 Shadow sharpness",
        "Technique 2.1.4 Geometric unsharpness",
        "Technique 2.1.5 Finding discontinuity depth"
       ],
       "media": [
        {
         "type": "video",
         "title": "Shadows, Geometry, and Unsharpness",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Geometric Unsharpness Calculator",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Source-Object-Film Geometry",
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
       "id": "rt1-6-3",
       "title": "Screens, Cassettes, Film Composition, and the Heel Effect",
       "minutes": 90,
       "objectives": [
        "Compare lead and fluorescent intensifying screens and their intensifying factors",
        "Explain the importance of screen-to-film contact, cleanliness, and screen care",
        "Describe industrial film composition and the X-ray tube heel effect"
       ],
       "topics": [
        "Technique 2.2 Radiography screens",
        "Technique 2.2.1 Lead intensifying screens",
        "Technique 2.2.2 Fluorescent intensifying screens",
        "Technique 2.2.3 Intensifying factors",
        "Technique 2.2.4 Importance of screen-to-film contact",
        "Technique 2.2.5 Importance of screen cleanliness and care",
        "Technique 2.2.6 Techniques for cleaning screens",
        "Technique 2.3 Radiography cassettes",
        "Technique 2.4 Composition of industrial radiography film",
        "Technique 2.5 The heel effect with X-ray tubes"
       ],
       "media": [
        {
         "type": "video",
         "title": "Screens, Cassettes, and Film Construction",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Film Cross Section and Screen Sandwich",
         "status": "placeholder"
        },
        {
         "type": "narration",
         "title": "Screen Care and Cleaning Walkthrough",
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
     "id": "rt1-7",
     "title": "Radiographs and Exposure Arithmetic",
     "cpSection": "Radiography Technique Course 3.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt1-7-1",
       "title": "Latent Image Formation and Inherent Unsharpness",
       "minutes": 90,
       "objectives": [
        "Explain how the latent image forms in the film emulsion",
        "Describe inherent unsharpness and its contribution to total unsharpness"
       ],
       "topics": [
        "Technique 3.1 Formation of the latent image on film",
        "Technique 3.2 Inherent unsharpness"
       ],
       "media": [
        {
         "type": "video",
         "title": "The Latent Image: Silver Halide to Silver",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Latent Image Formation Sequence",
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
       "id": "rt1-7-2",
       "title": "Exposure Arithmetic and Exposure Charts",
       "minutes": 90,
       "objectives": [
        "Apply the milliamperage-distance-time relationship and reciprocity law",
        "Use X-ray and gamma ray exposure charts to set technique parameters",
        "Calculate exposure time for gamma and X-ray sources including inverse square corrections"
       ],
       "topics": [
        "Technique 3.3 Arithmetic of radiography exposure",
        "Technique 3.3.1 Milliamperage - distance-time relationship",
        "Technique 3.3.2 Reciprocity law",
        "Technique 3.3.3 Photographic density",
        "Technique 3.3.4 X-ray exposure charts - material thickness, kV, and exposure",
        "Technique 3.3.5 Gamma ray exposure chart",
        "Technique 3.3.6 Inverse square law considerations",
        "Technique 3.3.7 Calculation of exposure time for gamma and X-ray sources"
       ],
       "media": [
        {
         "type": "video",
         "title": "Working Exposure Calculations Step by Step",
         "duration": "15:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Exposure Chart Practice Tool",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Sample X-ray and Gamma Exposure Charts",
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
       "id": "rt1-7-3",
       "title": "Characteristic Curves, Film Speed, and Film Selection",
       "minutes": 90,
       "objectives": [
        "Interpret the characteristic (Hurter and Driffield) curve of a film",
        "Compare film speed and class descriptions",
        "Select an appropriate film for a given application"
       ],
       "topics": [
        "Technique 3.4 Characteristic (Hurter and Driffield) curve",
        "Technique 3.5 Film speed and class descriptions",
        "Technique 3.6 Selection of film for particular purpose"
       ],
       "media": [
        {
         "type": "video",
         "title": "Reading the H&D Curve",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Film Selection Decision Trainer",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Film Class and Speed Comparison Chart",
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
     "id": "rt1-8",
     "title": "Radiographic Image Quality",
     "cpSection": "Radiography Technique Course 4.0",
     "hours": 3.0,
     "lessons": [
      {
       "id": "rt1-8-1",
       "title": "Radiographic Sensitivity and Contrast",
       "minutes": 90,
       "objectives": [
        "Define radiographic sensitivity and the factors that govern it",
        "Differentiate radiographic contrast, film contrast, and subject contrast"
       ],
       "topics": [
        "Technique 4.1 Radiographic sensitivity",
        "Technique 4.2 Radiographic contrast",
        "Technique 4.3 Film contrast",
        "Technique 4.4 Subject contrast"
       ],
       "media": [
        {
         "type": "video",
         "title": "Contrast: The Anatomy of a Good Radiograph",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Contrast Factor Tree: Film vs. Subject",
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
       "id": "rt1-8-2",
       "title": "Definition, Graininess, and Image Quality Indicators",
       "minutes": 90,
       "objectives": [
        "Explain image definition and the effects of film graininess and screen mottle",
        "Describe IQI types and how IQIs verify radiographic quality"
       ],
       "topics": [
        "Technique 4.5 Definition",
        "Technique 4.6 Film graininess and screen mottle effects",
        "Technique 4.7 Image quality indicators (IQIs)"
       ],
       "media": [
        {
         "type": "video",
         "title": "IQIs: Hole-Type and Wire-Type",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "IQI Sensitivity Reading Practice",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Graininess and Mottle at Magnification",
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
     "id": "rt1-9",
     "title": "Film Processing, Exposure Techniques, and Fluoroscopy",
     "cpSection": "Radiography Technique Course 5.0-7.0",
     "hours": 6.0,
     "lessons": [
      {
       "id": "rt1-9-1",
       "title": "Film Handling, Loading, and Processing",
       "minutes": 90,
       "objectives": [
        "Apply safelight, darkroom, and loading-bench cleanliness practices",
        "Demonstrate correct opening, loading, and sealing of film and cassettes",
        "Outline the elements of manual film processing and green-film handling"
       ],
       "topics": [
        "Technique 5.1 Safelight and darkroom practices",
        "Technique 5.2 Loading bench and cleanliness",
        "Technique 5.3 Opening of film boxes and packets",
        "Technique 5.4 Loading of film and sealing cassettes",
        "Technique 5.5 Handling techniques for green film",
        "Technique 5.6 Elements of manual film processing"
       ],
       "media": [
        {
         "type": "video",
         "title": "Darkroom Practices and Film Loading",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "narration",
         "title": "Manual Processing Sequence Walkthrough",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Darkroom Layout and Workflow",
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
       "id": "rt1-9-2",
       "title": "Single-Wall and Double-Wall Exposure Techniques",
       "minutes": 90,
       "objectives": [
        "Set up single-wall radiography exposures",
        "Apply double-wall techniques including offset double-wall single-wall viewing and elliptical shots"
       ],
       "topics": [
        "Technique 6.1 Single-wall radiography",
        "Technique 6.2 Double-wall radiography",
        "Technique 6.2.1 Viewing two walls simultaneously",
        "Technique 6.2.2 Offset double-wall exposure single-wall viewing",
        "Technique 6.2.3 Elliptical techniques"
       ],
       "media": [
        {
         "type": "video",
         "title": "SWSI, DWSI, DWDI: Choosing the Right Shot",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Pipe Weld Exposure Setups",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Pipe Shot Planner",
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
       "id": "rt1-9-3",
       "title": "Panoramic Exposures, Multiple-Film Loading, and Specimen Configuration",
       "minutes": 90,
       "objectives": [
        "Describe panoramic radiography and its applications",
        "Explain multiple-film loading and how specimen configuration drives technique choice"
       ],
       "topics": [
        "Technique 6.3 Panoramic radiography",
        "Technique 6.4 Use of multiple-film loading",
        "Technique 6.5 Specimen configuration"
       ],
       "media": [
        {
         "type": "video",
         "title": "Panoramic and Multi-Film Techniques",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Specimen Configuration vs. Technique Selection",
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
       "id": "rt1-9-4",
       "title": "Fluoroscopic Techniques",
       "minutes": 90,
       "objectives": [
        "Explain dark adaptation, eye sensitivity, and personnel protection in fluoroscopy",
        "Compare direct-screen with indirect- and remote-screen viewing, including sensitivity and limitations"
       ],
       "topics": [
        "Technique 7.1 Dark adaptation and eye sensitivity",
        "Technique 7.2 Special scattered radiation techniques",
        "Technique 7.3 Personnel protection",
        "Technique 7.4 Sensitivity",
        "Technique 7.5 Limitations",
        "Technique 7.6 Direct-screen viewing",
        "Technique 7.7 Indirect- and remote-screen viewing"
       ],
       "media": [
        {
         "type": "video",
         "title": "Fluoroscopic Inspection Techniques",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Direct vs. Remote Screen Viewing Arrangements",
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
   "description": "Level II covers the CP-105-2024 Film Quality and Manufacturing Processes Course and Radiographic Interpretation and Evaluation Course: review of basic principles, darkroom facilities and processing, film quality troubleshooting, discontinuities by manufacturing process, safety review, radiograph viewing, application techniques, and the evaluation of castings and weldments to codes, standards, and procedures.",
   "finalExam": {
    "questions": 50,
    "passingScore": 80,
    "bank": "RT",
    "bankLevel": 2,
    "status": "placeholder"
   },
   "modules": [
    {
     "id": "rt2-1",
     "title": "Review of Basic Radiographic Principles",
     "cpSection": "Film Quality and Manufacturing Processes Course 1.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt2-1-1",
       "title": "Radiation Interaction and Math Review",
       "minutes": 90,
       "objectives": [
        "Review the interaction of radiation with matter at Level II depth",
        "Refresh the mathematical skills required for technique development"
       ],
       "topics": [
        "FQ 1.1 Interaction of radiation with matter",
        "FQ 1.2 Math review"
       ],
       "media": [
        {
         "type": "video",
         "title": "Level II Physics Refresher",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Mixed Review Problem Set",
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
       "id": "rt2-1-2",
       "title": "Exposure Calculations and Geometric Principles Review",
       "minutes": 90,
       "objectives": [
        "Solve multi-step exposure calculations involving source changes, distance, and density",
        "Apply geometric exposure principles to minimize unsharpness and distortion"
       ],
       "topics": [
        "FQ 1.3 Exposure calculations",
        "FQ 1.4 Geometric exposure principles"
       ],
       "media": [
        {
         "type": "video",
         "title": "Advanced Exposure Calculation Workshop",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Technique Parameter Solver",
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
       "id": "rt2-1-3",
       "title": "Radiographic Image Quality Parameters Review",
       "minutes": 90,
       "objectives": [
        "Relate density, contrast, definition, and sensitivity to technique variables",
        "Evaluate how image quality parameters interact when optimizing a technique"
       ],
       "topics": [
        "FQ 1.5 Radiographic image quality parameters"
       ],
       "media": [
        {
         "type": "video",
         "title": "Image Quality Parameters in Depth",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Quality Parameter Interaction Map",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Optimize the Technique Challenge",
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
     "id": "rt2-2",
     "title": "Darkroom Facilities and Film Processing",
     "cpSection": "Film Quality and Manufacturing Processes Course 2.1-2.5",
     "hours": 5.75,
     "lessons": [
      {
       "id": "rt2-2-1",
       "title": "Darkroom Facilities and Equipment",
       "minutes": 90,
       "objectives": [
        "Compare automatic film processors with manual processing facilities",
        "Specify safelight, viewer light, loading bench, and ancillary equipment requirements"
       ],
       "topics": [
        "FQ 2.1 Facilities and equipment",
        "FQ 2.1.1 Automatic film processor versus manual processing",
        "FQ 2.1.2 Safelights",
        "FQ 2.1.3 Viewer lights",
        "FQ 2.1.4 Loading bench",
        "FQ 2.1.5 Miscellaneous equipment"
       ],
       "media": [
        {
         "type": "video",
         "title": "Inside a Production Darkroom",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Darkroom Equipment Specification Checklist",
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
       "id": "rt2-2-2",
       "title": "Film Loading and Storage Protection",
       "minutes": 90,
       "objectives": [
        "Apply general rules for handling unprocessed film and packaging types",
        "Demonstrate cassette loading techniques for sheet and roll film",
        "Protect radiographic film in storage from heat, radiation, and pressure"
       ],
       "topics": [
        "FQ 2.2 Film loading",
        "FQ 2.2.1 General rules for handling unprocessed film",
        "FQ 2.2.2 Types of film packaging",
        "FQ 2.2.3 Cassette loading techniques for sheet and roll",
        "FQ 2.3 Protection of radiography film in storage"
       ],
       "media": [
        {
         "type": "video",
         "title": "Handling and Loading Sheet and Roll Film",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "narration",
         "title": "Film Storage Do's and Don'ts",
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
       "id": "rt2-2-3",
       "title": "Manual Film Processing Chemistry and Steps",
       "minutes": 90,
       "objectives": [
        "Sequence developer, stop bath, fixer, wash, and drying steps with correct times and temperatures",
        "Manage developer and fixer replenishment and prevent water spots"
       ],
       "topics": [
        "FQ 2.4 Processing of film - manual",
        "FQ 2.4.1 Developer and replenishment",
        "FQ 2.4.2 Stop bath",
        "FQ 2.4.3 Fixer and replenishment",
        "FQ 2.4.4 Washing",
        "FQ 2.4.5 Prevention of water spots",
        "FQ 2.4.6 Drying"
       ],
       "media": [
        {
         "type": "video",
         "title": "Manual Processing from Developer to Dryer",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Processing Chemistry Flow Chart",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Processing Fault Diagnosis Drill",
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
       "id": "rt2-2-4",
       "title": "Automatic Film Processing",
       "minutes": 75,
       "objectives": [
        "Describe automatic processor transport, chemistry, and temperature control",
        "Identify processor maintenance and quality control practices"
       ],
       "topics": [
        "FQ 2.5 Automatic film processing"
       ],
       "media": [
        {
         "type": "video",
         "title": "How Automatic Processors Work",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Automatic Processor Cutaway",
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
     "id": "rt2-3",
     "title": "Film Filing, Troubleshooting, and Density Measurement",
     "cpSection": "Film Quality and Manufacturing Processes Course 2.6-2.8",
     "hours": 4.0,
     "lessons": [
      {
       "id": "rt2-3-1",
       "title": "Film Filing and Storage of Processed Radiographs",
       "minutes": 75,
       "objectives": [
        "Apply retention-life measurements and long-term storage requirements",
        "Implement filing and separation techniques for archived radiographs"
       ],
       "topics": [
        "FQ 2.6 Film filing and storage",
        "FQ 2.6.1 Retention-life measurements",
        "FQ 2.6.2 Long-term storage",
        "FQ 2.6.3 Filing and separation techniques"
       ],
       "media": [
        {
         "type": "video",
         "title": "Archiving Radiographs for the Long Term",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Archival Storage Requirements Summary",
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
       "id": "rt2-3-2",
       "title": "Unsatisfactory Radiographs: Causes and Cures",
       "minutes": 90,
       "objectives": [
        "Diagnose high or insufficient density, high or low contrast, and poor definition",
        "Identify and prevent fog, light leaks, and film artifacts"
       ],
       "topics": [
        "FQ 2.7 Unsatisfactory radiographs - causes and cures",
        "FQ 2.7.1 High film density",
        "FQ 2.7.2 Insufficient film density",
        "FQ 2.7.3 High contrast",
        "FQ 2.7.4 Low contrast",
        "FQ 2.7.5 Poor definition",
        "FQ 2.7.6 Fog",
        "FQ 2.7.7 Light leaks",
        "FQ 2.7.8 Artifacts"
       ],
       "media": [
        {
         "type": "video",
         "title": "Troubleshooting Bad Radiographs",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Cause-and-Cure Matching Exercise",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Artifact Identification Gallery",
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
       "id": "rt2-3-3",
       "title": "Film Density Measurement",
       "minutes": 75,
       "objectives": [
        "Use step-wedge comparison films to estimate density",
        "Operate and verify densitometers for quantitative density measurement"
       ],
       "topics": [
        "FQ 2.8 Film density",
        "FQ 2.8.1 Step-wedge comparison film",
        "FQ 2.8.2 Densitometers"
       ],
       "media": [
        {
         "type": "video",
         "title": "Densitometers and Step Wedges in Practice",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Virtual Densitometer Reading Practice",
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
     "id": "rt2-4",
     "title": "Indications, Discontinuities, and Defects",
     "cpSection": "Film Quality and Manufacturing Processes Course 3.0",
     "hours": 3.0,
     "lessons": [
      {
       "id": "rt2-4-1",
       "title": "Indications, Discontinuities, and Defects Defined",
       "minutes": 90,
       "objectives": [
        "Differentiate indications, discontinuities, and defects",
        "Explain how acceptance criteria determine when a discontinuity becomes a defect"
       ],
       "topics": [
        "FQ 3.1 Indications",
        "FQ 3.2 Discontinuities",
        "FQ 3.3 Defects",
        "3.2.3 Service-induced discontinuities"
       ],
       "media": [
        {
         "type": "video",
         "title": "Indication, Discontinuity, or Defect?",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Evaluation Decision Flow",
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
       "id": "rt2-4-2",
       "title": "Inherent, Processing, and Service Discontinuities",
       "minutes": 90,
       "objectives": [
        "Classify discontinuities by origin: inherent, processing, and service",
        "Give examples of each discontinuity class and where they originate"
       ],
       "topics": [
        "FQ 3.2.1 Inherent discontinuities",
        "FQ 3.2.2 Processing discontinuities",
        "FQ 3.2.3 Service discontinuities"
       ],
       "media": [
        {
         "type": "video",
         "title": "Discontinuities by Life-Cycle Stage",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Classify-the-Discontinuity Drill",
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
     "id": "rt2-5",
     "title": "Manufacturing Processes and Associated Discontinuities",
     "cpSection": "Film Quality and Manufacturing Processes Course 4.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt2-5-1",
       "title": "Casting Processes and Discontinuities",
       "minutes": 90,
       "objectives": [
        "Describe ingot, sand, centrifugal, and investment casting processes",
        "Identify discontinuities associated with each casting process"
       ],
       "topics": [
        "FQ 4.1 Casting processes and associated discontinuities",
        "FQ 4.1.1 Ingots, blooms, and billets",
        "FQ 4.1.2 Sand casting",
        "FQ 4.1.3 Centrifugal casting",
        "FQ 4.1.4 Investment casting"
       ],
       "media": [
        {
         "type": "video",
         "title": "Casting Methods and Their Flaws",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Casting Discontinuity Origin Map",
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
       "id": "rt2-5-2",
       "title": "Wrought Processes and Discontinuities",
       "minutes": 90,
       "objectives": [
        "Describe forging, rolling, and extrusion processes",
        "Identify discontinuities associated with wrought products"
       ],
       "topics": [
        "FQ 4.2 Wrought processes and associated discontinuities",
        "FQ 4.2.1 Forgings",
        "FQ 4.2.2 Rolled products",
        "FQ 4.2.3 Extruded products"
       ],
       "media": [
        {
         "type": "video",
         "title": "Forging, Rolling, and Extrusion Flaws",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Wrought Product Discontinuity Chart",
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
       "id": "rt2-5-3",
       "title": "Welding Processes and Discontinuities",
       "minutes": 90,
       "objectives": [
        "Summarize SAW, SMAW, GMAW, FCAW, GTAW, resistance, and special welding processes",
        "Associate typical weld discontinuities with each welding process"
       ],
       "topics": [
        "FQ 4.3 Welding processes and associated discontinuities",
        "FQ 4.3.1 Submerged arc welding (SAW)",
        "FQ 4.3.2 Shielded metal arc welding (SMAW)",
        "FQ 4.3.3 Gas metal arc welding (GMAW)",
        "FQ 4.3.4 Flux cored arc welding (FCAW)",
        "FQ 4.3.5 Gas tungsten arc welding (GTAW)",
        "FQ 4.3.6 Resistance welding",
        "FQ 4.3.7 Special welding processes - electron-beam, electroslag, electrogas, etc."
       ],
       "media": [
        {
         "type": "video",
         "title": "Welding Processes for the Radiographer",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Weld Process vs. Typical Discontinuities Matrix",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Match the Process to the Discontinuity",
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
     "id": "rt2-6",
     "title": "Radiographic Safety Principles Review",
     "cpSection": "Film Quality and Manufacturing Processes Course 5.0",
     "hours": 2.75,
     "lessons": [
      {
       "id": "rt2-6-1",
       "title": "Exposure Control and ALARA Review",
       "minutes": 90,
       "objectives": [
        "Apply time, distance, and shielding concepts to Level II work scenarios",
        "Evaluate work practices against the ALARA concept"
       ],
       "topics": [
        "FQ 5.1 Controlling personnel exposure",
        "FQ 5.2 Time, distance, shielding concepts",
        "FQ 5.3 ALARA concept"
       ],
       "media": [
        {
         "type": "video",
         "title": "Safety Review for Working Radiographers",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Exposure Scenario Decision Trainer",
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
       "id": "rt2-6-2",
       "title": "Detection Equipment and Exposure Device Characteristics Review",
       "minutes": 75,
       "objectives": [
        "Select appropriate radiation detection equipment for survey and monitoring tasks",
        "Review exposure device operating characteristics that affect safe handling"
       ],
       "topics": [
        "FQ 5.4 Radiation detection equipment",
        "FQ 5.5 Exposure device operating characteristics"
       ],
       "media": [
        {
         "type": "video",
         "title": "Instrument Checks and Device Operation Review",
         "duration": "10:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Survey Instrument Comparison Table",
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
     "id": "rt2-7",
     "title": "Radiograph Viewing",
     "cpSection": "Radiographic Interpretation and Evaluation Course 1.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt2-7-1",
       "title": "Illuminators, Lighting, and Composite Viewing",
       "minutes": 90,
       "objectives": [
        "Specify film-illuminator and background lighting requirements",
        "Apply multiple-composite viewing requirements"
       ],
       "topics": [
        "IE 1.1 Film-illuminator requirements",
        "IE 1.2 Background lighting",
        "IE 1.3 Multiple-composite viewing"
       ],
       "media": [
        {
         "type": "video",
         "title": "Setting Up the Viewing Station",
         "duration": "11:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Illuminator Luminance Requirements Chart",
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
       "id": "rt2-7-2",
       "title": "IQI Placement, Dark Adaptation, and Film Identification",
       "minutes": 90,
       "objectives": [
        "Verify correct IQI placement on production radiographs",
        "Explain personnel dark adaptation and visual acuity requirements",
        "Confirm film identification requirements are met"
       ],
       "topics": [
        "IE 1.4 IQI placement",
        "IE 1.5 Personnel dark adaptation and visual acuity",
        "IE 1.6 Film identification"
       ],
       "media": [
        {
         "type": "video",
         "title": "IQI Placement and Viewing Readiness",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Spot the Placement Error",
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
       "id": "rt2-7-3",
       "title": "Location Markers, Density Measurement, and Film Artifacts",
       "minutes": 90,
       "objectives": [
        "Verify location marker placement and coverage",
        "Measure film density at required locations and recognize film artifacts during viewing"
       ],
       "topics": [
        "IE 1.7 Location markers",
        "IE 1.8 Film density measurement",
        "IE 1.9 Film artifacts"
       ],
       "media": [
        {
         "type": "video",
         "title": "Markers, Density Checks, and Artifact Recognition",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Artifact or Indication? Reading Drill",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Common Film Artifact Reference Sheet",
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
     "id": "rt2-8",
     "title": "Application Techniques",
     "cpSection": "Radiographic Interpretation and Evaluation Course 2.0",
     "hours": 4.5,
     "lessons": [
      {
       "id": "rt2-8-1",
       "title": "Multiple-Film Techniques",
       "minutes": 90,
       "objectives": [
        "Apply multiple-film techniques to thickness variation problems",
        "Select film speed and latitude combinations for multi-film exposures"
       ],
       "topics": [
        "IE 2.1 Multiple-film techniques",
        "IE 2.1.1 Thickness variation parameters",
        "IE 2.1.2 Film speed",
        "IE 2.1.3 Film latitude"
       ],
       "media": [
        {
         "type": "video",
         "title": "Multi-Film Loading for Thickness Range",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Film Speed and Latitude Pairing Guide",
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
       "id": "rt2-8-2",
       "title": "Enlargement, Projection, and Geometric Relationships",
       "minutes": 90,
       "objectives": [
        "Apply enlargement and projection techniques",
        "Relate geometric unsharpness, IQI sensitivity, source-to-film distance, and focal spot size"
       ],
       "topics": [
        "IE 2.2 Enlargement and projection",
        "IE 2.3 Geometrical relationships",
        "IE 2.3.1 Geometrical unsharpness",
        "IE 2.3.2 IQI sensitivity",
        "IE 2.3.3 Source-to-film distance",
        "IE 2.3.4 Focal spot size"
       ],
       "media": [
        {
         "type": "video",
         "title": "Geometry-Driven Technique Decisions",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "SFD and Focal Spot Trade-off Calculator",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Projection Magnification Geometry",
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
       "id": "rt2-8-3",
       "title": "Triangulation, Localized Magnification, and Film Handling",
       "minutes": 90,
       "objectives": [
        "Use triangulation methods to locate discontinuity depth",
        "Apply localized magnification and proper film handling techniques during evaluation"
       ],
       "topics": [
        "IE 2.4 Triangulation methods for discontinuity location",
        "IE 2.5 Localized magnification",
        "IE 2.6 Film handling techniques"
       ],
       "media": [
        {
         "type": "video",
         "title": "Locating Flaws in Depth: Triangulation",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "simulation",
         "title": "Parallax Shift Depth Locator",
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
     "id": "rt2-9",
     "title": "Evaluation of Castings, Weldments, and Standards",
     "cpSection": "Radiographic Interpretation and Evaluation Course 3.0-5.0",
     "hours": 7.0,
     "lessons": [
      {
       "id": "rt2-9-1",
       "title": "Casting Evaluation: Methods and Discontinuities",
       "minutes": 90,
       "objectives": [
        "Review casting methods and the discontinuities each produces",
        "Predict the origin and typical orientation of casting discontinuities"
       ],
       "topics": [
        "IE 3.1 Casting method review",
        "IE 3.2 Casting discontinuities",
        "IE 3.3 Origin and typical orientation of discontinuities"
       ],
       "media": [
        {
         "type": "video",
         "title": "Reading Casting Radiographs: Where Flaws Form",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Casting Discontinuity Orientation Atlas",
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
       "id": "rt2-9-2",
       "title": "Casting Radiographic Appearance and Acceptance Criteria",
       "minutes": 75,
       "objectives": [
        "Recognize the radiographic appearance of common casting discontinuities",
        "Apply casting codes/standards acceptance criteria using reference radiographs"
       ],
       "topics": [
        "IE 3.4 Radiographic appearance",
        "IE 3.5 Casting codes/standards - applicable acceptance criteria",
        "IE 3.6 Reference radiographs"
       ],
       "media": [
        {
         "type": "video",
         "title": "Grading Castings Against Reference Radiographs",
         "duration": "12:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Casting Accept/Reject Practice Set",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Casting Reference Radiograph Index (e.g., ASTM E446/E186/E280)",
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
       "id": "rt2-9-3",
       "title": "Weldment Evaluation: Methods and Discontinuities",
       "minutes": 90,
       "objectives": [
        "Review welding methods and their characteristic discontinuities",
        "Predict the origin and typical orientation of weld discontinuities"
       ],
       "topics": [
        "IE 4.1 Welding method review",
        "IE 4.2 Welding discontinuities",
        "IE 4.3 Origin and typical orientation of discontinuities"
       ],
       "media": [
        {
         "type": "video",
         "title": "Weld Discontinuities on Film: Porosity to Cracks",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "diagram",
         "title": "Weld Joint Discontinuity Location Map",
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
       "id": "rt2-9-4",
       "title": "Weldment Radiographic Appearance and Acceptance Criteria",
       "minutes": 75,
       "objectives": [
        "Recognize the radiographic appearance of weld discontinuities",
        "Apply welding codes/standards acceptance criteria using reference radiographs or pictograms"
       ],
       "topics": [
        "IE 4.4 Radiographic appearance",
        "IE 4.5 Welding codes/standards - applicable acceptance criteria",
        "IE 4.6 Reference radiographs or pictograms"
       ],
       "media": [
        {
         "type": "video",
         "title": "Accept or Reject: Weld Evaluation Workshop",
         "duration": "14:00",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Weld Accept/Reject Practice Set",
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
       "id": "rt2-9-5",
       "title": "Standards, Codes, Procedures, and Reporting",
       "minutes": 90,
       "objectives": [
        "Navigate ASTM standards and acceptable radiography techniques and setups",
        "Follow employer procedures, verify radiograph parameters, and complete radiography reports"
       ],
       "topics": [
        "IE 5.1 ASTM standards",
        "IE 5.2 Acceptable radiography techniques and setups",
        "IE 5.3 Applicable employer procedures",
        "IE 5.4 Procedure for radiograph parameter verification",
        "IE 5.5 Radiography reports"
       ],
       "media": [
        {
         "type": "video",
         "title": "Working to Codes, Standards, and Procedures",
         "duration": "13:00",
         "status": "placeholder"
        },
        {
         "type": "reference",
         "title": "Key ASTM RT Standards Quick Reference",
         "status": "placeholder"
        },
        {
         "type": "interactive",
         "title": "Complete-the-Radiography-Report Exercise",
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