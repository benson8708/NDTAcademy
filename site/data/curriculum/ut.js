window.NDTA_DATA=window.NDTA_DATA||{};window.NDTA_DATA['curriculum-ut']={
  "id": "ut",
  "code": "UT",
  "name": "Ultrasonic Testing",
  "cp105": "ANSI/ASNT CP-105-2024 UT Topical Outlines",
  "hours": {
    "snt_tc_1a": { "l1": 40, "l2": 40 },
    "nas410": { "l1": 40, "l2": 40 },
    "directToL2": 80
  },
  "futureTechniques": [
    "Full Matrix Capture / Total Focusing Method (FMC/TFM) — Level II advanced technique outline (prerequisite: UT Level II unrestricted)",
    "Phased Array UT (PAUT) — Level II advanced technique outline (prerequisite: UT Level II unrestricted)",
    "Time of Flight Diffraction (TOFD) — Level II advanced technique outline (prerequisite: UT Level II unrestricted)",
    "Limited Certification: Ultrasonic Digital Thickness Measurement",
    "Limited Certification: Ultrasonic A-scan Thickness Measurement"
  ],
  "levels": [
    {
      "level": "I",
      "targetHours": 40,
      "description": "Covers the CP-105 Basic Ultrasonic Testing Course and Ultrasonic Testing Technique Course: sound-wave physics, pulse-echo instrumentation, transducers and couplants, contact and immersion techniques, and calibration and examination to written procedures. Prepares trainees to perform standardized UT setups and data collection under Level II/III supervision.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "UT", "bankLevel": 1, "status": "placeholder" },
      "modules": [
        {
          "id": "ut1-1",
          "title": "Introduction to Ultrasonic Testing",
          "cpSection": "Basic UT Course §1.0",
          "hours": 3.5,
          "lessons": [
            {
              "id": "ut1-1-1",
              "title": "What Is Ultrasonics? History and Applications",
              "minutes": 60,
              "objectives": [
                "Define ultrasonics and distinguish ultrasonic frequencies from audible sound",
                "Summarize key milestones in the development of industrial UT",
                "List at least five industrial applications of ultrasonic energy"
              ],
              "topics": [
                "1.1 Definition of ultrasonics",
                "1.2 History of UT",
                "1.3 Applications of ultrasonic energy"
              ],
              "media": [
                { "type": "video", "title": "Sound You Can't Hear: Ultrasonics in Industry", "duration": "10:00", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: History and applications of ultrasonic testing", "status": "placeholder" },
                { "type": "diagram", "title": "Frequency spectrum from infrasound to industrial UT ranges", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-1-2",
              "title": "Math Review for UT",
              "minutes": 90,
              "objectives": [
                "Solve velocity, frequency, and wavelength problems using V = f x lambda",
                "Convert between metric and imperial units used in UT",
                "Apply decibel and trigonometric calculations used in beam path and gain problems"
              ],
              "topics": [
                "1.4 Basic math review"
              ],
              "media": [
                { "type": "video", "title": "UT Math Essentials: Wavelength, dB, and Trig Walkthrough", "duration": "14:00", "status": "placeholder" },
                { "type": "interactive", "title": "Step-through problem solver for V = f x lambda and dB gain calculations", "status": "placeholder" },
                { "type": "reference", "title": "UT formula sheet and unit conversion tables (downloadable)", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-1-3",
              "title": "Certification Levels and Responsibilities",
              "minutes": 60,
              "objectives": [
                "Describe the duties and limitations of NDT Levels I, II, and III",
                "Explain how employer written practices govern qualification and certification",
                "Identify which UT tasks a Level I may perform without direct supervision"
              ],
              "topics": [
                "1.5 Responsibilities of levels of certification"
              ],
              "media": [
                { "type": "video", "title": "Who Does What: NDT Certification Levels Explained", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "Responsibility matrix: Level I vs. Level II vs. Level III tasks", "status": "placeholder" },
                { "type": "reference", "title": "Overview of SNT-TC-1A, CP-189, and NAS 410 certification frameworks", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-2",
          "title": "Basic Principles of Acoustics",
          "cpSection": "Basic UT Course §2.0",
          "hours": 5.0,
          "lessons": [
            {
              "id": "ut1-2-1",
              "title": "Nature of Sound Waves and Wave Modes",
              "minutes": 75,
              "objectives": [
                "Describe particle motion in longitudinal, shear, surface, and plate wave modes",
                "Explain how mechanical vibration is introduced into a test part",
                "Compare the relative velocities of common wave modes in a given material"
              ],
              "topics": [
                "2.1 Nature of sound waves",
                "2.2 Modes of sound-wave generation"
              ],
              "media": [
                { "type": "video", "title": "Wave Modes in Motion: Longitudinal, Shear, Surface, and Plate Waves", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Animated particle-motion visualizer with selectable wave mode", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: How sound propagates through solids", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-2-2",
              "title": "Velocity, Frequency, Wavelength, and Attenuation",
              "minutes": 75,
              "objectives": [
                "Calculate wavelength for a given material velocity and transducer frequency",
                "Explain how scattering and absorption attenuate sound in materials",
                "Predict how frequency selection affects penetration and sensitivity"
              ],
              "topics": [
                "2.3 Velocity, frequency, and wavelength of sound waves",
                "2.4 Attenuation of sound waves"
              ],
              "media": [
                { "type": "video", "title": "Why Frequency Matters: Penetration vs. Sensitivity", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Slider lab: change frequency and material to see wavelength and attenuation effects", "status": "placeholder" },
                { "type": "reference", "title": "Acoustic velocity table for common engineering materials", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-2-3",
              "title": "Acoustic Impedance and Reflection",
              "minutes": 75,
              "objectives": [
                "Compute acoustic impedance from material density and velocity",
                "Calculate the percentage of sound reflected at an interface between two media",
                "Explain why discontinuities and back surfaces produce echoes"
              ],
              "topics": [
                "2.5 Acoustic impedance",
                "2.6 Reflection"
              ],
              "media": [
                { "type": "video", "title": "Echoes at Interfaces: Impedance Mismatch Explained", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Reflection and transmission coefficients at steel/water/air boundaries", "status": "placeholder" },
                { "type": "interactive", "title": "Impedance calculator: pick two materials, see reflected energy", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-2-4",
              "title": "Refraction, Mode Conversion, Snell's Law, and Beam Fields",
              "minutes": 75,
              "objectives": [
                "Apply Snell's law to determine refracted angles and first/second critical angles",
                "Describe mode conversion at an interface and its practical consequences",
                "Differentiate Fresnel (near-field) and Fraunhofer (far-field) zones of a sound beam"
              ],
              "topics": [
                "2.7 Refraction and mode conversion",
                "2.8 Snell's law and critical angles",
                "2.9 Fresnel and Fraunhofer effects"
              ],
              "media": [
                { "type": "video", "title": "Bending the Beam: Snell's Law and Critical Angles", "duration": "13:00", "status": "placeholder" },
                { "type": "interactive", "title": "Snell's law angle explorer with live critical-angle markers", "status": "placeholder" },
                { "type": "diagram", "title": "Near field / far field beam profile with intensity variations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-3",
          "title": "Ultrasonic Instrumentation",
          "cpSection": "Basic UT Course §3.1–3.2",
          "hours": 4.0,
          "lessons": [
            {
              "id": "ut1-3-1",
              "title": "Pulse-Echo Instruments, Displays, and Controls",
              "minutes": 90,
              "objectives": [
                "Identify the function of the time base, pulser, receiver, and display in a pulse-echo instrument",
                "Interpret A-scan, B-scan, and C-scan presentations",
                "Demonstrate the effect of gain, range, delay, and reject controls on the display"
              ],
              "topics": [
                "3.1 Basic pulse-echo instrumentation (A-scan, B-scan, C-scan, and computerized systems)",
                "3.1.1 Electronics — time-base, pulser, receiver, and various monitor displays",
                "3.1.2 Control functions"
              ],
              "media": [
                { "type": "video", "title": "Inside the Flaw Detector: Pulser, Receiver, and Time Base", "duration": "14:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual flaw detector: adjust gain, range, and delay on a live A-scan", "status": "placeholder" },
                { "type": "diagram", "title": "Block diagram of a pulse-echo instrument with A/B/C-scan display examples", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-3-2",
              "title": "Instrument Standardization and Reference Blocks",
              "minutes": 90,
              "objectives": [
                "Perform basic instrument standardization for range and sensitivity",
                "Identify common reference block types and their intended uses",
                "Explain why standardization must precede data collection"
              ],
              "topics": [
                "3.1.3 Standardization",
                "3.1.3.1 Basic instrument standardization",
                "3.1.3.2 Reference blocks (types and use)"
              ],
              "media": [
                { "type": "video", "title": "Setting Up Right: Basic Instrument Standardization Demo", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Guided standardization exercise on an IIW-type block", "status": "placeholder" },
                { "type": "reference", "title": "Catalog of common UT reference blocks and their geometries", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-3-3",
              "title": "Digital Thickness Instrumentation",
              "minutes": 60,
              "objectives": [
                "Describe how digital thickness gauges derive thickness from time of flight",
                "Set up and zero a digital thickness gauge on a step wedge",
                "Recognize common error sources in digital thickness readings"
              ],
              "topics": [
                "3.2 Digital thickness instrumentation"
              ],
              "media": [
                { "type": "video", "title": "Thickness Gauging Basics: From Echo to Number", "duration": "09:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual thickness gauge: zero on a step wedge and take readings", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-4",
          "title": "Transducers and Couplants",
          "cpSection": "Basic UT Course §3.3–3.4",
          "hours": 4.5,
          "lessons": [
            {
              "id": "ut1-4-1",
              "title": "Piezoelectricity and Transducer Elements",
              "minutes": 75,
              "objectives": [
                "Explain the piezoelectric effect and its role in generating and receiving ultrasound",
                "Compare common transducer element materials and their properties",
                "Relate element thickness to resonant frequency"
              ],
              "topics": [
                "3.3 Transducer operation and theory",
                "3.3.1 Piezoelectric effect",
                "3.3.2 Types of transducer elements",
                "3.3.3 Frequency (transducer element – thickness relationships)"
              ],
              "media": [
                { "type": "video", "title": "Crystals That Talk: The Piezoelectric Effect", "duration": "11:00", "status": "placeholder" },
                { "type": "diagram", "title": "Cutaway of a transducer element showing thickness-frequency relationship", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Transducer element materials compared", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-4-2",
              "title": "Sound Beam Characteristics: Near Field, Beam Spread, and Intensity",
              "minutes": 75,
              "objectives": [
                "Calculate near-field length for a given transducer and material",
                "Calculate beam spread half-angle and explain its inspection consequences",
                "Describe intensity variations across and along the sound beam"
              ],
              "topics": [
                "3.3.4 Near field and far field",
                "3.3.5 Beam spread",
                "3.3.8 Beam intensity characteristics"
              ],
              "media": [
                { "type": "video", "title": "Mapping the Beam: Near Field, Far Field, and Spread", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Beam profile plotter: vary diameter and frequency, watch the beam change", "status": "placeholder" },
                { "type": "reference", "title": "Near-field and beam-spread formula card with worked examples", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-4-3",
              "title": "Transducer Construction, Types, and Performance",
              "minutes": 60,
              "objectives": [
                "Identify the construction features of straight-beam, angle-beam, and dual-element transducers",
                "Define sensitivity, resolution, and damping and explain their trade-offs",
                "Recognize specialized transducer technologies such as laser UT and EMAT"
              ],
              "topics": [
                "3.3.6 Construction, materials, and shapes",
                "3.3.7 Types (straight, angle, dual, etc.)",
                "3.3.9 Sensitivity, resolution, and damping",
                "3.3.10 Mechanical vibration into part",
                "3.3.11 Other types of transducers (laser UT, EMAT, etc.)"
              ],
              "media": [
                { "type": "video", "title": "A Tour of the Probe Box: Transducer Types and Construction", "duration": "10:00", "status": "placeholder" },
                { "type": "diagram", "title": "Exploded views: straight, angle, dual, EMAT, and laser-UT transducers", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-4-4",
              "title": "Couplants: Purpose, Selection, and Efficiency",
              "minutes": 60,
              "objectives": [
                "Explain why a couplant is required for contact testing",
                "Select an appropriate couplant for surface condition, orientation, and temperature",
                "Compare the transmission efficiency of common couplant materials"
              ],
              "topics": [
                "3.4 Couplants",
                "3.4.1 Purpose and principles",
                "3.4.2 Materials and their efficiency"
              ],
              "media": [
                { "type": "video", "title": "The Thin Layer That Makes It Work: Couplants", "duration": "08:00", "status": "placeholder" },
                { "type": "interactive", "title": "Couplant selector: match couplant to surface, position, and temperature", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Couplant principles and pitfalls", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-5",
          "title": "Basic Testing Methods",
          "cpSection": "Basic UT Course §4.0",
          "hours": 3.0,
          "lessons": [
            {
              "id": "ut1-5-1",
              "title": "Contact Testing Overview",
              "minutes": 60,
              "objectives": [
                "Describe the essential elements of contact ultrasonic testing",
                "Demonstrate correct probe handling and scanning pressure",
                "Identify applications where contact testing is the preferred method"
              ],
              "topics": [
                "4.1 Contact"
              ],
              "media": [
                { "type": "video", "title": "Hands On the Part: Contact Testing Fundamentals", "duration": "09:00", "status": "placeholder" },
                { "type": "diagram", "title": "Contact test setup: probe, couplant layer, part, and sound path", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-5-2",
              "title": "Immersion Testing Overview",
              "minutes": 60,
              "objectives": [
                "Describe how immersion testing couples sound through a water path",
                "Explain the advantages of immersion testing for automated scanning",
                "Calculate water-path distance to avoid interfering multiple echoes"
              ],
              "topics": [
                "4.2 Immersion"
              ],
              "media": [
                { "type": "video", "title": "Underwater Advantage: Immersion Testing Basics", "duration": "09:00", "status": "placeholder" },
                { "type": "simulation", "title": "Water-path calculator and virtual immersion tank setup", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-5-3",
              "title": "Air-Coupled Testing Overview",
              "minutes": 60,
              "objectives": [
                "Explain the impedance challenge of coupling ultrasound through air",
                "Identify materials and applications suited to air-coupled UT",
                "Compare air coupling with contact and immersion methods"
              ],
              "topics": [
                "4.3 Air coupling"
              ],
              "media": [
                { "type": "video", "title": "No Couplant Needed: Air-Coupled Ultrasonics", "duration": "08:00", "status": "placeholder" },
                { "type": "diagram", "title": "Air-coupled through-transmission setup for composite panels", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: When to choose contact, immersion, or air coupling", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-6",
          "title": "Contact Testing Techniques",
          "cpSection": "UT Technique Course §1.1",
          "hours": 4.5,
          "lessons": [
            {
              "id": "ut1-6-1",
              "title": "Straight-Beam and Angle-Beam Contact Techniques",
              "minutes": 75,
              "objectives": [
                "Perform straight-beam contact scans for thickness and laminar discontinuities",
                "Plot angle-beam sound paths using skip distance and surface distance",
                "Select beam angle based on part geometry and expected discontinuity orientation"
              ],
              "topics": [
                "1.1 Contact",
                "1.1.1 Straight beam",
                "1.1.2 Angle beam"
              ],
              "media": [
                { "type": "video", "title": "Straight Down or at an Angle: Core Contact Techniques", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Angle-beam path plotter: skip distance and leg visualization", "status": "placeholder" },
                { "type": "diagram", "title": "Full-skip and half-skip beam paths in plate", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-6-2",
              "title": "Surface Waves, Plate Waves, and Pulse-Echo Transmission",
              "minutes": 75,
              "objectives": [
                "Describe generation and behavior of surface (Rayleigh) and plate (Lamb) waves",
                "Identify applications for surface-wave and plate-wave inspection",
                "Differentiate pulse-echo from through-transmission signal interpretation"
              ],
              "topics": [
                "1.1.3 Surface-wave and plate waves",
                "1.1.4 Pulse-echo transmission"
              ],
              "media": [
                { "type": "video", "title": "Waves That Follow the Surface: Rayleigh and Lamb Modes", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Wave-mode selector showing depth of penetration and sensitivity zones", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-6-3",
              "title": "Multiple-Transducer Techniques",
              "minutes": 60,
              "objectives": [
                "Describe pitch-catch and tandem transducer arrangements",
                "Explain when dual-element probes outperform single-element probes",
                "Set up a through-transmission test with separate transmitter and receiver"
              ],
              "topics": [
                "1.1.5 Multiple transducer"
              ],
              "media": [
                { "type": "video", "title": "Two Probes Are Better Than One: Pitch-Catch and Tandem", "duration": "09:00", "status": "placeholder" },
                { "type": "diagram", "title": "Pitch-catch, tandem, and through-transmission probe arrangements", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-6-4",
              "title": "Testing Curved Surfaces",
              "minutes": 60,
              "objectives": [
                "Explain how entry-surface curvature affects coupling and beam behavior",
                "Apply contoured wedges and shoes on cylindrical and tubular shapes",
                "Adjust technique when scanning from flat versus curved entry surfaces"
              ],
              "topics": [
                "1.1.6 Curved surfaces",
                "1.1.6.1 Flat entry surfaces",
                "1.1.6.2 Cylindrical and tubular shapes"
              ],
              "media": [
                { "type": "video", "title": "When the Part Isn't Flat: Scanning Curved Surfaces", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "Curvature effect explorer: beam behavior on pipe OD vs. flat plate", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Shoe contouring rules for tubular products", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-7",
          "title": "Immersion Testing Techniques",
          "cpSection": "UT Technique Course §1.2–1.3",
          "hours": 4.5,
          "lessons": [
            {
              "id": "ut1-7-1",
              "title": "Immersion Setups: Tanks, Water Columns, and Wheels",
              "minutes": 90,
              "objectives": [
                "Describe full-immersion, water-column (bubbler), and wheel transducer configurations",
                "Position a submerged test part and transducer for normal-incidence inspection",
                "Identify advantages and limitations of each immersion coupling approach"
              ],
              "topics": [
                "1.2 Immersion",
                "1.2.1 Transducer in water",
                "1.2.2 Water column, wheels, etc.",
                "1.2.3 Submerged test part"
              ],
              "media": [
                { "type": "video", "title": "Tanks, Bubblers, and Wheels: Immersion Coupling Options", "duration": "13:00", "status": "placeholder" },
                { "type": "diagram", "title": "Cross-sections of immersion tank, squirter, and wheel-probe systems", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Choosing an immersion configuration", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-7-2",
              "title": "Water Path, Focused Transducers, and Curved Parts",
              "minutes": 90,
              "objectives": [
                "Calculate minimum water-path distance using the 4:1 velocity relationship",
                "Explain how focused transducers improve resolution and signal-to-noise ratio",
                "Manipulate the sound beam for normal and angled incidence on curved surfaces"
              ],
              "topics": [
                "1.2.4 Sound beam path — transducer to part",
                "1.2.5 Focused transducers",
                "1.2.6 Curved surfaces"
              ],
              "media": [
                { "type": "video", "title": "Focusing Through Water: Beam Control in Immersion Testing", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Water-path and focal-zone simulator with curved-part refraction", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-7-3",
              "title": "Immersion Plate Waves, Through-Transmission, and Method Comparison",
              "minutes": 90,
              "objectives": [
                "Generate plate waves in immersion by controlling incident angle",
                "Compare pulse-echo and through-transmission immersion configurations",
                "Evaluate contact versus immersion methods for a given inspection problem"
              ],
              "topics": [
                "1.2.7 Plate waves",
                "1.2.8 Pulse-echo and through-transmission",
                "1.3 Comparison of contact and immersion methods"
              ],
              "media": [
                { "type": "video", "title": "Contact or Immersion? Choosing the Right Method", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Method-selection decision tree with industrial case examples", "status": "placeholder" },
                { "type": "reference", "title": "Comparison table: contact vs. immersion capabilities and limitations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-8",
          "title": "Calibration: Electronic and Functional",
          "cpSection": "UT Technique Course §2.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut1-8-1",
              "title": "Calibration Equipment and System Components",
              "minutes": 90,
              "objectives": [
                "Identify the calibration-relevant functions of displays, recorders, and alarms",
                "Describe automatic and semiautomatic scanning system components",
                "Explain the purpose of electronic distance-amplitude correction (DAC) circuitry"
              ],
              "topics": [
                "2.1 Equipment",
                "2.1.1 Monitor displays (amplitude, sweep, etc.)",
                "2.1.2 Recorders",
                "2.1.3 Alarms",
                "2.1.4 Automatic and semiautomatic systems",
                "2.1.5 Electronic distance/amplitude correction",
                "2.1.6 Transducers"
              ],
              "media": [
                { "type": "video", "title": "The Calibration Toolkit: Displays, Gates, Alarms, and DAC", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Automated UT system layout with recorder, alarm, and eDAC blocks", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: How electronic DAC normalizes amplitude with distance", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-8-2",
              "title": "Standardizing the Instrument Electronics",
              "minutes": 90,
              "objectives": [
                "Verify horizontal linearity and amplitude (vertical) linearity of an instrument",
                "Describe variable effects that degrade transmission accuracy",
                "Select appropriate standardization reflectors for electronic checks"
              ],
              "topics": [
                "2.2 Standardization of equipment electronics",
                "2.2.1 Variable effects",
                "2.2.2 Transmission accuracy",
                "2.2.3 Standardization requirements",
                "2.2.4 Standardization reflectors"
              ],
              "media": [
                { "type": "video", "title": "Trust Your Screen: Linearity and Electronic Standardization", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Linearity verification exercise: plot amplitude steps and screen divisions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-8-3",
              "title": "Inspection Standardization with Reference Blocks",
              "minutes": 90,
              "objectives": [
                "Standardize range and sensitivity by comparison with reference blocks",
                "List the pulse-echo variables that must be controlled during standardization",
                "Build a reference setup for planned straight-beam and angle-beam tests"
              ],
              "topics": [
                "2.3 Inspection standardization",
                "2.3.1 Comparison with reference blocks",
                "2.3.2 Pulse-echo variables",
                "2.3.3 Reference for planned tests (straight beam, angle beam, etc.)"
              ],
              "media": [
                { "type": "video", "title": "Block by Block: Building an Inspection Standardization", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "DAC curve construction lab on a virtual side-drilled-hole block", "status": "placeholder" },
                { "type": "reference", "title": "Step-by-step standardization checklists for straight- and angle-beam setups", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-8-4",
              "title": "Transmission Factors: Transducer, Couplant, and Material",
              "minutes": 90,
              "objectives": [
                "Explain how transducer condition and couplant variations affect calibrated sensitivity",
                "Apply transfer corrections for surface roughness and material differences",
                "Recognize when re-standardization is required during testing"
              ],
              "topics": [
                "2.3.4 Transmission factors",
                "2.3.5 Transducer",
                "2.3.6 Couplants",
                "2.3.7 Materials"
              ],
              "media": [
                { "type": "video", "title": "Why Calibrations Drift: Transducer, Couplant, and Material Factors", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Transfer-correction exercise: compare reference block and test part responses", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut1-9",
          "title": "Examination to Specific Procedures",
          "cpSection": "UT Technique Course §3.0–4.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut1-9-1",
              "title": "Straight-Beam Examination: Parameters and Test Standards",
              "minutes": 90,
              "objectives": [
                "Select transducer, frequency, and scan pattern per a written straight-beam procedure",
                "Apply the test standards and acceptance references called out in the procedure",
                "Set scanning sensitivity and coverage for laminar discontinuity detection"
              ],
              "topics": [
                "3.0 Straight-beam examination to specific procedures",
                "3.1 Selection of parameters",
                "3.2 Test standards"
              ],
              "media": [
                { "type": "video", "title": "Reading the Procedure: Straight-Beam Setup from Paper to Part", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Procedure-driven straight-beam scan of a virtual plate with seeded flaws", "status": "placeholder" },
                { "type": "reference", "title": "Anatomy of a UT procedure: scope, parameters, and acceptance references", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-9-2",
              "title": "Straight-Beam Examination: Evaluating Results and Reporting",
              "minutes": 90,
              "objectives": [
                "Evaluate straight-beam indications against procedure recording criteria",
                "Document indication location, amplitude, and extent on a test report",
                "Complete a straight-beam test report with all required entries"
              ],
              "topics": [
                "3.3 Evaluation of results",
                "3.4 Test reports"
              ],
              "media": [
                { "type": "video", "title": "From Indication to Ink: Evaluating and Reporting Straight-Beam Results", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Fill out a digital test report from a recorded scan dataset", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-9-3",
              "title": "Angle-Beam Examination: Parameters and Test Standards",
              "minutes": 90,
              "objectives": [
                "Select wedge angle, frequency, and scanning pattern per a written angle-beam procedure",
                "Standardize distance and sensitivity using the specified test standards",
                "Plan scan coverage using skip distance for full-volume examination"
              ],
              "topics": [
                "4.0 Angle-beam examination to specific procedures",
                "4.1 Selection of parameters",
                "4.2 Test standards"
              ],
              "media": [
                { "type": "video", "title": "Angles by the Book: Procedure-Driven Angle-Beam Setup", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual angle-beam examination with skip-distance scan planning", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut1-9-4",
              "title": "Angle-Beam Examination: Evaluating Results and Reporting",
              "minutes": 90,
              "objectives": [
                "Plot reflector position from sound-path, surface-distance, and depth data",
                "Evaluate angle-beam indications against procedure recording criteria",
                "Complete an angle-beam test report including plotting sketches"
              ],
              "topics": [
                "4.3 Evaluation of results",
                "4.4 Test reports"
              ],
              "media": [
                { "type": "video", "title": "Locating the Reflector: Angle-Beam Evaluation and Reporting", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Indication plotting exercise: convert sound path to depth and surface distance", "status": "placeholder" },
                { "type": "reference", "title": "Sample completed angle-beam examination reports (annotated)", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        }
      ]
    },
    {
      "level": "II",
      "targetHours": 40,
      "description": "Covers the CP-105 Ultrasonic Testing Evaluation Course: a technique review followed by evaluation of base-material product forms, weldments, and bonded structures, plus discontinuity detection, sizing, location, and final evaluation against applicable codes and standards. Prepares technicians to interpret, evaluate, and report UT results independently.",
      "finalExam": { "questions": 50, "passingScore": 80, "bank": "UT", "bankLevel": 2, "status": "placeholder" },
      "modules": [
        {
          "id": "ut2-1",
          "title": "Review of UT Principles, Equipment, and Standardization",
          "cpSection": "UT Evaluation Course §1.0",
          "hours": 5.5,
          "lessons": [
            {
              "id": "ut2-1-1",
              "title": "Principles of Ultrasonics: Level II Review",
              "minutes": 90,
              "objectives": [
                "Solve combined problems involving velocity, impedance, refraction, and mode conversion",
                "Predict beam behavior in multi-interface and anisotropic situations",
                "Diagnose signal anomalies using first-principles acoustics"
              ],
              "topics": [
                "1.1 Principles of ultrasonics"
              ],
              "media": [
                { "type": "video", "title": "Acoustics Under Pressure: Level II Principles Review", "duration": "14:00", "status": "placeholder" },
                { "type": "interactive", "title": "Rapid-fire principles drill with worked-solution feedback", "status": "placeholder" },
                { "type": "reference", "title": "Condensed UT physics review notes for Level II candidates", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-1-2",
              "title": "Equipment Review: A-scan, B-scan, C-scan, and Computerized Systems",
              "minutes": 90,
              "objectives": [
                "Interpret the same flaw as presented in A-scan, B-scan, and C-scan formats",
                "Describe data flow in computerized UT acquisition systems",
                "Select the display format best suited to a given evaluation task"
              ],
              "topics": [
                "1.2 Equipment",
                "1.2.1 A-scan",
                "1.2.2 B-scan",
                "1.2.3 C-scan",
                "1.2.4 Computerized systems"
              ],
              "media": [
                { "type": "video", "title": "Three Views of One Flaw: A-, B-, and C-scan Interpretation", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Display-format switcher: scan a virtual part and toggle A/B/C-scan views", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-1-3",
              "title": "Testing Techniques Review",
              "minutes": 75,
              "objectives": [
                "Match contact, immersion, and multiple-transducer techniques to inspection problems",
                "Justify technique selection in terms of access, geometry, and discontinuity type",
                "Identify technique-induced limitations that affect evaluation"
              ],
              "topics": [
                "1.3 Testing techniques"
              ],
              "media": [
                { "type": "video", "title": "Technique Selection Masterclass: Matching Method to Problem", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Case-based technique selection scenarios with scored decisions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-1-4",
              "title": "Standardization Review: Straight Beam, Angle Beam, Resonance, and Special Applications",
              "minutes": 75,
              "objectives": [
                "Perform straight-beam and angle-beam standardizations to a written procedure",
                "Describe resonance-based standardization and its applications",
                "Adapt standardization for special applications such as curved or coarse-grained parts"
              ],
              "topics": [
                "1.4 Standardization",
                "1.4.1 Straight beam",
                "1.4.2 Angle beam",
                "1.4.3 Resonance",
                "1.4.4 Special applications"
              ],
              "media": [
                { "type": "video", "title": "Standardization Revisited: Four Setups Every Level II Must Own", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Timed standardization challenge: straight-beam and angle-beam setups", "status": "placeholder" },
                { "type": "reference", "title": "Standardization quick-reference cards by technique", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-2",
          "title": "Evaluation of Base-Material Product Forms I: Ingots, Plate, Bar, and Pipe",
          "cpSection": "UT Evaluation Course §2.1–2.4",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut2-2-1",
              "title": "Ingots: Discontinuities and Ultrasonic Response",
              "minutes": 90,
              "objectives": [
                "Summarize the ingot casting process and where discontinuities originate",
                "Predict the typical orientation of pipe, porosity, and nonmetallic inclusions in ingots",
                "Evaluate ingot indications against applicable codes and standards"
              ],
              "topics": [
                "2.1 Ingots",
                "2.1.1 Process review",
                "2.1.2 Types, origin, and typical orientation of discontinuities",
                "2.1.3 Response of discontinuities to ultrasound",
                "2.1.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Born in the Mold: Ingot Discontinuities and Their Echoes", "duration": "13:00", "status": "placeholder" },
                { "type": "diagram", "title": "Ingot cross-section: shrinkage pipe, segregation, and inclusion zones", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: How solidification creates ingot discontinuities", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-2-2",
              "title": "Plate and Sheet: Rolling Process and Laminar Discontinuities",
              "minutes": 90,
              "objectives": [
                "Explain how rolling elongates ingot discontinuities into laminations and stringers",
                "Select straight-beam techniques for laminar discontinuity detection in plate",
                "Apply common plate scanning standards and grid acceptance criteria"
              ],
              "topics": [
                "2.2 Plate and sheet",
                "2.2.1 Rolling process",
                "2.2.2 Types, origin, and typical orientation of discontinuities",
                "2.2.3 Response of discontinuities to ultrasound",
                "2.2.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Flattened Flaws: How Rolling Creates Laminations", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual plate scan: map a lamination and apply grid acceptance criteria", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-2-3",
              "title": "Bar and Rod: Forming Process and Centerline Discontinuities",
              "minutes": 90,
              "objectives": [
                "Describe how bar and rod forming orients discontinuities along the product axis",
                "Recognize ultrasonic responses from centerline pipe, bursts, and stringers",
                "Evaluate bar and rod indications against applicable codes and standards"
              ],
              "topics": [
                "2.3 Bar and rod",
                "2.3.1 Forming process",
                "2.3.2 Types, origin, and typical orientation of discontinuities",
                "2.3.3 Response of discontinuities to ultrasound",
                "2.3.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Down the Centerline: Bar and Rod Evaluation", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Bar cross-sections showing bursts, pipe, and stringer orientations with scan directions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-2-4",
              "title": "Pipe and Tubular Products: Manufacturing and Evaluation",
              "minutes": 90,
              "objectives": [
                "Compare seamless and welded pipe manufacturing and their characteristic discontinuities",
                "Set up circumferential and axial angle-beam scans using notch standards",
                "Evaluate tubular product indications against applicable codes and standards"
              ],
              "topics": [
                "2.4 Pipe and tubular products",
                "2.4.1 Manufacturing process",
                "2.4.2 Types, origin, and typical orientation of discontinuities",
                "2.4.3 Response of discontinuities to ultrasound",
                "2.4.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Around the Circumference: UT of Pipe and Tube", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual pipe inspection: ID/OD notch standardization and seam scanning", "status": "placeholder" },
                { "type": "reference", "title": "Summary of common tubular product UT specifications and notch standards", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-3",
          "title": "Evaluation of Base-Material Product Forms II: Forgings, Castings, Composites, and Other Forms",
          "cpSection": "UT Evaluation Course §2.5–2.8",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut2-3-1",
              "title": "Forgings: Flow Lines and Discontinuity Evaluation",
              "minutes": 90,
              "objectives": [
                "Explain how forging flow orients discontinuities parallel to the working direction",
                "Recognize responses from forging bursts, laps, and flakes",
                "Evaluate forging indications against applicable codes and standards"
              ],
              "topics": [
                "2.5 Forgings",
                "2.5.1 Process review",
                "2.5.2 Types, origin, and typical orientation of discontinuities",
                "2.5.3 Response of discontinuities to ultrasound",
                "2.5.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Following the Grain: Ultrasonic Evaluation of Forgings", "duration": "13:00", "status": "placeholder" },
                { "type": "diagram", "title": "Forging flow lines with burst and lap locations and recommended scan directions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-3-2",
              "title": "Castings: Coarse Grains and Casting Discontinuities",
              "minutes": 90,
              "objectives": [
                "Describe shrinkage, porosity, hot tears, and cold shuts and where they form in castings",
                "Adapt frequency and technique for coarse-grained, attenuative cast structures",
                "Evaluate casting indications against applicable codes and standards"
              ],
              "topics": [
                "2.6 Castings",
                "2.6.1 Process review",
                "2.6.2 Types, origin, and typical orientation of discontinuities",
                "2.6.3 Response of ultrasound to discontinuities",
                "2.6.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Noise vs. Signal: Testing Coarse-Grained Castings", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Frequency-selection lab on a virtual casting with high grain noise", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Casting discontinuity formation and detection limits", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-3-3",
              "title": "Composite Structures: Layup Defects and Ultrasonic Response",
              "minutes": 90,
              "objectives": [
                "Identify delaminations, porosity, and foreign material in laminated composites",
                "Select pulse-echo and through-transmission techniques for composite evaluation",
                "Evaluate composite indications against applicable codes and standards"
              ],
              "topics": [
                "2.7 Composite structures",
                "2.7.1 Process review",
                "2.7.2 Types, origin, and typical orientation of discontinuities",
                "2.7.3 Response of ultrasound to discontinuities",
                "2.7.4 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Layer by Layer: UT Evaluation of Composite Laminates", "duration": "13:00", "status": "placeholder" },
                { "type": "diagram", "title": "C-scan signatures of delamination, porosity, and inclusions in a laminate", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-3-4",
              "title": "Other Product Forms: Rubber, Glass, and Nonmetallics",
              "minutes": 90,
              "objectives": [
                "Adapt UT parameters for low-velocity, high-attenuation materials such as rubber and glass",
                "Compare discontinuity responses across metallic and nonmetallic product forms",
                "Select evaluation criteria when standard codes do not directly address the material"
              ],
              "topics": [
                "2.8 Other product forms as applicable — rubber, glass, etc."
              ],
              "media": [
                { "type": "video", "title": "Beyond Metals: UT of Rubber, Glass, and Other Materials", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Material-properties explorer: velocity, impedance, and attenuation across product forms", "status": "placeholder" },
                { "type": "reference", "title": "Parameter guide for nonmetallic and specialty material testing", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-4",
          "title": "Evaluation of Weldments",
          "cpSection": "UT Evaluation Course §3.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut2-4-1",
              "title": "Welding Processes and Weld Geometries",
              "minutes": 90,
              "objectives": [
                "Summarize common arc welding processes and how each influences discontinuity formation",
                "Identify joint types, groove configurations, and weld zones relevant to scanning",
                "Plan angle-beam coverage based on weld geometry and access"
              ],
              "topics": [
                "3.1 Welding processes",
                "3.2 Weld geometries"
              ],
              "media": [
                { "type": "video", "title": "Know the Weld Before You Scan: Processes and Joint Geometry", "duration": "13:00", "status": "placeholder" },
                { "type": "diagram", "title": "Weld joint geometries with heat-affected zones and scan access maps", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-4-2",
              "title": "Welding Discontinuities: Types, Origin, and Orientation",
              "minutes": 90,
              "objectives": [
                "Describe formation mechanisms for cracks, lack of fusion, incomplete penetration, slag, and porosity",
                "Predict typical location and orientation of each weld discontinuity type",
                "Relate welding-process variables to expected discontinuity populations"
              ],
              "topics": [
                "3.3 Welding discontinuities",
                "3.4 Origin and typical orientation of discontinuities"
              ],
              "media": [
                { "type": "video", "title": "The Usual Suspects: Weld Discontinuities and Where They Hide", "duration": "14:00", "status": "placeholder" },
                { "type": "diagram", "title": "Weld cross-section atlas: crack, LOF, IP, slag, and porosity locations", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Why each weld discontinuity forms where it does", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-4-3",
              "title": "Ultrasonic Response of Weld Discontinuities",
              "minutes": 90,
              "objectives": [
                "Differentiate planar and volumetric reflector responses on the A-scan",
                "Use echo dynamics and probe manipulation to characterize weld indications",
                "Distinguish geometric indications (root, cap, mismatch) from true discontinuities"
              ],
              "topics": [
                "3.5 Response of discontinuities to ultrasound"
              ],
              "media": [
                { "type": "video", "title": "Reading the Echo: Planar vs. Volumetric Weld Reflectors", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Virtual weld scan: characterize seeded LOF, slag, porosity, and root geometry", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-4-4",
              "title": "Weld Acceptance: Applicable Codes and Standards",
              "minutes": 90,
              "objectives": [
                "Locate UT acceptance criteria within representative structural and pressure-equipment codes",
                "Apply amplitude- and length-based weld acceptance criteria to recorded indications",
                "Document weld evaluations with code-required report content"
              ],
              "topics": [
                "3.6 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Accept or Reject: Applying Weld UT Acceptance Criteria", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Code-application exercise: disposition a set of recorded weld indications", "status": "placeholder" },
                { "type": "reference", "title": "Comparison of weld UT acceptance approaches across major code families", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-5",
          "title": "Evaluation of Bonded Structures",
          "cpSection": "UT Evaluation Course §4.0",
          "hours": 4.5,
          "lessons": [
            {
              "id": "ut2-5-1",
              "title": "Bonded Structure Manufacturing and Discontinuity Types",
              "minutes": 90,
              "objectives": [
                "Describe adhesive bonding and laminated/honeycomb construction processes",
                "Identify disbonds, voids, and weak-bond conditions and how each forms",
                "Map where bondline discontinuities typically occur in built-up structures"
              ],
              "topics": [
                "4.1 Manufacturing processes",
                "4.2 Types of discontinuities"
              ],
              "media": [
                { "type": "video", "title": "Holding It Together: Bonded Structures and How They Fail", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Bonded assembly cross-sections with disbond, void, and porosity locations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-5-2",
              "title": "Ultrasonic Response of Bondline Discontinuities",
              "minutes": 90,
              "objectives": [
                "Predict the origin and typical orientation of bondline discontinuities",
                "Interpret pulse-echo, through-transmission, and resonance responses from disbonds",
                "Differentiate near-side and far-side disbond signatures"
              ],
              "topics": [
                "4.3 Origin and typical orientation of discontinuities",
                "4.4 Response of discontinuities to ultrasound"
              ],
              "media": [
                { "type": "video", "title": "Signals from the Bondline: Detecting Disbonds and Voids", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Bond-testing simulator: pulse-echo and resonance responses over good and bad bonds", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-5-3",
              "title": "Bonded Structure Acceptance Standards",
              "minutes": 90,
              "objectives": [
                "Apply applicable codes and standards to bonded structure evaluations",
                "Define recording and acceptance criteria for disbond size and density",
                "Prepare an evaluation report for a bonded assembly inspection"
              ],
              "topics": [
                "4.5 Applicable codes/standards"
              ],
              "media": [
                { "type": "video", "title": "Disposition the Disbond: Standards for Bonded Structures", "duration": "10:00", "status": "placeholder" },
                { "type": "interactive", "title": "C-scan disbond mapping exercise with acceptance-criteria overlay", "status": "placeholder" },
                { "type": "reference", "title": "Representative bond-inspection specification requirements summary", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-6",
          "title": "Discontinuity Detection, Sizing, and Location",
          "cpSection": "UT Evaluation Course §5.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut2-6-1",
              "title": "Sensitivity to Reflections",
              "minutes": 90,
              "objectives": [
                "Explain how discontinuity size, type, and location govern echo response",
                "Select detection techniques appropriate to expected discontinuity characteristics",
                "Relate wave characteristics and material velocity to detection sensitivity"
              ],
              "topics": [
                "5.1 Sensitivity to reflections",
                "5.1.1 Size, type, and location of discontinuities",
                "5.1.2 Techniques used in detection",
                "5.1.3 Wave characteristics",
                "5.1.4 Material and velocity"
              ],
              "media": [
                { "type": "video", "title": "What the Beam Can See: Factors Governing Detection", "duration": "13:00", "status": "placeholder" },
                { "type": "interactive", "title": "Detection-sensitivity explorer: vary flaw size, depth, and orientation", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-6-2",
              "title": "Resolution and Operator Discrimination",
              "minutes": 90,
              "objectives": [
                "Use standard reference comparisons and part history to anticipate discontinuity types",
                "Explain how frequency and damping affect resolution of closely spaced reflectors",
                "Describe degrees of operator discrimination and probability-based interpretation"
              ],
              "topics": [
                "5.2 Resolution",
                "5.2.1 Standard reference comparisons",
                "5.2.2 History of part",
                "5.2.3 Probability of type of discontinuity",
                "5.2.4 Degrees of operator discrimination",
                "5.2.5 Effects of ultrasonic frequency",
                "5.2.6 Damping effects"
              ],
              "media": [
                { "type": "video", "title": "Splitting the Signal: Resolution, Frequency, and Damping", "duration": "12:00", "status": "placeholder" },
                { "type": "simulation", "title": "Resolution lab: separate stacked reflectors by adjusting frequency and damping", "status": "placeholder" },
                { "type": "narration", "title": "Voiceover script: Using part history to sharpen interpretation", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-6-3",
              "title": "Determining Discontinuity Size",
              "minutes": 90,
              "objectives": [
                "Size discontinuities using amplitude comparison and transducer-movement (probe motion) techniques",
                "Apply two-dimensional testing techniques to estimate reflector extent",
                "Interpret signal patterns and display indications to refine size estimates"
              ],
              "topics": [
                "5.3 Determination of discontinuity size",
                "5.3.1 Various monitor displays and meter indications",
                "5.3.2 Transducer movement versus display",
                "5.3.3 Two-dimensional testing techniques",
                "5.3.4 Signal patterns"
              ],
              "media": [
                { "type": "video", "title": "How Big Is It? Amplitude and Probe-Motion Sizing", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "6 dB drop sizing exercise on virtual planar and volumetric reflectors", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-6-4",
              "title": "Locating Discontinuities",
              "minutes": 90,
              "objectives": [
                "Convert sweep position and amplitude data into reflector depth and position",
                "Apply systematic search techniques to fully map a discontinuity",
                "Cross-check location results across display formats"
              ],
              "topics": [
                "5.4 Location of discontinuity",
                "5.4.1 Various monitor displays",
                "5.4.2 Amplitude and linear time",
                "5.4.3 Search technique"
              ],
              "media": [
                { "type": "video", "title": "Pinpointing the Flaw: Location from Time and Amplitude", "duration": "11:00", "status": "placeholder" },
                { "type": "interactive", "title": "Triangulation exercise: locate a reflector from multiple probe positions", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        },
        {
          "id": "ut2-7",
          "title": "Evaluation and Code Interpretation",
          "cpSection": "UT Evaluation Course §6.0",
          "hours": 6.0,
          "lessons": [
            {
              "id": "ut2-7-1",
              "title": "Comparison Procedures: Standards and References",
              "minutes": 90,
              "objectives": [
                "Evaluate indications by comparison with calibrated standards and reference reflectors",
                "Explain the limitations of reference-reflector comparison for natural flaws",
                "Maintain evaluation traceability to the governing standard"
              ],
              "topics": [
                "6.1 Comparison procedures",
                "6.1.1 Standards and references"
              ],
              "media": [
                { "type": "video", "title": "Measured Against the Standard: Comparison-Based Evaluation", "duration": "12:00", "status": "placeholder" },
                { "type": "diagram", "title": "Reference reflector hierarchy: FBH, SDH, and notch equivalences", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-7-2",
              "title": "Amplitude-Area-Distance Relationships and Other NDT Results",
              "minutes": 90,
              "objectives": [
                "Apply amplitude, area, and distance relationships (DAC/DGS concepts) in evaluation",
                "Correct evaluations for attenuation and distance effects",
                "Integrate results from complementary NDT methods into the UT disposition"
              ],
              "topics": [
                "6.1.2 Amplitude, area, and distance relationship",
                "6.1.3 Application of results of other NDT methods"
              ],
              "media": [
                { "type": "video", "title": "Bigger, Closer, Louder: Amplitude-Area-Distance in Practice", "duration": "13:00", "status": "placeholder" },
                { "type": "interactive", "title": "DAC/DGS evaluation workbench: disposition indications with distance correction", "status": "placeholder" },
                { "type": "reference", "title": "Cross-method correlation guide: combining UT with RT, MT, and PT findings", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-7-3",
              "title": "Object Appraisal: Part History and Intended Use",
              "minutes": 90,
              "objectives": [
                "Incorporate manufacturing history and service exposure into indication assessment",
                "Weigh intended use and loading conditions when judging discontinuity significance",
                "Document the engineering rationale behind an appraisal decision"
              ],
              "topics": [
                "6.2 Object appraisal",
                "6.2.1 History of part",
                "6.2.2 Intended use of part"
              ],
              "media": [
                { "type": "video", "title": "Context Matters: Appraising Parts by History and Service", "duration": "12:00", "status": "placeholder" },
                { "type": "interactive", "title": "Appraisal case studies: same indication, different service consequences", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            },
            {
              "id": "ut2-7-4",
              "title": "Code Interpretation and Final Disposition",
              "minutes": 90,
              "objectives": [
                "Interpret existing and applicable code requirements for recorded indications",
                "Classify discontinuity type and location and apply the correct acceptance clause",
                "Produce a complete, defensible final evaluation report"
              ],
              "topics": [
                "6.2.3 Existing and applicable code interpretation",
                "6.2.4 Type of discontinuity and location"
              ],
              "media": [
                { "type": "video", "title": "The Final Call: Code Interpretation and Disposition", "duration": "13:00", "status": "placeholder" },
                { "type": "simulation", "title": "Capstone evaluation: scan, size, locate, and disposition a virtual component to a code", "status": "placeholder" },
                { "type": "reference", "title": "Model final evaluation report with annotated code citations", "status": "placeholder" }
              ],
              "check": { "type": "knowledge-check", "questions": 5, "status": "placeholder" }
            }
          ],
          "moduleQuiz": { "questions": 10, "passingScore": 80, "status": "placeholder" }
        }
      ]
    }
  ]
}
;